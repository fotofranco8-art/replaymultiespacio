'use server'

import { createClient } from '@/lib/supabase/server'

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
