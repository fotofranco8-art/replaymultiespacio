'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROLE_REDIRECTS } from '../types'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .single()

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
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .single()
  return data
}
