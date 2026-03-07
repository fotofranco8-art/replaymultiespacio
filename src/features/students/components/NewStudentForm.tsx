'use client'

import { useState } from 'react'
import { inviteStudent } from '../services/students.actions'
import type { Discipline } from '@/features/scheduling/types'

interface Props {
  disciplines: Discipline[]
  onClose: () => void
}

export function NewStudentForm({ disciplines, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      await inviteStudent({
        full_name: data.get('full_name') as string,
        email: data.get('email') as string,
        phone: data.get('phone') as string,
        discipline_id: data.get('discipline_id') as string,
        plan_name: data.get('plan_name') as string,
        monthly_fee: Number(data.get('monthly_fee')),
        classes_per_month: Number(data.get('classes_per_month')),
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear alumno')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="rounded-2xl p-6 w-full max-w-md border border-white/10" style={{ background: '#1A0A30' }}>
        <h2 className="text-lg font-bold text-white mb-5">Nuevo alumno</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Nombre completo</label>
            <input
              name="full_name"
              required
              className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Teléfono</label>
            <input
              name="phone"
              type="tel"
              className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Disciplina</label>
            <select
              name="discipline_id"
              required
              className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: '#1A0A30' }}
            >
              <option value="" style={{ background: '#1A0A30' }}>Seleccionar...</option>
              {disciplines.map((d) => (
                <option key={d.id} value={d.id} style={{ background: '#1A0A30' }}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Plan</label>
              <input
                name="plan_name"
                required
                placeholder="Ej: 8 clases/mes"
                className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Clases/mes</label>
              <input
                name="classes_per_month"
                type="number"
                min="1"
                required
                className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Cuota mensual ($)</label>
            <input
              name="monthly_fee"
              type="number"
              min="0"
              step="0.01"
              required
              className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />
          </div>
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-white/10 rounded-lg py-2 text-sm text-white/60 hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #A855F7, #6366F1)' }}
            >
              {loading ? 'Enviando invitación...' : 'Invitar alumno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
