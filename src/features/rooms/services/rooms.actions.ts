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
    type: input.type ?? 'grupal',
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

export async function deleteRoom(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('rooms').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/admin/rooms')
}

// Calcula el número de semana ISO de una fecha (fallback para clases ad-hoc)
function getISOWeek(d: Date): number {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

// Devuelve los lunes que cubren el mes indicado (incluyendo el lunes anterior si el mes no empieza en lunes)
function getMondaysInMonth(year: number, month: number): string[] {
  const result: string[] = []
  const firstDay = new Date(year, month - 1, 1)
  const dayOfWeek = firstDay.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const d = new Date(firstDay)
  d.setDate(firstDay.getDate() + diff)
  const lastDay = new Date(year, month, 0)
  while (d <= lastDay) {
    result.push(d.toISOString().split('T')[0])
    d.setDate(d.getDate() + 7)
  }
  return result
}

// Asigna aulas a todas las clases sin aula de la semana indicada.
// Rotación POR PLANTILLA: cada class_template rota de forma independiente
// basándose en el aula que tuvo en la semana anterior.
// weekStartDate = 'YYYY-MM-DD' del lunes de la semana
export async function rotateRoomsForWeek(
  weekStartDate: string
): Promise<{ assigned: number; skipped: number }> {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return { assigned: 0, skipped: 0 }

  const weekStart = new Date(weekStartDate + 'T00:00:00')
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekEndDate = weekEnd.toISOString().split('T')[0]
  const weekNum = getISOWeek(weekStart)

  // Cargar aulas activas del centro
  const { data: allRooms } = await supabase
    .from('rooms')
    .select('name, type')
    .eq('center_id', profile.center_id)
    .eq('is_active', true)
    .order('name')

  const grupalRooms = (allRooms ?? []).filter((r) => r.type === 'grupal')
  const individualRooms = (allRooms ?? []).filter((r) => r.type === 'individual')

  if (grupalRooms.length === 0 && individualRooms.length === 0) return { assigned: 0, skipped: 0 }

  // Clases sin aula asignada en el rango, con template_id y tipo de disciplina
  const { data: classes } = await supabase
    .from('classes')
    .select('id, scheduled_date, start_time, end_time, template_id, disciplines(type)')
    .eq('center_id', profile.center_id)
    .gte('scheduled_date', weekStartDate)
    .lte('scheduled_date', weekEndDate)
    .is('room', null)
    .eq('is_cancelled', false)

  if (!classes || classes.length === 0) return { assigned: 0, skipped: 0 }

  // --- Historial de aulas por plantilla (una consulta batch) ---
  const templateIds = [...new Set(classes.map((c) => c.template_id).filter(Boolean))] as string[]
  const prevAssignments = new Map<string, string>() // template_id → aula de la semana anterior

  if (templateIds.length > 0) {
    const { data: prevRows } = await supabase
      .from('classes')
      .select('template_id, room, scheduled_date')
      .in('template_id', templateIds)
      .not('room', 'is', null)
      .lt('scheduled_date', weekStartDate)
      .order('scheduled_date', { ascending: false })
      .limit(templateIds.length * 4) // máximo 4 semanas de historial por plantilla

    for (const row of prevRows ?? []) {
      if (row.template_id && !prevAssignments.has(row.template_id) && row.room) {
        prevAssignments.set(row.template_id, row.room)
      }
    }
  }

  // --- Determinar el aula de esta semana para cada plantilla grupal ---
  // Cada plantilla avanza una posición respecto al aula que tuvo la última vez
  const weekAssignments = new Map<string, string>() // template_id → aula asignada esta semana

  for (const templateId of templateIds) {
    const sampleCls = classes.find((c) => c.template_id === templateId)
    const disc = Array.isArray(sampleCls?.disciplines) ? sampleCls.disciplines[0] : sampleCls?.disciplines
    const discType = (disc as { type?: string } | null)?.type

    if (discType === 'grupal' && grupalRooms.length > 0) {
      const lastRoom = prevAssignments.get(templateId)
      const lastIdx = grupalRooms.findIndex((r) => r.name === lastRoom) // -1 si no tiene historial
      const nextIdx = (lastIdx + 1) % grupalRooms.length
      weekAssignments.set(templateId, grupalRooms[nextIdx].name)
    }
  }

  // --- Mapa de conflictos de horario (aulas ya ocupadas en cada franja) ---
  const { data: occupiedClasses } = await supabase
    .from('classes')
    .select('scheduled_date, start_time, room')
    .eq('center_id', profile.center_id)
    .gte('scheduled_date', weekStartDate)
    .lte('scheduled_date', weekEndDate)
    .not('room', 'is', null)
    .eq('is_cancelled', false)

  const conflictMap = new Map<string, Set<string>>()
  for (const oc of occupiedClasses ?? []) {
    const key = `${oc.scheduled_date}|${oc.start_time}`
    if (!conflictMap.has(key)) conflictMap.set(key, new Set())
    if (oc.room) conflictMap.get(key)!.add(oc.room)
  }

  let assigned = 0
  let skipped = 0

  for (const cls of classes) {
    const disc = Array.isArray(cls.disciplines) ? cls.disciplines[0] : cls.disciplines
    const discType = (disc as { type?: string } | null)?.type
    let roomName: string | null = null

    if (discType === 'grupal') {
      if (cls.template_id && weekAssignments.has(cls.template_id)) {
        // Aula determinada por el historial de esta plantilla
        roomName = weekAssignments.get(cls.template_id)!
      } else if (grupalRooms.length > 0) {
        // Fallback para clases ad-hoc sin template_id
        roomName = grupalRooms[weekNum % grupalRooms.length].name
      }
    } else {
      // Disciplina individual: preferir aula grupal libre en ese horario
      const key = `${cls.scheduled_date}|${cls.start_time}`
      const occupied = conflictMap.get(key) ?? new Set()
      const freeGrupal = grupalRooms.find((r) => !occupied.has(r.name))
      if (freeGrupal) {
        roomName = freeGrupal.name
      } else if (individualRooms.length > 0) {
        roomName = individualRooms[weekNum % individualRooms.length].name
      }
    }

    if (roomName) {
      await supabase.from('classes').update({ room: roomName }).eq('id', cls.id)
      const key = `${cls.scheduled_date}|${cls.start_time}`
      if (!conflictMap.has(key)) conflictMap.set(key, new Set())
      conflictMap.get(key)!.add(roomName)
      assigned++
    } else {
      skipped++
    }
  }

  revalidatePath('/admin/rooms')
  revalidatePath('/admin/schedule')
  revalidatePath('/admin/calendar')
  return { assigned, skipped }
}

// Sincroniza aulas para todas las semanas del mes de forma secuencial.
// Al ser secuencial, cada semana puede leer el historial de la anterior.
export async function rotateRoomsForMonth(
  year: number,
  month: number
): Promise<{ assigned: number; skipped: number }> {
  const mondays = getMondaysInMonth(year, month)
  let totalAssigned = 0
  let totalSkipped = 0

  for (const monday of mondays) {
    const { assigned, skipped } = await rotateRoomsForWeek(monday)
    totalAssigned += assigned
    totalSkipped += skipped
  }

  revalidatePath('/admin/calendar')
  return { assigned: totalAssigned, skipped: totalSkipped }
}
