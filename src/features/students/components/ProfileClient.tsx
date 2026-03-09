'use client'

import { useState, useTransition } from 'react'
import { logout } from '@/features/auth/services/auth.actions'
import { updateMyName } from '@/features/students/services/student-profile.actions'

interface Membership {
  plan_name: string | null
  monthly_fee: number | null
  classes_per_month: number | null
  status: string | null
  is_blocked: boolean | null
}

interface Props {
  profile: { id: string; full_name: string | null; center_id?: string | null }
  membership: Membership | null
  recoveryBalance: number
}

const glassCard = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.07)',
}

export default function ProfileClient({ profile, membership, recoveryBalance }: Props) {
  const [name, setName] = useState(profile.full_name ?? '')
  const [savedName, setSavedName] = useState(profile.full_name ?? '')
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const initials = savedName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'A'

  function handleEdit() {
    setEditing(true)
    setError('')
  }

  function handleCancel() {
    setName(savedName)
    setEditing(false)
    setError('')
  }

  function handleSave() {
    startTransition(async () => {
      const res = await updateMyName(name)
      if (res.error) {
        setError(res.error)
      } else {
        setSavedName(name.trim())
        setEditing(false)
        setError('')
      }
    })
  }

  return (
    <div className="min-h-screen" style={{ background: '#07050F' }}>
      <div className="max-w-sm mx-auto px-5 space-y-5 pt-4">

        {/* Avatar + nombre */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-50"
              style={{ background: 'rgba(255,45,120,0.60)' }}
            />
            <div
              className="relative w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl"
              style={{ background: 'linear-gradient(135deg, #FF2D78, #C0155A)' }}
            >
              {initials}
            </div>
          </div>

          {editing ? (
            <div className="w-full flex flex-col items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-center text-white text-lg font-semibold outline-none pb-1 bg-transparent"
                style={{
                  borderBottom: '2px solid #FF2D78',
                  fontFamily: 'var(--font-space-grotesk, sans-serif)',
                }}
                autoFocus
                maxLength={100}
              />
              {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}
              <div className="flex gap-3 mt-1">
                <button
                  onClick={handleCancel}
                  className="text-sm px-4 py-1.5 rounded-xl cursor-pointer transition-opacity hover:opacity-70"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="text-white text-sm font-semibold px-4 py-1.5 rounded-xl cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #FF2D78, #C0155A)',
                    opacity: isPending ? 0.6 : 1,
                    boxShadow: '0 0 14px rgba(255,45,120,0.25)',
                  }}
                >
                  {isPending ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p
                className="font-semibold text-[20px] text-white tracking-tight"
                style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
              >
                {savedName}
              </p>
              <button
                onClick={handleEdit}
                className="cursor-pointer transition-colors"
                style={{ color: 'rgba(255,255,255,0.30)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.30)')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Recovery balance */}
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: 'rgba(255,45,120,0.07)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,45,120,0.18)',
          }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: 'rgba(255,45,120,0.50)' }}
          >
            Clases de recuperación
          </p>
          <p
            className="font-bold"
            style={{
              fontSize: '72px',
              lineHeight: 1,
              color: '#FF2D78',
              fontFamily: 'var(--font-space-grotesk, sans-serif)',
              textShadow: '0 0 30px rgba(255,45,120,0.35)',
            }}
          >
            {recoveryBalance}
          </p>
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.30)' }}>
            Se acumulan cuando cancelan una clase. Coordiná con el centro.
          </p>
        </div>

        {/* Membresía */}
        <div className="rounded-2xl p-5" style={glassCard}>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'rgba(255,45,120,0.50)' }}
          >
            Mi membresía
          </p>
          {membership ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>Plan</span>
                <span className="text-white font-medium">{membership.classes_per_month} clases/mes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>Cuota</span>
                <span className="text-white font-medium">
                  ${Number(membership.monthly_fee ?? 0).toLocaleString('es-AR')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>Estado</span>
                <span
                  className="font-semibold text-xs px-2 py-0.5 rounded-full"
                  style={membership.is_blocked
                    ? { background: 'rgba(239,68,68,0.13)', color: '#f87171' }
                    : { background: 'rgba(34,197,94,0.13)', color: '#4ade80' }
                  }
                >
                  {membership.is_blocked ? 'Bloqueada' : 'Activa'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>Sin membresía activa.</p>
          )}
        </div>

        {/* Logout */}
        <form action={logout} className="pt-1">
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-sm font-medium cursor-pointer transition-opacity hover:opacity-70"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            Cerrar sesión
          </button>
        </form>

      </div>
    </div>
  )
}
