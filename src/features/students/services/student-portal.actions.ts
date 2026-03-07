'use server'

import { createClient } from '@/lib/supabase/server'

export interface NextClass {
  id: string
  scheduledDate: string
  startTime: string
  endTime: string
  disciplineName: string
  disciplineColor: string
  room: string
  teacherName: string
}

export interface AttendanceHistoryItem {
  classId: string
  className: string
  scheduledDate: string
  startTime: string
  disciplineColor: string
  status: 'PRESENTE' | 'AUSENTE'
}

export async function getNextClass(studentId: string): Promise<NextClass | null> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('class_enrollments')
    .select(`
      class_id,
      classes!inner (
        id, scheduled_date, start_time, end_time, is_cancelled, room,
        disciplines (name, color),
        profiles!classes_teacher_id_fkey (full_name)
      )
    `)
    .eq('student_id', studentId)
    .gte('classes.scheduled_date', today)
    .eq('classes.is_cancelled', false)
    .order('classes.scheduled_date', { ascending: true })
    .order('classes.start_time', { ascending: true })
    .limit(1)

  if (!data || data.length === 0) return null

  const raw = data[0].classes as unknown as {
    id: string
    scheduled_date: string
    start_time: string
    end_time: string
    room: string
    disciplines: { name: string; color: string } | { name: string; color: string }[] | null
    profiles: { full_name: string } | { full_name: string }[] | null
  }

  if (!raw) return null

  const disc = Array.isArray(raw.disciplines) ? raw.disciplines[0] : raw.disciplines
  const teacher = Array.isArray(raw.profiles) ? raw.profiles[0] : raw.profiles

  return {
    id: raw.id,
    scheduledDate: raw.scheduled_date,
    startTime: raw.start_time,
    endTime: raw.end_time,
    disciplineName: disc?.name ?? 'Clase',
    disciplineColor: disc?.color ?? '#A855F7',
    room: raw.room ?? '',
    teacherName: teacher?.full_name ?? '',
  }
}

export async function getAttendanceHistory(studentId: string, limit = 5): Promise<AttendanceHistoryItem[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select(`
      class_id,
      classes!inner (
        id, scheduled_date, start_time, is_cancelled,
        disciplines (name, color)
      )
    `)
    .eq('student_id', studentId)
    .lt('classes.scheduled_date', today)
    .order('classes.scheduled_date', { ascending: false })
    .limit(limit)

  if (!enrollments || enrollments.length === 0) return []

  const classIds = enrollments.map((e) => e.class_id)

  const { data: attendanceRecords } = await supabase
    .from('attendance')
    .select('class_id')
    .eq('student_id', studentId)
    .in('class_id', classIds)

  const attendedIds = new Set((attendanceRecords ?? []).map((a) => a.class_id))

  return enrollments.map((e) => {
    const cls = e.classes as unknown as {
      id: string
      scheduled_date: string
      start_time: string
      disciplines: { name: string; color: string } | { name: string; color: string }[] | null
    }
    const disc = Array.isArray(cls?.disciplines) ? cls.disciplines[0] : cls?.disciplines

    return {
      classId: cls?.id ?? e.class_id,
      className: disc?.name ?? 'Clase',
      scheduledDate: cls?.scheduled_date ?? '',
      startTime: cls?.start_time ?? '',
      disciplineColor: disc?.color ?? '#A855F7',
      status: attendedIds.has(e.class_id) ? 'PRESENTE' : 'AUSENTE',
    }
  })
}

export async function getMyClasses() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('class_enrollments')
    .select(`
      id,
      classes (
        id, scheduled_date, start_time, end_time, is_cancelled,
        disciplines (name, color)
      )
    `)
    .eq('student_id', user.id)
    .gte('classes.scheduled_date', today)
    .order('classes.scheduled_date')
    .limit(15)

  return (data ?? []).filter((e) => e.classes !== null)
}

export async function getMyBalance(studentId: string, centerId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('recovery_balance')
    .select('balance')
    .eq('student_id', studentId)
    .eq('center_id', centerId)
    .maybeSingle()

  return data
}
