'use server'

import { createClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/supabase/profile-helper'
import { revalidatePath } from 'next/cache'
import type { NewPaymentInput, Payment, CashRegisterSummary } from '../types'

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

  const cash_total = payments
    .filter((p) => p.method === 'cash')
    .reduce((sum, p) => sum + Number(p.final_amount), 0)

  const transfer_payments = payments.filter((p) => p.method === 'transfer')
  const transfer_total = transfer_payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const surcharge_total = transfer_payments.reduce(
    (sum, p) => sum + (Number(p.final_amount) - Number(p.amount)),
    0
  )

  return {
    cash_total,
    transfer_total,
    surcharge_total,
    grand_total: cash_total + transfer_total + surcharge_total,
  }
}

export async function registerPayment(input: NewPaymentInput) {
  const supabase = await createClient()
  const adminProfile = await getMyProfile()
  if (!adminProfile?.center_id) throw new Error('No center found')

  const is_transfer = input.method === 'transfer'
  const final_amount = is_transfer ? input.amount * 1.1 : input.amount

  // Find active membership for the student
  const { data: membership } = await supabase
    .from('memberships')
    .select('id')
    .eq('student_id', input.student_id)
    .eq('center_id', adminProfile.center_id)
    .eq('status', 'active')
    .maybeSingle()

  const { error } = await supabase.from('payments').insert({
    student_id: input.student_id,
    center_id: adminProfile.center_id,
    membership_id: membership?.id ?? null,
    amount: input.amount,
    method: input.method,
    transfer_surcharge: is_transfer,
    final_amount,
    notes: input.notes ?? null,
    registered_by: adminProfile.id,
  })

  if (error) throw error

  // Unblock QR when payment is registered
  await supabase
    .from('memberships')
    .update({ is_blocked: false })
    .eq('student_id', input.student_id)
    .eq('center_id', adminProfile.center_id)
    .eq('status', 'active')

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
