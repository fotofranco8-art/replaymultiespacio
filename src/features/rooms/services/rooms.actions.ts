'use server'

import { createClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/supabase/profile-helper'
import { revalidatePath } from 'next/cache'
import type { Room, NewRoomInput } from '../types'

export async function getRooms(): Promise<Room[]> {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return []

  const { data } = await supabase
    .from('rooms')
    .select('*')
    .eq('center_id', profile.center_id)
    .order('name')

  return (data ?? []) as Room[]
}

export async function createRoom(input: NewRoomInput) {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) throw new Error('No center found')

  const { error } = await supabase.from('rooms').insert({
    center_id: profile.center_id,
    name: input.name,
    capacity: input.capacity,
    description: input.description ?? null,
  })

  if (error) throw error
  revalidatePath('/admin/rooms')
}

export async function updateRoom(id: string, updates: Partial<NewRoomInput>) {
  const supabase = await createClient()
  const { error } = await supabase.from('rooms').update(updates).eq('id', id)
  if (error) throw error
  revalidatePath('/admin/rooms')
}

export async function toggleRoom(id: string, isActive: boolean) {
  const supabase = await createClient()
  await supabase.from('rooms').update({ is_active: isActive }).eq('id', id)
  revalidatePath('/admin/rooms')
}
