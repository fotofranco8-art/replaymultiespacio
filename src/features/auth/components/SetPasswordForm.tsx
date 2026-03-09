'use client'

import { useState, useTransition, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { setPassword } from '@/features/auth/services/auth.actions'

export default function SetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  // Estado de sesión para el flujo de recovery (hash fragment)
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Primero verificar si ya hay sesión activa (flujo de invitación via /callback)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true)
        return
      }

      // Flujo de recovery: leer tokens del hash fragment del URL
      // URL esperada: /set-password#access_token=xxx&refresh_token=xxx&type=recovery
      const hash = window.location.hash.substring(1)
      if (!hash) {
        setSessionError('Enlace inválido o expirado. Pedí un nuevo email.')
        return
      }

      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (!accessToken || !refreshToken) {
        setSessionError('Enlace inválido o expirado. Pedí un nuevo email.')
        return
      }

      // Establecer sesión desde los tokens del hash
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error: sessionErr }) => {
          if (sessionErr) {
            setSessionError(sessionErr.message ?? 'No se pudo verificar el enlace.')
          } else {
            setSessionReady(true)
            // Limpiar el hash del URL para que no quede expuesto
            window.history.replaceState(null, '', window.location.pathname)
          }
        })
    })
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await setPassword(formData)
      if (result?.error) setError(result.error)
    })
  }

  // Cargando sesión
  if (!sessionReady && !sessionError) {
    return (
      <div className="w-full flex justify-center py-8">
        <div
          className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#FF2D78' }}
        />
      </div>
    )
  }

  // Sesión inválida o expirada
  if (sessionError) {
    return (
      <div
        className="rounded-xl px-4 py-3 text-sm text-center"
        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171' }}
      >
        {sessionError}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">

      {/* Password */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium" style={{ color: 'rgba(255,255,255,0.50)' }}>
          Nueva contraseña
        </label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#FF2D78]/50 transition-colors pr-11"
            style={{ fontFamily: 'inherit' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            aria-label="Mostrar/ocultar contraseña"
          >
            {showPassword ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Confirm */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium" style={{ color: 'rgba(255,255,255,0.50)' }}>
          Confirmar contraseña
        </label>
        <div className="relative">
          <input
            name="confirm"
            type={showConfirm ? 'text' : 'password'}
            required
            placeholder="Repetí la contraseña"
            className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#FF2D78]/50 transition-colors pr-11"
            style={{ fontFamily: 'inherit' }}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            aria-label="Mostrar/ocultar contraseña"
          >
            {showConfirm ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171' }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full rounded-xl py-3 font-semibold text-sm text-white cursor-pointer transition-opacity"
        style={{ opacity: isPending ? 0.7 : 1, marginTop: '8px' }}
      >
        {isPending ? 'Guardando…' : 'Crear contraseña'}
      </button>
    </form>
  )
}
