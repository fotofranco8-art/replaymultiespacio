'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getMyProfile } from '@/lib/supabase/profile-helper'
import { revalidatePath } from 'next/cache'
import type { NewStudentInput, StudentWithMembership, UpdateStudentInput } from '../types'

export async function getStudents(): Promise<StudentWithMembership[]> {
  const admin = createAdminClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return []

  const { data: students, error: studentsError } = await admin
    .from('profiles')
    .select('id, full_name, email, phone, legajo, is_active, center_id, created_at')
    .eq('role', 'student')
    .eq('center_id', profile.center_id)
    .order('full_name')
  if (studentsError) {
    console.error('[getStudents] profiles error:', JSON.stringify(studentsError))
    return []
  }
  if (!students?.length) return []

  const studentIds = students.map((s) => s.id)
  const { data: memberships, error: membershipsError } = await admin
    .from('memberships')
    .select('id, student_id, plan_name, monthly_fee, classes_per_month, status, discipline_id')
    .in('student_id', studentIds)
  if (membershipsError) {
    console.error('[getStudents] memberships error:', JSON.stringify(membershipsError))
    return students.map((s) => ({ ...s, memberships: [] })) as unknown as StudentWithMembership[]
  }

  const disciplineIds = [...new Set((memberships ?? []).map((m) => m.discipline_id).filter(Boolean))]
  const disciplineMap: Record<string, { name: string; color: string; modality: string }> = {}
  if (disciplineIds.length > 0) {
    const { data: disciplines } = await admin
      .from('disciplines')
      .select('id, name, color, modality')
      .in('id', disciplineIds)
    for (const d of disciplines ?? []) {
      disciplineMap[d.id] = { name: d.name, color: d.color, modality: d.modality ?? 'anual' }
    }
  }

  return students.map((s) => ({
    ...s,
    memberships: (memberships ?? [])
      .filter((m) => m.student_id === s.id)
      .map((m) => ({
        ...m,
        disciplines: m.discipline_id ? disciplineMap[m.discipline_id] ?? null : null,
      })),
  })) as unknown as StudentWithMembership[]
}

export async function getStudentWithDetails(studentId: string) {
  const admin = createAdminClient()
  const { data: student } = await admin
    .from('profiles')
    .select('id, full_name, email, phone, legajo, is_active')
    .eq('id', studentId)
    .single()

  const { data: memberships } = await admin
    .from('memberships')
    .select('discipline_id')
    .eq('student_id', studentId)
    .eq('status', 'active')

  return {
    ...student,
    discipline_ids: (memberships ?? []).map((m) => m.discipline_id).filter(Boolean) as string[],
  }
}

export async function inviteStudent(input: NewStudentInput) {
  const admin = createAdminClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) throw new Error('No center found')

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    input.email,
    {
      data: {
        full_name: input.full_name,
        role: 'student',
        center_id: profile.center_id,
        phone: input.phone ?? null,
      },
    }
  )

  if (inviteError) {
    if (inviteError.status === 429 || inviteError.message?.includes('rate limit')) {
      throw new Error('Límite de emails alcanzado. Esperá unos minutos e intentá de nuevo.')
    }
    if (inviteError.status === 422 || inviteError.message?.includes('already been registered')) {
      throw new Error('Este email ya está registrado en el sistema.')
    }
    throw new Error(inviteError.message ?? 'Error al invitar alumno')
  }

  const studentId = invited.user.id

  await admin.from('profiles').upsert({
    id: studentId,
    center_id: profile.center_id,
    role: 'student',
    full_name: input.full_name,
    email: input.email,
    phone: input.phone ?? null,
    legajo: input.legajo ?? null,
    is_active: true,
  }, { onConflict: 'id' })

  // Fetch discipline prices and create one membership per discipline
  if (input.discipline_ids.length > 0) {
    const { data: disciplines } = await admin
      .from('disciplines')
      .select('id, name, monthly_price')
      .in('id', input.discipline_ids)

    const disciplineMap = Object.fromEntries((disciplines ?? []).map((d) => [d.id, d]))

    await admin.from('memberships').insert(
      input.discipline_ids.map((discipline_id) => {
        const disc = disciplineMap[discipline_id]
        return {
          student_id: studentId,
          center_id: profile.center_id!,
          discipline_id,
          plan_name: disc?.name ?? 'Plan Mensual',
          monthly_fee: disc?.monthly_price ?? 0,
          classes_per_month: null,
          status: 'active',
          start_date: new Date().toISOString().split('T')[0],
        }
      })
    )
  }

  await admin.from('recovery_balance').insert({
    student_id: studentId,
    center_id: profile.center_id,
    balance: 0,
  })

  revalidatePath('/admin/students')
}

export async function updateStudent(studentId: string, input: UpdateStudentInput) {
  const admin = createAdminClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) throw new Error('No center found')

  await admin.from('profiles').update({
    full_name: input.full_name,
    phone: input.phone ?? null,
    legajo: input.legajo ?? null,
  }).eq('id', studentId)

  // Re-sync memberships: delete existing active ones and re-create
  await admin.from('memberships')
    .update({ status: 'expired' })
    .eq('student_id', studentId)
    .eq('status', 'active')

  if (input.discipline_ids.length > 0) {
    const { data: disciplines } = await admin
      .from('disciplines')
      .select('id, name, monthly_price')
      .in('id', input.discipline_ids)

    const disciplineMap = Object.fromEntries((disciplines ?? []).map((d) => [d.id, d]))

    await admin.from('memberships').insert(
      input.discipline_ids.map((discipline_id) => {
        const disc = disciplineMap[discipline_id]
        return {
          student_id: studentId,
          center_id: profile.center_id!,
          discipline_id,
          plan_name: disc?.name ?? 'Plan Mensual',
          monthly_fee: disc?.monthly_price ?? 0,
          classes_per_month: null,
          status: 'active',
          start_date: new Date().toISOString().split('T')[0],
        }
      })
    )
  }

  revalidatePath('/admin/students')
}

export async function toggleStudentStatus(studentId: string, isActive: boolean) {
  const admin = createAdminClient()
  await admin.from('profiles').update({ is_active: isActive }).eq('id', studentId)
  revalidatePath('/admin/students')
}

export async function bulkInviteStudents(
  students: Array<{ full_name: string; email: string; phone?: string }>
): Promise<{ success: number; errors: string[] }> {
  const profile = await getMyProfile()
  if (!profile?.center_id) throw new Error('No se pudo obtener el centro')

  const results = { success: 0, errors: [] as string[] }

  for (const student of students) {
    try {
      await inviteStudent({
        full_name: student.full_name,
        email: student.email,
        phone: student.phone,
        discipline_ids: [],
      })
      results.success++
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido'
      results.errors.push(`${student.email}: ${msg}`)
    }
  }

  revalidatePath('/admin/students')
  return results
}
