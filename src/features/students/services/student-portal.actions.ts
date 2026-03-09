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

  // Paso 1: obtener los IDs de clases en las que está inscripto
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('class_id')
    .eq('student_id', studentId)

  if (!enrollments?.length) return null

  const classIds = enrollments.map((e) => e.class_id)

  // Paso 2: buscar la próxima clase directamente en la tabla classes
  const { data: cls } = await supabase
    .from('classes')
    .select(`
      id, scheduled_date, start_time, end_time, room,
      disciplines (name, color),
      profiles!classes_teacher_id_fkey (full_name)
    `)
    .in('id', classIds)
    .gte('scheduled_date', today)
    .eq('is_cancelled', false)
    .order('scheduled_date', { ascending: true })
    .order('start_time', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!cls) return null

  const disc = Array.isArray(cls.disciplines) ? cls.disciplines[0] : cls.disciplines
  const teacher = Array.isArray(cls.profiles) ? cls.profiles[0] : cls.profiles

  return {
    id: cls.id,
    scheduledDate: cls.scheduled_date,
    startTime: cls.start_time,
    endTime: cls.end_time,
    disciplineName: (disc as { name: string; color: string } | null)?.name ?? 'Clase',
    disciplineColor: (disc as { name: string; color: string } | null)?.color ?? '#A855F7',
    room: (cls.room as string | null) ?? '',
    teacherName: (teacher as { full_name: string } | null)?.full_name ?? '',
  }
}

export async function getAttendanceHistory(studentId: string, limit = 5): Promise<AttendanceHistoryItem[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Paso 1: obtener los IDs de clases en las que está inscripto
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('class_id')
    .eq('student_id', studentId)

  if (!enrollments?.length) return []

  const classIds = enrollments.map((e) => e.class_id)

  // Paso 2: buscar clases pasadas directamente en la tabla classes
  const { data: classes } = await supabase
    .from('classes')
    .select(`
      id, scheduled_date, start_time,
      disciplines (name, color)
    `)
    .in('id', classIds)
    .lt('scheduled_date', today)
    .order('scheduled_date', { ascending: false })
    .limit(limit)

  if (!classes?.length) return []

  const pastClassIds = classes.map((c) => c.id)

  // Paso 3: verificar cuáles tuvieron asistencia
  const { data: attendanceRecords } = await supabase
    .from('attendance')
    .select('class_id')
    .eq('student_id', studentId)
    .in('class_id', pastClassIds)

  const attendedIds = new Set((attendanceRecords ?? []).map((a) => a.class_id))

  return classes.map((cls) => {
    const disc = Array.isArray(cls.disciplines) ? cls.disciplines[0] : cls.disciplines
    return {
      classId: cls.id,
      className: (disc as { name: string; color: string } | null)?.name ?? 'Clase',
      scheduledDate: cls.scheduled_date,
      startTime: cls.start_time,
      disciplineColor: (disc as { name: string; color: string } | null)?.color ?? '#A855F7',
      status: attendedIds.has(cls.id) ? 'PRESENTE' : 'AUSENTE',
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
