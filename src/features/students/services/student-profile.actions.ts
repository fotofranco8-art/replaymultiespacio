'use server'

import { createClient } from '@/lib/supabase/server'

export async function updateMyName(fullName: string): Promise<{ error?: string }> {
  const trimmed = fullName.trim()
  if (!trimmed) return { error: 'El nombre no puede estar vacío' }
  if (trimmed.length > 100) return { error: 'El nombre es demasiado largo' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: trimmed, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: 'Error al actualizar el nombre' }
  return {}
}
