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
            Editar alumno
          </h2>
          <button
            onClick={onClose}
            className="transition-colors p-1 rounded-lg hover:bg-white/[0.06]"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Nombre Completo</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="glass-input"
            />
          </div>

          {/* Legajo */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>
              Legajo <span className="font-normal" style={{ color: 'rgba(255,255,255,0.25)' }}>(Opcional)</span>
            </label>
            <input
              value={legajo}
              onChange={(e) => setLegajo(e.target.value)}
              placeholder="1234"
              className="glass-input"
            />
          </div>

          {/* Disciplinas */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Disciplinas</label>
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
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Teléfono</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="+54 9 11..."
              className="glass-input"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Email (no editable)</label>
            <p
              className="text-sm px-3 py-2.5 rounded-xl"
              style={{
                color: 'rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {student.email}
            </p>
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
              type="button"
              disabled={pending || !fullName.trim()}
              onClick={handleSave}
              className="btn-primary flex-1 rounded-xl py-2.5 text-sm font-medium"
            >
              {pending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
