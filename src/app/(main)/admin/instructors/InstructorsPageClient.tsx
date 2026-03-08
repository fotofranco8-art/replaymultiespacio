'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import {
  inviteInstructor,
  updateInstructor,
  toggleInstructorStatus,
} from '@/features/instructors/services/instructors.actions'
import { INSTRUCTOR_SPECIALTIES } from '@/features/instructors/types'
import type { Instructor } from '@/features/instructors/types'

interface Props {
  instructors: Instructor[]
}

const listContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}
const listItem = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

function SpecialtiesGrid({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (s: string[]) => void
}) {
  function toggle(s: string) {
    onChange(selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s])
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {INSTRUCTOR_SPECIALTIES.map((s) => {
        const checked = selected.includes(s)
        return (
          <label
            key={s}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm"
            style={{
              borderColor: checked ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.1)',
              background: checked ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.04)',
              color: checked ? '#C084FC' : 'rgba(255,255,255,0.5)',
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(s)}
              className="w-3.5 h-3.5 rounded"
              style={{ accentColor: '#A855F7' }}
            />
            {s}
          </label>
        )
      })}
    </div>
  )
}

function InstructorModal({
  title,
  initial,
  onSave,
  onClose,
  pending,
  isEdit,
}: {
  title: string
  initial: { full_name: string; email: string; phone: string; specialties: string[] }
  onSave: (data: { full_name: string; email: string; phone: string; specialties: string[] }) => void
  onClose: () => void
  pending: boolean
  isEdit?: boolean
}) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    if (!form.full_name.trim()) { setError('El nombre es requerido'); return }
    if (!isEdit && !form.email.trim()) { setError('El email es requerido'); return }
    setError(null)
    onSave(form)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="rounded-2xl w-full max-w-md border border-white/10 overflow-y-auto max-h-[90vh]"
        style={{ background: '#1A0A30' }}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Nombre Completo</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="Ej. María García"
              className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />
          </div>

          {/* Email (solo al crear) */}
          {!isEdit ? (
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">
                Email <span className="text-white/30 text-xs">(para login del profesor)</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="profe@ejemplo.com"
                className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              />
            </div>
          ) : null}

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Teléfono</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+54 9 11 1234 5678"
              className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />
          </div>

          {/* Especialidades */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Especialidades</label>
            <SpecialtiesGrid
              selected={form.specialties}
              onChange={(s) => setForm((f) => ({ ...f, specialties: s }))}
            />
          </div>

          {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

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
              disabled={pending}
              onClick={handleSave}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
            >
              {pending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear Profesor'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function InstructorsPageClient({ instructors }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleInvite(data: { full_name: string; email: string; phone: string; specialties: string[] }) {
    setError(null)
    startTransition(async () => {
      try {
        await inviteInstructor({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone || undefined,
          specialties: data.specialties,
        })
        setShowForm(false)
        toast.success('Instructor invitado correctamente')
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al invitar instructor'
        setError(msg)
        toast.error(msg)
      }
    })
  }

  function handleUpdate(data: { full_name: string; email: string; phone: string; specialties: string[] }) {
    if (!editingInstructor) return
    startTransition(async () => {
      try {
        await updateInstructor(editingInstructor.id, {
          full_name: data.full_name,
          phone: data.phone || undefined,
          specialties: data.specialties,
        })
        setEditingInstructor(null)
        toast.success('Instructor actualizado')
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al actualizar'
        toast.error(msg)
      }
    })
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Instructores</h1>
          <p className="text-sm text-white/50 mt-0.5">{instructors.length} registrados</p>
        </div>
        <button
          onClick={() => { setError(null); setShowForm(true) }}
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
          <motion.ul
            className="divide-y divide-white/5"
            variants={listContainer}
            initial="hidden"
            animate="visible"
          >
            {instructors.map((inst) => {
              const initials = (inst.full_name ?? '?')
                .split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('')
                .toUpperCase()

              return (
                <motion.li key={inst.id} variants={listItem} className="flex items-center gap-4 px-4 md:px-6 py-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{inst.full_name}</p>
                    <p className="text-xs text-white/40 truncate">{inst.email}</p>
                    {inst.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {inst.specialties.slice(0, 3).map((s) => (
                          <span key={s} className="text-xs px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400">{s}</span>
                        ))}
                        {inst.specialties.length > 3 && (
                          <span className="text-xs text-white/30">+{inst.specialties.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {inst.phone && (
                    <p className="text-xs text-white/40 hidden md:block shrink-0">{inst.phone}</p>
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
                  <div className="flex gap-3 shrink-0">
                    <button
                      onClick={() => setEditingInstructor(inst)}
                      className="text-xs text-white/40 hover:text-white/70 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() =>
                        startTransition(() => toggleInstructorStatus(inst.id, !inst.is_active))
                      }
                      disabled={pending}
                      className="text-xs text-white/40 hover:text-white/70 disabled:opacity-50 transition-colors"
                    >
                      {inst.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </motion.li>
              )
            })}
          </motion.ul>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <InstructorModal
            title="Nuevo Profesor"
            initial={{ full_name: '', email: '', phone: '', specialties: [] }}
            onSave={handleInvite}
            onClose={() => setShowForm(false)}
            pending={pending}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editingInstructor && (
          <InstructorModal
            title="Editar instructor"
            isEdit
            initial={{
              full_name: editingInstructor.full_name ?? '',
              email: editingInstructor.email,
              phone: editingInstructor.phone ?? '',
              specialties: editingInstructor.specialties ?? [],
            }}
            onSave={handleUpdate}
            onClose={() => setEditingInstructor(null)}
            pending={pending}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
