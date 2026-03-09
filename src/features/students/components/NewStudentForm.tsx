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
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass-modal rounded-2xl w-full max-w-md overflow-y-auto max-h-[90vh]"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.15 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-6 pb-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h2
            className="text-lg font-semibold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Nuevo Estudiante
          </h2>
          <button
            onClick={onClose}
            className="transition-colors p-1 rounded-lg hover:bg-white/[0.06]"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Nombre Completo</label>
            <input
              name="full_name"
              required
              placeholder="Ej. Juan Pérez"
              className="glass-input"
            />
          </div>

          {/* Legajo */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>
              Legajo <span className="font-normal" style={{ color: 'rgba(255,255,255,0.25)' }}>(Opcional)</span>
            </label>
            <input
              name="legajo"
              placeholder="1234"
              className="glass-input"
            />
          </div>

          {/* Disciplinas */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Disciplinas</label>
            {disciplines.filter((d) => d.is_active).length === 0 ? (
              <p className="text-xs py-2" style={{ color: 'rgba(255,255,255,0.28)' }}>No hay disciplinas activas configuradas.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {disciplines
                  .filter((d) => d.is_active)
                  .map((d) => {
                    const checked = selectedDisciplines.includes(d.id)
                    return (
                      <label
                        key={d.id}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all"
                        style={{
                          borderColor: checked ? d.color : 'rgba(255,255,255,0.08)',
                          background: checked ? `${d.color}15` : 'rgba(255,255,255,0.04)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleDiscipline(d.id)}
                          className="w-3.5 h-3.5 rounded"
                          style={{ accentColor: d.color }}
                        />
                        <span className="text-sm font-medium truncate" style={{ color: checked ? d.color : 'rgba(255,255,255,0.55)' }}>
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
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>
                Email <span className="font-normal" style={{ color: 'rgba(255,255,255,0.25)' }}>(login)</span>
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="alumno@ejemplo.com"
                className="glass-input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Teléfono</label>
              <input
                name="phone"
                type="tel"
                placeholder="+54 9 11..."
                className="glass-input"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 rounded-xl px-3 py-2" style={{ background: 'rgba(239,68,68,0.10)' }}>{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 rounded-xl py-2.5 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 rounded-xl py-2.5 text-sm font-medium"
            >
              {loading ? 'Enviando...' : 'Crear Alumno'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
