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
    <div className="min-h-screen p-5" style={{ background: '#0A0A0A' }}>
      <div className="max-w-sm mx-auto space-y-5 pt-4">

        {/* Avatar + nombre */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl"
            style={{ background: '#FF2D78' }}
          >
            {initials}
          </div>

          {editing ? (
            <div className="w-full flex flex-col items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-center text-white text-lg font-semibold bg-transparent border-b-2 outline-none pb-1"
                style={{ borderColor: '#FF2D78' }}
                autoFocus
                maxLength={100}
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="flex gap-3 mt-1">
                <button
                  onClick={handleCancel}
                  className="text-white/40 text-sm px-4 py-1.5 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="text-white text-sm font-semibold px-4 py-1.5 rounded-lg"
                  style={{ background: '#FF2D78', opacity: isPending ? 0.6 : 1 }}
                >
                  {isPending ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-display font-bold text-[20px] text-white">{savedName}</p>
              <button onClick={handleEdit} className="text-white/30 hover:text-white/60 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          style={{ background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.2)' }}
        >
          <p className="font-body font-bold text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,45,120,0.53)' }}>
            Clases de recuperación
          </p>
          <p className="font-display font-extrabold" style={{ fontSize: '72px', lineHeight: 1, color: '#FF2D78' }}>
            {recoveryBalance}
          </p>
          <p className="text-white/30 text-xs mt-2">
            Se acumulan cuando cancelan una clase. Coordiná con el centro.
          </p>
        </div>

        {/* Membresía */}
        <div
          className="rounded-2xl p-5"
          style={{ background: '#18181B', border: '1px solid #27272A' }}
        >
          <p className="font-body font-bold text-[10px] uppercase tracking-wider mb-3" style={{ color: '#52525B' }}>Mi membresía</p>
          {membership ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Plan</span>
                <span className="text-white font-medium">{membership.classes_per_month} clases/mes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Cuota</span>
                <span className="text-white font-medium">
                  ${Number(membership.monthly_fee ?? 0).toLocaleString('es-AR')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Estado</span>
                <span
                  className="font-semibold text-xs px-2 py-0.5 rounded-full"
                  style={membership.is_blocked
                    ? { background: 'rgba(239,68,68,0.15)', color: '#ef4444' }
                    : { background: 'rgba(34,197,94,0.15)', color: '#22c55e' }
                  }
                >
                  {membership.is_blocked ? 'Bloqueada' : 'Activa'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-white/40 text-sm">Sin membresía activa.</p>
          )}
        </div>

        {/* Logout */}
        <form action={logout} className="pt-2">
          <button
            type="submit"
            className="font-body w-full py-3 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #3F3F46', color: '#A1A1AA' }}
          >
            Cerrar sesión
          </button>
        </form>

      </div>
    </div>
  )
}
