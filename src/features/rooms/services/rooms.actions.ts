'use server'

import { createClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/supabase/profile-helper'
import { revalidatePath } from 'next/cache'
import type { Room, NewRoomInput, RoomStats } from '../types'

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

export async function getRoomStats(): Promise<RoomStats> {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return { total_rooms: 0, total_capacity: 0, occupancy_today: 0 }

  const today = new Date().toISOString().split('T')[0]

  const [roomsResult, classesResult] = await Promise.all([
    supabase
      .from('rooms')
      .select('capacity')
      .eq('center_id', profile.center_id)
      .eq('is_active', true),
    supabase
      .from('classes')
      .select('room')
      .eq('center_id', profile.center_id)
      .eq('scheduled_date', today)
      .eq('is_cancelled', false),
  ])

  const activeRooms = roomsResult.data ?? []
  const todayClasses = classesResult.data ?? []

  const total_rooms = activeRooms.length
  const total_capacity = activeRooms.reduce((sum, r) => sum + (r.capacity ?? 0), 0)

  const roomsWithClasses = new Set(todayClasses.map((c) => c.room).filter(Boolean)).size
  const occupancy_today = total_rooms > 0 ? Math.round((roomsWithClasses / total_rooms) * 100) : 0

  return { total_rooms, total_capacity, occupancy_today }
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
    equipment: input.equipment ?? [],
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
