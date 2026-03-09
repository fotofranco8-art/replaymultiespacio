'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getMyProfile } from '@/lib/supabase/profile-helper'
import { revalidatePath } from 'next/cache'
import type { MembershipRow, MembershipStatus } from '../types'

export async function getMemberships(): Promise<MembershipRow[]> {
  const admin = createAdminClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return []

  // Obtenemos membresías con datos del alumno y disciplina
  const { data: memberships, error } = await admin
    .from('memberships')
    .select('id, student_id, plan_name, monthly_fee, classes_per_month, status, is_blocked, start_date, discipline_id, center_id, created_at')
    .eq('center_id', profile.center_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getMemberships] error:', JSON.stringify(error))
    return []
  }
  if (!memberships?.length) return []

  // Traemos perfiles de alumnos
  const studentIds = [...new Set(memberships.map((m) => m.student_id).filter(Boolean))]
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, full_name, email')
    .in('id', studentIds)

  const profileMap: Record<string, { full_name: string; email: string }> = {}
  for (const p of profiles ?? []) {
    profileMap[p.id] = { full_name: p.full_name ?? '', email: p.email ?? '' }
  }

  // Traemos disciplinas
  const disciplineIds = [...new Set(memberships.map((m) => m.discipline_id).filter(Boolean))]
  const disciplineMap: Record<string, { name: string; color: string }> = {}
  if (disciplineIds.length > 0) {
    const { data: disciplines } = await admin
      .from('disciplines')
      .select('id, name, color')
      .in('id', disciplineIds)
    for (const d of disciplines ?? []) {
      disciplineMap[d.id] = { name: d.name, color: d.color ?? '#888' }
    }
  }

  return memberships.map((m) => ({
    ...m,
    monthly_fee: Number(m.monthly_fee ?? 0),
    profiles: m.student_id ? (profileMap[m.student_id] ?? null) : null,
    disciplines: m.discipline_id ? (disciplineMap[m.discipline_id] ?? null) : null,
  })) as MembershipRow[]
}

export async function updateMembershipStatus(id: string, status: MembershipStatus) {
  const admin = createAdminClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) throw new Error('No center found')

  const { error } = await admin
    .from('memberships')
    .update({ status })
    .eq('id', id)
    .eq('center_id', profile.center_id)

  if (error) throw error
  revalidatePath('/admin/memberships')
}

export async function toggleMembershipBlock(id: string, is_blocked: boolean) {
  const admin = createAdminClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) throw new Error('No center found')

  const { error } = await admin
    .from('memberships')
    .update({ is_blocked })
    .eq('id', id)
    .eq('center_id', profile.center_id)

  if (error) throw error
  revalidatePath('/admin/memberships')
}

export async function deleteMembership(id: string) {
  const admin = createAdminClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) throw new Error('No center found')

  const { error } = await admin
    .from('memberships')
    .delete()
    .eq('id', id)
    .eq('center_id', profile.center_id)

  if (error) throw error
  revalidatePath('/admin/memberships')
}
