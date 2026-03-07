'use client'

import { useState, useTransition } from 'react'
import {
  inviteInstructor,
  toggleInstructorStatus,
} from '@/features/instructors/services/instructors.actions'
import type { Instructor } from '@/features/instructors/types'

interface Props {
  instructors: Instructor[]
}

export function InstructorsPageClient({ instructors }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        await inviteInstructor({ full_name: fullName, email, phone: phone || undefined })
        setFullName('')
        setEmail('')
        setPhone('')
        setShowForm(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al invitar instructor')
      }
    })
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Instructores</h1>
          <p className="text-sm text-white/50 mt-0.5">{instructors.length} registrados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
          style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
        >
          + Nuevo instructor
        </button>
      </div>

      {instructors.length === 0 ? (
        <div className="rounded-xl border border-white/10 p-12 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-white/40 text-sm">Sin instructores registrados.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <ul className="divide-y divide-white/5">
            {instructors.map((inst) => {
              const initials = inst.full_name
                .split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('')
                .toUpperCase()

              return (
                <li key={inst.id} className="flex items-center gap-4 px-6 py-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{inst.full_name}</p>
                    <p className="text-xs text-white/40 truncate">{inst.email}</p>
                  </div>
                  {inst.phone && (
                    <p className="text-xs text-white/40 hidden md:block">{inst.phone}</p>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      inst.is_active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/10 text-white/40'
                    }`}
                  >
                    {inst.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    onClick={() =>
                      startTransition(() => toggleInstructorStatus(inst.id, !inst.is_active))
                    }
                    disabled={pending}
                    className="text-xs text-white/40 hover:text-white/70 disabled:opacity-50 transition-colors shrink-0"
                  >
                    {inst.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="rounded-2xl p-8 w-full max-w-md border border-white/10" style={{ background: '#1A0A30' }}>
            <h2 className="text-lg font-bold text-white mb-6">Invitar instructor</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Nombre completo</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Teléfono (opcional)</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(null) }}
                  className="flex-1 border border-white/10 text-white/60 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-opacity hover:opacity-80"
                  style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
                >
                  {pending ? 'Invitando...' : 'Invitar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
