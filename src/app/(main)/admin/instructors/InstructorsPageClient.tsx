'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import {
  inviteInstructor,
  updateInstructor,
  toggleInstructorStatus,
  resendInviteInstructor,
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

function ResendButton({ email }: { email: string }) {
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  function handleClick() {
    setStatus('idle')
    startTransition(async () => {
      const res = await resendInviteInstructor(email)
      if (res.error) {
        setStatus('error')
        setMsg(res.error)
      } else {
        setStatus('ok')
        setTimeout(() => setStatus('idle'), 3000)
      }
    })
  }

  return (
    <div className="relative group/resend">
      <button
        onClick={handleClick}
        disabled={pending}
        title="Reenviar email de invitación"
        className="transition-colors disabled:opacity-40 cursor-pointer"
        style={{
          color: status === 'ok' ? '#4ade80' : status === 'error' ? '#f87171' : 'rgba(255,255,255,0.30)',
        }}
        onMouseEnter={(e) => { if (status === 'idle') e.currentTarget.style.color = 'rgba(255,255,255,0.70)' }}
        onMouseLeave={(e) => { if (status === 'idle') e.currentTarget.style.color = 'rgba(255,255,255,0.30)' }}
      >
        {/* Icono de email */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {status === 'ok' ? (
            <polyline points="20 6 9 17 4 12" />
          ) : (
            <>
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </>
          )}
        </svg>
      </button>
      {status === 'error' && (
        <div
          className="absolute bottom-full right-0 mb-1.5 whitespace-nowrap rounded-lg px-2 py-1 text-xs z-10"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          {msg}
        </div>
      )}
      {status === 'idle' && (
        <div
          className="absolute bottom-full right-0 mb-1.5 whitespace-nowrap rounded-lg px-2 py-1 text-xs z-10 pointer-events-none opacity-0 group-hover/resend:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.70)', color: 'rgba(255,255,255,0.70)' }}
        >
          Reenviar invitación
        </div>
      )}
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
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="glass-modal rounded-2xl w-full max-w-md overflow-y-auto max-h-[90vh]"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.15 }}
      >
        <div
          className="flex items-center justify-between px-6 pt-6 pb-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h2
            className="text-lg font-semibold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            {title}
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
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="Ej. María García"
              className="glass-input"
            />
          </div>

          {/* Email (solo al crear) */}
          {!isEdit ? (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>
                Email <span className="font-normal" style={{ color: 'rgba(255,255,255,0.25)' }}>(para login del profesor)</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="profe@ejemplo.com"
                className="glass-input"
              />
            </div>
          ) : null}

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Teléfono</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+54 9 11 1234 5678"
              className="glass-input"
            />
          </div>

          {/* Especialidades */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Especialidades</label>
            <SpecialtiesGrid
              selected={form.specialties}
              onChange={(s) => setForm((f) => ({ ...f, specialties: s }))}
            />
          </div>

          {error && <p className="text-sm text-red-400 rounded-xl px-3 py-2" style={{ background: 'rgba(239,68,68,0.10)' }}>{error}</p>}

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
              disabled={pending}
              onClick={handleSave}
              className="btn-primary flex-1 rounded-xl py-2.5 text-sm font-medium"
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1
            className="text-3xl font-semibold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Instructores
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>{instructors.length} registrados</p>
        </div>
        <button
          onClick={() => { setError(null); setShowForm(true) }}
          className="btn-primary px-4 py-2 rounded-xl text-sm"
        >
          + Nuevo instructor
        </button>
      </div>

      {instructors.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Sin instructores registrados.</p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <motion.ul variants={listContainer} initial="hidden" animate="visible">
            {instructors.map((inst) => {
              const initials = (inst.full_name ?? '?')
                .split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()

              return (
                <motion.li
                  key={inst.id}
                  variants={listItem}
                  className="flex items-center gap-4 px-4 md:px-6 py-4 transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="relative shrink-0">
                    <div
                      className="absolute inset-0 rounded-full blur-sm opacity-50"
                      style={{ background: 'rgba(168,85,247,0.35)' }}
                    />
                    <div
                      className="relative w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
                    >
                      {initials}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{inst.full_name}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{inst.email}</p>
                    {inst.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {inst.specialties.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                            style={{ background: 'rgba(168,85,247,0.12)', color: '#C084FC' }}
                          >
                            {s}
                          </span>
                        ))}
                        {inst.specialties.length > 3 && (
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>+{inst.specialties.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {inst.phone && (
                    <p className="text-xs hidden md:block shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>{inst.phone}</p>
                  )}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                    style={{
                      background: inst.is_active ? 'rgba(34,197,94,0.13)' : 'rgba(255,255,255,0.07)',
                      color: inst.is_active ? '#4ade80' : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {inst.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <ResendButton email={inst.email} />
                    <button
                      onClick={() => setEditingInstructor(inst)}
                      className="text-xs transition-colors"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.70)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => startTransition(() => toggleInstructorStatus(inst.id, !inst.is_active))}
                      disabled={pending}
                      className="text-xs transition-colors disabled:opacity-40"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.70)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
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
