'use server'

import { createClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/supabase/profile-helper'
import { revalidatePath } from 'next/cache'
import type { NewPaymentInput, Payment, CashRegisterSummary, StudentPaymentInfo } from '../types'

export async function getTodayPayments(): Promise<Payment[]> {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return []

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      profiles!payments_student_id_fkey (full_name)
    `)
    .eq('center_id', profile.center_id)
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Payment[]
}

export async function getCashRegisterSummary(): Promise<CashRegisterSummary> {
  const payments = await getTodayPayments()

  const studentPayments = payments.filter((p) => p.payment_type === 'student' || !p.payment_type)
  const productPayments = payments.filter((p) => p.payment_type === 'product')

  const cash_total = payments
    .filter((p) => p.method === 'cash')
    .reduce((sum, p) => sum + Number(p.final_amount), 0)

  const transfer_payments = payments.filter((p) => p.method === 'transfer')
  const transfer_total = transfer_payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const surcharge_total = transfer_payments.reduce(
    (sum, p) => sum + (Number(p.final_amount) - Number(p.amount)),
    0
  )

  const student_total = studentPayments.reduce((sum, p) => sum + Number(p.final_amount), 0)
  const product_total = productPayments.reduce((sum, p) => sum + Number(p.final_amount), 0)

  return {
    cash_total,
    transfer_total,
    surcharge_total,
    student_total,
    product_total,
    grand_total: cash_total + transfer_total + surcharge_total,
  }
}

export async function getStudentPaymentInfo(studentId: string): Promise<StudentPaymentInfo> {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) throw new Error('No center found')

  // Incluir membresías activas, suspendidas y vencidas para poder cobrar la renovación
  const { data: memberships } = await supabase
    .from('memberships')
    .select('discipline_id')
    .eq('student_id', studentId)
    .eq('center_id', profile.center_id)
    .in('status', ['active', 'suspended', 'expired'])

  const disciplineIds = (memberships ?? []).map((m) => m.discipline_id).filter(Boolean)

  if (disciplineIds.length === 0) {
    return { disciplines: [], base_amount: 0, has_multi_discount: false }
  }

  const { data: disciplines } = await supabase
    .from('disciplines')
    .select('id, name, monthly_price, modality')
    .in('id', disciplineIds)

  const disciplineList = (disciplines ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    monthly_price: Number(d.monthly_price ?? 0),
    modality: (d.modality ?? 'anual') as 'anual' | 'seminario',
  }))

  const base_amount = disciplineList.reduce((sum, d) => sum + d.monthly_price, 0)

  // Multi-discipline discount: 2+ annual disciplines
  const annualCount = disciplineList.filter((d) => d.modality === 'anual').length
  const has_multi_discount = annualCount >= 2

  return { disciplines: disciplineList, base_amount, has_multi_discount }
}

export async function registerPayment(input: NewPaymentInput) {
  const supabase = await createClient()
  const adminProfile = await getMyProfile()
  if (!adminProfile?.center_id) throw new Error('No center found')

  const is_transfer = input.method === 'transfer'
  const is_product = input.payment_type === 'product'

  // Calculate final amount with all rules
  let finalAmount = input.amount
  if (!is_product) {
    // Apply multi-discipline discount
    if (input.multi_discipline_discount) {
      finalAmount = finalAmount - (input.amount * 0.10)
    }
    // Apply late surcharge
    if (input.late_surcharge) {
      const base = input.multi_discipline_discount ? input.amount * 0.90 : input.amount
      finalAmount = base + (base * 0.10)
    } else if (input.multi_discipline_discount) {
      finalAmount = input.amount * 0.90
    }
  }
  // Apply transfer surcharge
  if (is_transfer) {
    finalAmount = finalAmount * 1.1
  }

  let membership_id: string | null = null
  if (!is_product && input.student_id) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('id')
      .eq('student_id', input.student_id)
      .eq('center_id', adminProfile.center_id)
      .in('status', ['active', 'suspended', 'expired'])
      .maybeSingle()
    membership_id = membership?.id ?? null
  }

  const { error } = await supabase.from('payments').insert({
    student_id: input.student_id ?? null,
    center_id: adminProfile.center_id,
    membership_id,
    amount: input.amount,
    method: input.method,
    payment_type: input.payment_type ?? 'student',
    product_name: input.product_name ?? null,
    transfer_surcharge: is_transfer,
    late_surcharge: input.late_surcharge ?? false,
    multi_discipline_discount: input.multi_discipline_discount ?? false,
    final_amount: Math.round(finalAmount * 100) / 100,
    notes: input.notes ?? null,
    registered_by: adminProfile.id,
  })

  if (error) throw error

  // Reactivar membresías suspendidas/vencidas y desbloquear todas al registrar un pago
  if (!is_product && input.student_id) {
    await supabase
      .from('memberships')
      .update({ status: 'active', is_blocked: false })
      .eq('student_id', input.student_id)
      .eq('center_id', adminProfile.center_id)
      .in('status', ['suspended', 'expired'])
    // También desbloquear las ya activas por si acaso
    await supabase
      .from('memberships')
      .update({ is_blocked: false })
      .eq('student_id', input.student_id)
      .eq('center_id', adminProfile.center_id)
      .eq('status', 'active')
  }

  revalidatePath('/admin/payments')
}

export async function getActiveStudents() {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return []

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('center_id', profile.center_id)
    .eq('role', 'student')
    .eq('is_active', true)
    .order('full_name')

  return data ?? []
}
