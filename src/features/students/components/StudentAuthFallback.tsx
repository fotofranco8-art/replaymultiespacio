'use client'

import { logout } from '@/features/auth/services/auth.actions'
import { useTransition } from 'react'

export default function StudentAuthFallback() {
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(() => logout())
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#07050F' }}>
      <div className="text-center space-y-4">
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
          No se pudo cargar tu perfil
        </p>
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="text-sm font-semibold cursor-pointer transition-opacity hover:opacity-70"
          style={{ color: '#FF2D78', opacity: isPending ? 0.5 : 1 }}
        >
          {isPending ? 'Cerrando sesión…' : 'Volver a iniciar sesión'}
        </button>
      </div>
    </div>
  )
}
