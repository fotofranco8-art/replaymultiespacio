'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { inviteStudent } from '../services/students.actions'
import type { Discipline } from '@/features/scheduling/types'

interface Props {
  disciplines: Discipline[]
  onClose: () => void
}

export function NewStudentForm({ disciplines, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const filteredDisciplines = disciplines
    .filter((d) => d.is_active)
    .filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))

  function toggleDiscipline(id: string) {
    setSelectedDisciplines((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (selectedDisciplines.length === 0) {
      setError('Seleccioná al menos una disciplina.')
      return
    }
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      await inviteStudent({
        full_name: data.get('full_name') as string,
        email: data.get('email') as string,
        phone: (data.get('phone') as string) || undefined,
        legajo: (data.get('legajo') as string) || undefined,
        discipline_ids: selectedDisciplines,
      })
      toast.success('Invitación enviada exitosamente')
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear alumno'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="rounded-2xl w-full max-w-md border border-white/10 overflow-y-auto max-h-[90vh]"
        style={{ background: '#1A0A30' }}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Nuevo Estudiante</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Nombre Completo</label>
            <input
              name="full_name"
              required
              placeholder="Ej. Juan Pérez"
              className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />
          </div>

          {/* Legajo */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">
              Legajo <span className="text-white/30 font-normal">(Opcional)</span>
            </label>
            <input
              name="legajo"
              placeholder="1234"
              className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />
          </div>

          {/* Disciplinas */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Disciplinas</label>
            {disciplines.filter((d) => d.is_active).length === 0 ? (
              <p className="text-xs text-white/30 py-2">No hay disciplinas activas configuradas.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {disciplines
                  .filter((d) => d.is_active)
                  .map((d) => {
                    const checked = selectedDisciplines.includes(d.id)
                    return (
                      <label
                        key={d.id}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors"
                        style={{
                          borderColor: checked ? d.color : 'rgba(255,255,255,0.1)',
                          background: checked ? `${d.color}18` : 'rgba(255,255,255,0.04)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleDiscipline(d.id)}
                          className="w-3.5 h-3.5 rounded"
                          style={{ accentColor: d.color }}
                        />
                        <span className="text-sm font-medium truncate" style={{ color: checked ? d.color : 'rgba(255,255,255,0.6)' }}>
                          {d.name}
                        </span>
                      </label>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Email + Teléfono */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">
                Email <span className="text-white/30 text-xs">(login)</span>
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="alumno@ejemplo.com"
                className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Teléfono</label>
              <input
                name="phone"
                type="tel"
                placeholder="+54 9 11..."
                className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-white/10 rounded-xl py-2.5 text-sm text-white/60 hover:bg-white/5 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #A855F7, #6366F1)' }}
            >
              {loading ? 'Enviando...' : 'Crear Alumno'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
