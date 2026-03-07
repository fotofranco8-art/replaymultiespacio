'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { NewTemplateInput, Discipline, ClassTemplate, Holiday } from '../types'

export async function getDisciplines(): Promise<Discipline[]> {
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('center_id').single()
  if (!profile?.center_id) return []

  const { data } = await supabase
    .from('disciplines')
    .select('*')
    .eq('center_id', profile.center_id)
    .eq('is_active', true)
    .order('name')

  return data ?? []
}

export async function createDiscipline(name: string, color: string) {
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('center_id').single()
  if (!profile?.center_id) throw new Error('No center found')

  const { error } = await supabase.from('disciplines').insert({
    center_id: profile.center_id,
    name,
    color,
  })

  if (error) throw error
  revalidatePath('/admin/scheduling')
}

export async function getClassTemplates(): Promise<ClassTemplate[]> {
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('center_id').single()
  if (!profile?.center_id) return []

  const { data } = await supabase
    .from('class_templates')
    .select(`
      *,
      disciplines (name, color),
      profiles (full_name)
    `)
    .eq('center_id', profile.center_id)
    .eq('is_active', true)
    .order('day_of_week')
    .order('start_time')

  return (data ?? []) as ClassTemplate[]
}

export async function createClassTemplate(input: NewTemplateInput) {
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('center_id').single()
  if (!profile?.center_id) throw new Error('No center found')

  const { error } = await supabase.from('class_templates').insert({
    center_id: profile.center_id,
    ...input,
    max_capacity: input.max_capacity ?? 20,
  })

  if (error) throw error
  revalidatePath('/admin/scheduling')
}

export async function deleteClassTemplate(id: string) {
  const supabase = await createClient()
  await supabase.from('class_templates').update({ is_active: false }).eq('id', id)
  revalidatePath('/admin/scheduling')
}

export async function getHolidays(): Promise<Holiday[]> {
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('center_id').single()
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
  const { data: profile } = await supabase.from('profiles').select('center_id').single()
  if (!profile?.center_id) throw new Error('No center found')

  const { error } = await supabase.from('holidays').insert({
    center_id: profile.center_id,
    date,
    name,
  })

  if (error) throw error
  revalidatePath('/admin/scheduling')
}

export async function removeHoliday(id: string) {
  const supabase = await createClient()
  await supabase.from('holidays').delete().eq('id', id)
  revalidatePath('/admin/scheduling')
}

export async function getTeachers() {
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('center_id').single()
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
  const { data: profile } = await supabase.from('profiles').select('center_id').single()
  if (!profile?.center_id) throw new Error('No center found')

  const { data, error } = await supabase.rpc('project_month', {
    p_center_id: profile.center_id,
    p_year: year,
    p_month: month,
  })

  if (error) throw error
  revalidatePath('/admin/scheduling')
  return data
}
