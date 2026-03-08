'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMyProfile } from '@/lib/supabase/profile-helper'
import { revalidatePath } from 'next/cache'
import type { NewStudentInput, StudentWithMembership } from '../types'

export async function getStudents(): Promise<StudentWithMembership[]> {
  const admin = createAdminClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return []

  const { data, error } = await admin
    .from('profiles')
    .select(`
      id, full_name, email, phone, is_active, center_id, created_at,
      memberships (id, plan_name, monthly_fee, classes_per_month, status, discipline_id, disciplines(name))
    `)
    .eq('role', 'student')
    .eq('center_id', profile.center_id)
    .order('full_name')

  if (error) throw error
  return (data ?? []) as unknown as StudentWithMembership[]
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
  const supabase = await createClient()

  const { error: membershipError } = await supabase.from('memberships').insert({
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

  await supabase.from('recovery_balance').insert({
    student_id: studentId,
    center_id: profile.center_id,
    balance: 0,
  })

  revalidatePath('/admin/students')
}

export async function toggleStudentStatus(studentId: string, isActive: boolean) {
  const supabase = await createClient()
  await supabase.from('profiles').update({ is_active: isActive }).eq('id', studentId)
  revalidatePath('/admin/students')
}
