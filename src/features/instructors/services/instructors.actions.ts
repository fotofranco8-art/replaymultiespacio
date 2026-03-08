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

  const { data: invited, error } = await admin.auth.admin.inviteUserByEmail(input.email, {
    data: {
      full_name: input.full_name,
      role: 'teacher',
      center_id: profile.center_id,
      phone: input.phone ?? null,
    },
  })

  if (error) {
    if (error.status === 429 || error.message?.includes('rate limit')) {
      throw new Error('Límite de emails alcanzado. Esperá unos minutos e intentá de nuevo.')
    }
    if (error.status === 422 || error.message?.includes('already been registered')) {
      throw new Error('Este email ya está registrado en el sistema.')
    }
    throw new Error(error.message ?? 'Error al invitar instructor')
  }

  // Upsert profile manually as backup in case the DB trigger didn't run
  await admin.from('profiles').upsert({
    id: invited.user.id,
    center_id: profile.center_id,
    role: 'teacher',
    full_name: input.full_name,
    email: input.email,
    phone: input.phone ?? null,
    is_active: true,
  }, { onConflict: 'id' })

  revalidatePath('/admin/instructors')
}

export async function toggleInstructorStatus(instructorId: string, isActive: boolean) {
  const admin = createAdminClient()
  await admin.from('profiles').update({ is_active: isActive }).eq('id', instructorId)
  revalidatePath('/admin/instructors')
}
