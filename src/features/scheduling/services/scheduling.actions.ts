'use server'

import { createClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/supabase/profile-helper'
import { revalidatePath } from 'next/cache'
import type { NewTemplateInput, Discipline, ClassTemplate, Holiday, CalendarClass } from '../types'

function revalidateAll() {
  revalidatePath('/admin')
  revalidatePath('/admin/scheduling')
  revalidatePath('/admin/class-templates')
  revalidatePath('/admin/holidays')
  revalidatePath('/admin/disciplines')
  revalidatePath('/admin/calendar')
}

export async function getDisciplineStats(): Promise<{
  futureCounts: Record<string, number>
  studentCounts: Record<string, number>
}> {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return { futureCounts: {}, studentCounts: {} }

  const today = new Date().toISOString().split('T')[0]

  const [{ data: classes }, { data: memberships }] = await Promise.all([
    supabase
      .from('classes')
      .select('discipline_id')
      .eq('center_id', profile.center_id)
      .gte('scheduled_date', today)
      .eq('is_cancelled', false),
    supabase
      .from('memberships')
      .select('discipline_id')
      .eq('center_id', profile.center_id)
      .eq('status', 'active'),
  ])

  const futureCounts: Record<string, number> = {}
  for (const c of classes ?? []) {
    if (c.discipline_id) futureCounts[c.discipline_id] = (futureCounts[c.discipline_id] ?? 0) + 1
  }

  const studentCounts: Record<string, number> = {}
  for (const m of memberships ?? []) {
    if (m.discipline_id) studentCounts[m.discipline_id] = (studentCounts[m.discipline_id] ?? 0) + 1
  }

  return { futureCounts, studentCounts }
}

export async function deleteDiscipline(id: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Borrar clases futuras (cascade elimina class_enrollments)
  await supabase.from('classes').delete().eq('discipline_id', id).gte('scheduled_date', today)

  // Hard delete de la disciplina (cascade elimina class_templates)
  const { error } = await supabase.from('disciplines').delete().eq('id', id)
  if (error) throw error

  revalidateAll()
}

export async function getDisciplines(): Promise<Discipline[]> {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return []

  const { data } = await supabase
    .from('disciplines')
    .select('*')
    .eq('center_id', profile.center_id)
    .order('name')

  return data ?? []
}

export async function createDiscipline(input: {
  name: string
  color: string
  type?: 'grupal' | 'individual'
  monthly_price?: number
  max_capacity?: number
  modality?: 'anual' | 'seminario'
  description?: string
}) {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) throw new Error('No center found')

  const { error } = await supabase.from('disciplines').insert({
    center_id: profile.center_id,
    name: input.name,
    color: input.color,
    type: input.type ?? 'grupal',
    monthly_price: input.monthly_price ?? 0,
    max_capacity: input.max_capacity ?? 20,
    modality: input.modality ?? 'anual',
    description: input.description ?? null,
  })

  if (error) throw error
  revalidateAll()
}

export async function updateDiscipline(id: string, input: {
  name: string
  color: string
  type?: 'grupal' | 'individual'
  monthly_price?: number
  max_capacity?: number
  modality?: 'anual' | 'seminario'
  description?: string
}) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('disciplines')
    .update({
      name: input.name,
      color: input.color,
      type: input.type ?? 'grupal',
      monthly_price: input.monthly_price ?? 0,
      max_capacity: input.max_capacity ?? 20,
      modality: input.modality ?? 'anual',
      description: input.description ?? null,
    })
    .eq('id', id)

  if (error) throw error

  // Cascade capacidad → plantillas activas + clases futuras
  if (input.max_capacity !== undefined) {
    await supabase.from('class_templates')
      .update({ max_capacity: input.max_capacity })
      .eq('discipline_id', id).eq('is_active', true)
    await supabase.from('classes')
      .update({ max_capacity: input.max_capacity })
      .eq('discipline_id', id).gte('scheduled_date', today)
  }

  // Cascade precio → membresías activas de esta disciplina
  if (input.monthly_price !== undefined) {
    await supabase.from('memberships')
      .update({ monthly_fee: input.monthly_price })
      .eq('discipline_id', id).eq('status', 'active')
  }

  revalidateAll()
}

export async function toggleDiscipline(id: string, isActive: boolean) {
  const supabase = await createClient()
  await supabase.from('disciplines').update({ is_active: isActive }).eq('id', id)
  revalidateAll()
}

export async function getClassTemplates(): Promise<ClassTemplate[]> {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return []

  const { data } = await supabase
    .from('class_templates')
    .select(`
      *,
      disciplines (name, color),
      profiles (full_name),
      class_template_students (student_id)
    `)
    .eq('center_id', profile.center_id)
    .eq('is_active', true)
    .order('day_of_week')
    .order('start_time')

  return (data ?? []).map((t) => ({
    ...t,
    student_ids: Array.isArray(t.class_template_students)
      ? t.class_template_students.map((s: { student_id: string }) => s.student_id)
      : [],
  })) as ClassTemplate[]
}

export async function updateClassTemplate(id: string, input: NewTemplateInput) {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) throw new Error('No center found')

  const { student_ids, ...templateData } = input

  const { error } = await supabase
    .from('class_templates')
    .update({
      ...templateData,
      max_capacity: templateData.max_capacity ?? 20,
    })
    .eq('id', id)

  if (error) throw error

  // Reemplazar alumnos asignados
  const { error: deleteError } = await supabase.from('class_template_students').delete().eq('template_id', id)
  if (deleteError) throw deleteError

  if (student_ids && student_ids.length > 0) {
    const { error: studentsError } = await supabase.from('class_template_students').insert(
      student_ids.map((student_id) => ({
        template_id: id,
        student_id,
        center_id: profile.center_id!,
      }))
    )
    if (studentsError) throw studentsError
  }

  revalidateAll()
}

