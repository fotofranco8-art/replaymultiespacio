'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMyProfile } from '@/lib/supabase/profile-helper'
import { revalidatePath } from 'next/cache'
import type { Instructor, NewInstructorInput } from '../types'

export async function getInstructors(): Promise<Instructor[]> {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return []

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, is_active, created_at')
    .eq('center_id', profile.center_id)
    .eq('role', 'teacher')
    .order('full_name')

  return (data ?? []) as Instructor[]
}

export async function inviteInstructor(input: NewInstructorInput) {
  const admin = createAdminClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) throw new Error('No center found')

  const { error } = await admin.auth.admin.inviteUserByEmail(input.email, {
    data: {
      full_name: input.full_name,
      role: 'teacher',
      center_id: profile.center_id,
      phone: input.phone ?? null,
    },
  })

  if (error) throw error
  revalidatePath('/admin/instructors')
}

export async function toggleInstructorStatus(instructorId: string, isActive: boolean) {
  const supabase = await createClient()
  await supabase.from('profiles').update({ is_active: isActive }).eq('id', instructorId)
  revalidatePath('/admin/instructors')
}
