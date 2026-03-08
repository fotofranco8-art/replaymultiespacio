'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getMyProfile } from '@/lib/supabase/profile-helper'
import { revalidatePath } from 'next/cache'
import type { NewStudentInput, StudentWithMembership } from '../types'

export async function getStudents(): Promise<StudentWithMembership[]> {
  const admin = createAdminClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return []

  // Step 1: get student profiles
  const { data: students, error: studentsError } = await admin
    .from('profiles')
    .select('id, full_name, email, phone, is_active, center_id, created_at')
    .eq('role', 'student')
    .eq('center_id', profile.center_id)
    .order('full_name')
  if (studentsError) {
    console.error('[getStudents] profiles error:', JSON.stringify(studentsError))
    return []
  }
  if (!students?.length) return []

  // Step 2: get memberships (no nested join needed)
  const studentIds = students.map((s) => s.id)
  const { data: memberships, error: membershipsError } = await admin
    .from('memberships')
    .select('id, student_id, plan_name, monthly_fee, classes_per_month, status, discipline_id')
    .in('student_id', studentIds)
  if (membershipsError) {
    console.error('[getStudents] memberships error:', JSON.stringify(membershipsError))
    return students.map((s) => ({ ...s, memberships: [] })) as unknown as StudentWithMembership[]
  }

  // Step 3: get discipline names for the discipline_ids found
  const disciplineIds = [...new Set((memberships ?? []).map((m) => m.discipline_id).filter(Boolean))]
  const disciplineMap: Record<string, string> = {}
  if (disciplineIds.length > 0) {
    const { data: disciplines } = await admin
      .from('disciplines')
      .select('id, name')
      .in('id', disciplineIds)
    for (const d of disciplines ?? []) {
      disciplineMap[d.id] = d.name
    }
  }

  // Merge
  return students.map((s) => ({
    ...s,
    memberships: (memberships ?? [])
      .filter((m) => m.student_id === s.id)
      .map((m) => ({
        ...m,
        disciplines: m.discipline_id ? { name: disciplineMap[m.discipline_id] ?? '' } : null,
      })),
  })) as unknown as StudentWithMembership[]
}

export async function inviteStudent(input: NewStudentInput) {
  const admin = createAdminClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) throw new Error('No center found')

  // Invite user via email — triggers auto-profile creation via DB trigger
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

  if (inviteError) throw inviteError

  const studentId = invited.user.id

  // Upsert profile manually as backup in case the DB trigger didn't run
  await admin.from('profiles').upsert({
    id: studentId,
    center_id: profile.center_id,
    role: 'student',
    full_name: input.full_name,
    email: input.email,
    phone: input.phone ?? null,
    is_active: true,
  }, { onConflict: 'id' })

  const { error: membershipError } = await admin.from('memberships').insert({
    student_id: studentId,
    center_id: profile.center_id,
    discipline_id: input.discipline_id || null,
    plan_name: input.plan_name,
    monthly_fee: input.monthly_fee,
    classes_per_month: input.classes_per_month,
    status: 'active',
    start_date: new Date().toISOString().split('T')[0],
  })

  if (membershipError) throw membershipError

  await admin.from('recovery_balance').insert({
    student_id: studentId,
    center_id: profile.center_id,
    balance: 0,
  })

  revalidatePath('/admin/students')
}

export async function toggleStudentStatus(studentId: string, isActive: boolean) {
  const admin = createAdminClient()
  await admin.from('profiles').update({ is_active: isActive }).eq('id', studentId)
  revalidatePath('/admin/students')
}