export async function createClassTemplate(input: NewTemplateInput) {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) throw new Error('No center found')

  const { student_ids, ...templateData } = input

  const { data, error } = await supabase.from('class_templates').insert({
    center_id: profile.center_id,
    ...templateData,
    max_capacity: templateData.max_capacity ?? 20,
  }).select('id').single()

  if (error) throw error

  // Guardar alumnos asignados
  if (student_ids && student_ids.length > 0 && data?.id) {
    const { error: studentsError } = await supabase.from('class_template_students').insert(
      student_ids.map((student_id) => ({
        template_id: data.id,
        student_id,
        center_id: profile.center_id!,
      }))
    )
    if (studentsError) throw studentsError
  }

  revalidateAll()
}

export async function deleteClassTemplate(id: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Eliminar clases futuras generadas por esta plantilla
  // (el CASCADE en class_enrollments limpia las inscripciones automáticamente)
  await supabase
    .from('classes')
    .delete()
    .eq('template_id', id)
    .gte('scheduled_date', today)

  // Desactivar la plantilla
  await supabase.from('class_templates').update({ is_active: false }).eq('id', id)

  revalidateAll()
}

export async function getHolidays(): Promise<Holiday[]> {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return []

  const { data } = await supabase
    .from('holidays')
    .select('*')
    .eq('center_id', profile.center_id)
    .order('date')

  return data ?? []
}

export async function addHoliday(date: string, name: string) {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) throw new Error('No center found')

  const { error } = await supabase.from('holidays').insert({
    center_id: profile.center_id,
    date,
    name,
  })

  if (error) throw error

  // Cascade: cancel classes on this holiday and credit recovery balance
  await supabase.rpc('cancel_holiday_classes', {
    p_center_id: profile.center_id,
    p_date: date,
  })

  revalidateAll()
}

export async function removeHoliday(id: string) {
  const supabase = await createClient()
  await supabase.from('holidays').delete().eq('id', id)
  revalidateAll()
}

export async function getTeachers() {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return []

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('center_id', profile.center_id)
    .eq('role', 'teacher')
    .eq('is_active', true)
    .order('full_name')

  return data ?? []
}

export async function projectMonth(year: number, month: number) {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) throw new Error('No center found')

  const { data, error } = await supabase.rpc('project_month', {
    p_center_id: profile.center_id,
    p_year: year,
    p_month: month,
  })

  if (error) throw error
  revalidateAll()
  return data
}

export async function getCalendarClasses(year: number, month: number): Promise<CalendarClass[]> {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return []

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

  const { data } = await supabase
    .from('classes')
    .select(`
      id, scheduled_date, start_time, end_time, room, is_cancelled, max_capacity,
      disciplines (name, color),
      profiles (full_name)
    `)
    .eq('center_id', profile.center_id)
    .gte('scheduled_date', startDate)
    .lt('scheduled_date', endDate)
    .order('scheduled_date')
    .order('start_time')

  return (data ?? []) as unknown as CalendarClass[]
}

export async function cancelClass(classId: string) {
  const supabase = await createClient()
  await supabase.from('classes').update({ is_cancelled: true }).eq('id', classId)
  revalidatePath('/admin/calendar')
}

export async function getMonthlyRevenue(): Promise<number> {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return 0

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const startOfMonth = `${year}-${month}-01T00:00:00`
  const nextMonth = now.getMonth() === 11 ? 1 : now.getMonth() + 2
  const nextYear = now.getMonth() === 11 ? year + 1 : year
  const endOfMonth = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01T00:00:00`

  const { data } = await supabase
    .from('payments')
    .select('final_amount')
    .eq('center_id', profile.center_id)
    .gte('created_at', startOfMonth)
    .lt('created_at', endOfMonth)

  return (data ?? []).reduce((sum, p) => sum + Number(p.final_amount), 0)
}

export async function getClassesForDate(date: string): Promise<CalendarClass[]> {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return []

  const { data } = await supabase
    .from('classes')
    .select(`
      id, scheduled_date, start_time, end_time, room, is_cancelled, max_capacity,
      disciplines (name, color),
      profiles (full_name)
    `)
    .eq('center_id', profile.center_id)
    .eq('scheduled_date', date)
    .eq('is_cancelled', false)
    .order('start_time')

  return (data ?? []) as unknown as CalendarClass[]
}

export async function createAdHocClass(input: {
  discipline_id: string
  teacher_id?: string
  room?: string
  scheduled_date: string
  start_time: string
  end_time: string
  max_capacity?: number
  student_ids?: string[]
}) {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) throw new Error('No center found')

  const { student_ids, ...classData } = input

  const { data, error } = await supabase.from('classes').insert({
    center_id: profile.center_id,
    ...classData,
    max_capacity: classData.max_capacity ?? 20,
  }).select('id').single()

  if (error) throw error

  if (student_ids && student_ids.length > 0 && data?.id) {
    await supabase.from('class_enrollments').insert(
      student_ids.map((student_id) => ({
        class_id: data.id,
        student_id,
        center_id: profile.center_id!,
      }))
    )
  }

  revalidateAll()
}

export async function getTeacherAlerts() {
  const supabase = await createClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return []

  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('classes')
    .select(`
      id, start_time, end_time,
      disciplines (name),
      profiles (full_name),
      attendance (id)
    `)
    .eq('center_id', profile.center_id)
    .eq('scheduled_date', today)
    .eq('is_cancelled', false)
    .order('start_time')

  // Return classes with zero attendance
  return (data ?? []).filter((cls) => {
    const count = Array.isArray(cls.attendance) ? cls.attendance.length : 0
    return count === 0
  })
}
