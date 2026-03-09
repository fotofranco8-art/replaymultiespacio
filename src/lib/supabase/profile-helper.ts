/**
 * Helper para obtener el perfil del usuario autenticado actual.
 *
 * Siempre agrega .eq('id', user.id) para que .single() funcione correctamente
 * incluso con políticas RLS center-wide (que devuelven múltiples filas).
 *
 * Usado por todos los service files en lugar del patrón inline:
 *   supabase.from('profiles').select('center_id').single()
 */
import { createClient } from './server'

export interface MyProfile {
  id: string
  center_id: string | null
  role: string
  full_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getMyProfile(): Promise<MyProfile | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error('[getMyProfile] Auth error:', authError.message)
    return null
  }

  if (!user) {
    console.error('[getMyProfile] No active session')
    return null
  }

  const { data, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('[getMyProfile] Profile query error:', profileError.code, profileError.message, '| userId:', user.id)
  }

  return data as MyProfile | null
}
