'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { updateStudent } from '../services/students.actions'
import type { Discipline } from '@/features/scheduling/types'
import type { StudentWithMembership } from '../types'

interface Props {
  student: StudentWithMembership
  disciplines: Discipline[]
  onClose: () => void
}

export function EditStudentModal({ student, disciplines, onClose }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fullName, setFullName] = useState(student.full_name ?? '')
  const [phone, setPhone] = useState(student.phone ?? '')
  const [legajo, setLegajo] = useState(student.legajo ?? '')
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>(
    student.memberships
      .filter((m) => m.status === 'active' && m.discipline_id)
      .map((m) => m.discipline_id!)
  )

  function toggleDiscipline(id: string) {
    setSelectedDisciplines((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleSave() {
    if (!fullName.trim()) return
    setError(null)
    startTransition(async () => {
      try {
        await updateStudent(student.id, {
          full_name: fullName,
          phone: phone || undefined,
          legajo: legajo || undefined,
          discipline_ids: selectedDisciplines,
        })
        toast.success('Alumno actualizado')
        onClose()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al actualizar'
        setError(msg)
        toast.error(msg)
      }
    })
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
          <h2 className="text-lg font-bold text-white">Editar alumno</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Nombre Completo</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />
          </div>

          {/* Legajo */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">
              Legajo <span className="text-white/30 font-normal">(Opcional)</span>
            </label>
            <input
              value={legajo}
              onChange={(e) => setLegajo(e.target.value)}
              placeholder="1234"
              className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />
          </div>

          {/* Disciplinas */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Disciplinas</label>
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
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Teléfono</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="+54 9 11..."
              className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-white/30 mb-1.5">Email (no editable)</label>
            <p className="text-sm text-white/40 px-3 py-2.5 rounded-xl border border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
              {student.email}
            </p>
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
              type="button"
              disabled={pending || !fullName.trim()}
              onClick={handleSave}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #A855F7, #6366F1)' }}
            >
              {pending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
