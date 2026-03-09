'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function getQRToken(): Promise<string | null> {
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('center_id').single()
  if (!profile?.center_id) return null

  const { data } = await supabase
    .from('qr_tokens')
    .select('token')
    .eq('center_id', profile.center_id)
    .maybeSingle()

  return data?.token ?? null
}

export interface CheckinResult {
  success: boolean
  message: string
  studentName?: string
  className?: string
}

export async function validateAndCheckin(token: string): Promise<CheckinResult> {
  const admin = createAdminClient()

  // 1. Validate token → get center_id
  const { data: qrToken } = await admin
    .from('qr_tokens')
    .select('center_id')
    .eq('token', token)
    .maybeSingle()

  if (!qrToken) return { success: false, message: 'QR inválido o expirado' }

  // 2. Get logged-in student
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Debes iniciar sesion para registrar asistencia' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, center_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'student') {
    return { success: false, message: 'Solo alumnos pueden registrar asistencia' }
  }

  if (profile.center_id !== qrToken.center_id) {
    return { success: false, message: 'No perteneces a este centro' }
  }

  // 3. Check active membership (and not blocked)
  const { data: membership } = await supabase
    .from('memberships')
    .select('id, status, is_blocked')
    .eq('student_id', user.id)
    .eq('center_id', qrToken.center_id)
    .eq('status', 'active')
    .maybeSingle()

  if (!membership) {
    return { success: false, message: 'Tu membresía no está activa. Contacta al centro.' }
  }

  if (membership.is_blocked) {
    return { success: false, message: 'Tu acceso está bloqueado. Regularizá tu pago.' }
  }

  // 4. Find active class right now
  // Vercel corre en UTC; Argentina es siempre UTC-3 (sin DST)
  const now = new Date()
  const argNow = new Date(now.getTime() - 3 * 60 * 60 * 1000)
  const todayDate = argNow.toISOString().split('T')[0]
  const currentTime = argNow.toISOString().slice(11, 16) // HH:MM en hora argentina

  const { data: activeClass } = await supabase
    .from('classes')
    .select('id, start_time, end_time, disciplines(name)')
    .eq('center_id', qrToken.center_id)
    .eq('scheduled_date', todayDate)
    .eq('is_cancelled', false)
    .gte('end_time', currentTime)
    .order('start_time')
    .limit(1)
    .maybeSingle()

  if (!activeClass) {
    return { success: false, message: 'No hay clases activas en este momento' }
  }

  // 5. Check if enrolled in this class
  const { data: enrollment } = await supabase
    .from('class_enrollments')
    .select('id')
    .eq('class_id', activeClass.id)
    .eq('student_id', user.id)
    .maybeSingle()

  if (!enrollment) {
    return { success: false, message: 'No estás inscripto en esta clase' }
  }

  // 6. Check for duplicate attendance
  const { data: existing } = await supabase
    .from('attendance')
    .select('id')
    .eq('class_id', activeClass.id)
    .eq('student_id', user.id)
    .maybeSingle()

  if (existing) {
    return { success: true, message: 'Ya registraste tu asistencia para esta clase', studentName: profile.full_name }
  }

  // 7. Register attendance — center_id no existe en producción (schema base no la tiene)
  const { error } = await admin.from('attendance').insert({
    class_id: activeClass.id,
    student_id: user.id,
  })

  if (error) {
    console.error('[checkin] attendance insert error:', JSON.stringify(error))
    return { success: false, message: `Error al registrar: ${error.message}` }
  }

  // Refrescar el portal del alumno para mostrar el check-in
  revalidatePath('/student')

  const disciplineName = Array.isArray(activeClass.disciplines)
    ? activeClass.disciplines[0]?.name
    : (activeClass.disciplines as { name: string } | null)?.name

  return {
    success: true,
    message: '¡Asistencia registrada!',
    studentName: profile.full_name,
    className: disciplineName,
  }
}
