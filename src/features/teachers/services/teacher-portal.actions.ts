'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTeacherDisciplines(teacherId: string): Promise<string[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('class_templates')
    .select('disciplines (name)')
    .eq('teacher_id', teacherId)
    .eq('is_active', true)

  const names = (data ?? []).flatMap((t) => {
    const d = Array.isArray(t.disciplines)
      ? (t.disciplines as { name: string }[])[0]
      : (t.disciplines as { name: string } | null)
    return d ? [d.name] : []
  })

  return [...new Set(names)]
}

export async function updateTeacherPhone(phone: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ phone })
    .eq('id', user.id)

  if (error) throw error
  revalidatePath('/teacher/profile')
}
