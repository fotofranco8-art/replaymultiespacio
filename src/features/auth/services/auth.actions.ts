'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/supabase/profile-helper'
import { ROLE_REDIRECTS } from '../types'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  const profile = await getMyProfile()
  const role = profile?.role ?? 'student'
  redirect(ROLE_REDIRECTS[role as keyof typeof ROLE_REDIRECTS])
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getProfile() {
  return getMyProfile()
}

export async function setPassword(formData: FormData): Promise<{ error?: string }> {
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!password || password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres' }
  }
  if (password !== confirm) {
    return { error: 'Las contraseñas no coinciden' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  const profile = await getMyProfile()
  const role = profile?.role ?? 'student'
  redirect(ROLE_REDIRECTS[role as keyof typeof ROLE_REDIRECTS])
}
