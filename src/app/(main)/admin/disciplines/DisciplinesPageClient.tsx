'use client'

import { useState, useTransition } from 'react'
import { Check, X, Trash2 } from 'lucide-react'
import {
  createDiscipline,
  updateDiscipline,
  toggleDiscipline,
  deleteDiscipline,
} from '@/features/scheduling/services/scheduling.actions'
import type { Discipline } from '@/features/scheduling/types'
import { toast } from 'sonner'

const COLOR_PALETTE = [
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
  '#A855F7', '#EC4899', '#F43F5E', '#EF4444',
  '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#64748B',
]

interface DisciplineFormState {
  name: string
  color: string
  type: 'grupal' | 'individual'
  monthly_price: string
  max_capacity: string
  modality: 'anual' | 'seminario'
  description: string
  is_active: boolean
}

const defaultForm: DisciplineFormState = {
  name: '',
  color: '#A855F7',
  type: 'grupal',
  monthly_price: '0',
  max_capacity: '20',
  modality: 'anual',
  description: '',
  is_active: true,
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_PALETTE.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="w-7 h-7 rounded-full relative transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/40"
          style={{ backgroundColor: c }}
        >
          {value === c && (
            <Check size={13} className="absolute inset-0 m-auto text-white" strokeWidth={3} />
          )}
        </button>
      ))}
    </div>
  )
}

function Toggle({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div
      className="flex rounded-xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="flex-1 py-2.5 text-sm font-medium transition-all"
          style={
            value === opt.value
              ? { background: 'linear-gradient(135deg, #A855F7, #7C3AED)', color: '#fff', boxShadow: '0 0 16px rgba(168,85,247,0.25)' }
              : { color: 'rgba(255,255,255,0.40)' }
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function DisciplineModal({
  title,
  initial,
  onSave,
  onClose,
  pending,
}: {
  title: string
  initial: DisciplineFormState
  onSave: (form: DisciplineFormState) => void
  onClose: () => void
  pending: boolean
}) {
  const [form, setForm] = useState<DisciplineFormState>(initial)
  const set = (k: keyof DisciplineFormState, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }))

  const isEdit = !title.includes('Nueva')

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="glass-modal rounded-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
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

        <div className="p-6 space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Nombre</label>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
              placeholder="Ej. Danza Jazz"
              className="glass-input"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Tipo</label>
            <Toggle
              options={[{ value: 'grupal', label: 'Grupal' }, { value: 'individual', label: 'Individual' }]}
              value={form.type}
              onChange={(v) => set('type', v)}
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Color identificativo</label>
            <ColorPicker value={form.color} onChange={(c) => set('color', c)} />
          </div>

          {/* Precio + Capacidad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Precio Mensual</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>$</span>
                <input
                  type="number"
                  min="0"
                  value={form.monthly_price}
                  onChange={(e) => set('monthly_price', e.target.value)}
                  className="glass-input"
                  style={{ paddingLeft: '1.75rem' }}
                />
              </div>
              {isEdit && (
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  Se aplica a todas las membresías activas
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Capacidad Máx.</label>
              <input
                type="number"
                min="1"
                value={form.max_capacity}
                onChange={(e) => set('max_capacity', e.target.value)}
                className="glass-input"
              />
              {isEdit && (
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  Se actualiza en plantillas y clases futuras
                </p>
              )}
            </div>
          </div>

          {/* Modalidad */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Modalidad</label>
            <Toggle
              options={[{ value: 'anual', label: '🔄 Anual' }, { value: 'seminario', label: '🎯 Seminario' }]}
              value={form.modality}
              onChange={(v) => set('modality', v)}
            />
          </div>

          {/* Activa */}
          <label
            className="flex items-center gap-3 cursor-pointer select-none rounded-xl px-4 py-3 transition-all"
            style={{
              background: form.is_active ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${form.is_active ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.07)'}`,
            }}
          >
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set('is_active', e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: '#22C55E' }}
            />
            <div>
              <p className="text-sm text-white font-medium">Activa</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>Visible en el calendario y alumnos</p>
            </div>
          </label>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="Breve descripción de la disciplina..."
              className="glass-input resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 rounded-xl py-2.5 text-sm">
              Cancelar
            </button>
            <button
              type="button"
              disabled={pending || !form.name.trim()}
              onClick={() => onSave(form)}
              className="btn-primary flex-1 rounded-xl py-2.5 text-sm font-medium"
            >
              {pending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear Disciplina'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmModal({
  discipline,
  templateCount,
  futureCount,
  studentCount,
  onConfirm,
  onClose,
  pending,
}: {
  discipline: Discipline
  templateCount: number
  futureCount: number
  studentCount: number
  onConfirm: () => void
  onClose: () => void
  pending: boolean
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-2xl w-full max-w-sm p-6 flex flex-col gap-5"
        style={{ background: '#18181B', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.22)' }}
          >
            <Trash2 size={16} style={{ color: '#EF4444' }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Eliminar disciplina</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>Esta acción no se puede deshacer</p>
          </div>
        </div>

        <div
          className="rounded-xl px-4 py-3 flex items-center gap-2"
          style={{ background: 'rgba(255,255,255,0.04)', borderLeft: `3px solid ${discipline.color}` }}
        >
          <span className="text-sm font-medium text-white">{discipline.name}</span>
        </div>

        <div
          className="rounded-xl px-4 py-3 space-y-1.5"
          style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <p className="text-xs font-semibold" style={{ color: 'rgba(239,68,68,0.80)' }}>Se va a eliminar:</p>
          <ul className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <li>· {templateCount} plantilla{templateCount !== 1 ? 's' : ''} activa{templateCount !== 1 ? 's' : ''}</li>
            <li>· {futureCount} clase{futureCount !== 1 ? 's' : ''} futura{futureCount !== 1 ? 's' : ''} + inscripciones</li>
            <li>· {studentCount} membresía{studentCount !== 1 ? 's' : ''} enlazada{studentCount !== 1 ? 's' : ''} (solo el enlace, no el alumno)</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.60)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ background: 'rgba(239,68,68,0.18)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.30)' }}
          >
            {pending ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface Props {
  disciplines: Discipline[]
  templateCounts: Record<string, number>
  futureCounts: Record<string, number>
  studentCounts: Record<string, number>
}

export function DisciplinesPageClient({ disciplines, templateCounts, futureCounts, studentCounts }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null)
  const [deletingDiscipline, setDeletingDiscipline] = useState<Discipline | null>(null)
  const [pending, startTransition] = useTransition()

  function handleCreate(form: DisciplineFormState) {
    startTransition(async () => {
      try {
        await createDiscipline({
          name: form.name,
          color: form.color,
          type: form.type,
          monthly_price: Number(form.monthly_price),
          max_capacity: Number(form.max_capacity),
          modality: form.modality,
          description: form.description || undefined,
        })
        toast.success('Disciplina creada')
        setShowCreate(false)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error al crear disciplina')
      }
    })
  }

  function handleUpdate(form: DisciplineFormState) {
    if (!editingDiscipline) return
    startTransition(async () => {
      try {
        await updateDiscipline(editingDiscipline.id, {
          name: form.name,
          color: form.color,
          type: form.type,
          monthly_price: Number(form.monthly_price),
          max_capacity: Number(form.max_capacity),
          modality: form.modality,
          description: form.description || undefined,
        })
        toast.success('Disciplina actualizada')
        setEditingDiscipline(null)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error al actualizar disciplina')
      }
    })
  }

  function handleDelete() {
    if (!deletingDiscipline) return
    startTransition(async () => {
      try {
        await deleteDiscipline(deletingDiscipline.id)
        toast.success('Disciplina eliminada')
        setDeletingDiscipline(null)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error al eliminar disciplina')
      }
    })
  }

  const glassCard = {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.07)',
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1
            className="text-3xl font-semibold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Disciplinas
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>
            {disciplines.length} configurada{disciplines.length !== 1 ? 's' : ''} en el centro
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary px-4 py-2 rounded-xl text-sm">
          + Nueva disciplina
        </button>
      </div>

      {disciplines.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={glassCard}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Sin disciplinas configuradas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {disciplines.map((d) => {
            const tCount = templateCounts[d.id] ?? 0
            const fCount = futureCounts[d.id] ?? 0
            const sCount = studentCounts[d.id] ?? 0

            return (
              <div
                key={d.id}
                className="rounded-2xl overflow-hidden flex flex-col"
                style={{ ...glassCard, borderLeft: `3px solid ${d.color}` }}
              >
                <div className="p-5 flex flex-col gap-3 flex-1">
                  {/* Nombre + estado */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <p className="font-semibold text-white text-sm leading-tight truncate">{d.name}</p>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                      style={{
                        background: d.is_active ? 'rgba(34,197,94,0.13)' : 'rgba(255,255,255,0.07)',
                        color: d.is_active ? '#4ade80' : 'rgba(255,255,255,0.35)',
                      }}
                    >
                      {d.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  {/* Badges tipo + modalidad */}
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      {d.type === 'grupal' ? 'Grupal' : 'Individual'}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      {d.modality === 'anual' ? '🔄 Anual' : '🎯 Seminario'}
                    </span>
                  </div>

                  {/* Descripción preview */}
                  {d.description && (
                    <p
                      className="text-xs leading-relaxed"
                      style={{
                        color: 'rgba(255,255,255,0.40)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      } as React.CSSProperties}
                    >
                      {d.description}
                    </p>
                  )}

                  {/* Precio + capacidad */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">
                      ${Number(d.monthly_price).toLocaleString('es-AR')}
                      <span className="text-xs font-normal" style={{ color: 'rgba(255,255,255,0.38)' }}>/mes</span>
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>Cap. {d.max_capacity}</span>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
                    <span>{sCount} alumno{sCount !== 1 ? 's' : ''}</span>
                    <span>·</span>
                    <span>{tCount} plantilla{tCount !== 1 ? 's' : ''}</span>
                    <span>·</span>
                    <span>{fCount} próx.</span>
                  </div>

                  {/* Acciones */}
                  <div
                    className="flex pt-2 mt-auto"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <button
                      onClick={() => setEditingDiscipline(d)}
                      className="flex-1 text-xs py-1.5 transition-colors rounded-lg"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                    >
                      Editar
                    </button>
                    <div className="w-px my-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
                    <button
                      onClick={() => startTransition(() => toggleDiscipline(d.id, !d.is_active))}
                      disabled={pending}
                      className="flex-1 text-xs py-1.5 transition-colors rounded-lg disabled:opacity-40"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                    >
                      {d.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                    <div className="w-px my-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
                    <button
                      onClick={() => setDeletingDiscipline(d)}
                      className="flex-1 text-xs py-1.5 transition-colors rounded-lg"
                      style={{ color: 'rgba(239,68,68,0.50)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(239,68,68,0.50)')}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCreate && (
        <DisciplineModal
          title="Nueva disciplina"
          initial={defaultForm}
          onSave={handleCreate}
          onClose={() => setShowCreate(false)}
          pending={pending}
        />
      )}

      {editingDiscipline && (
        <DisciplineModal
          title="Editar disciplina"
          initial={{
            name: editingDiscipline.name,
            color: editingDiscipline.color,
            type: editingDiscipline.type ?? 'grupal',
            monthly_price: String(editingDiscipline.monthly_price ?? 0),
            max_capacity: String(editingDiscipline.max_capacity ?? 20),
            modality: editingDiscipline.modality ?? 'anual',
            description: editingDiscipline.description ?? '',
            is_active: editingDiscipline.is_active,
          }}
          onSave={handleUpdate}
          onClose={() => setEditingDiscipline(null)}
          pending={pending}
        />
      )}

      {deletingDiscipline && (
        <DeleteConfirmModal
          discipline={deletingDiscipline}
          templateCount={templateCounts[deletingDiscipline.id] ?? 0}
          futureCount={futureCounts[deletingDiscipline.id] ?? 0}
          studentCount={studentCounts[deletingDiscipline.id] ?? 0}
          onConfirm={handleDelete}
          onClose={() => setDeletingDiscipline(null)}
          pending={pending}
        />
      )}
    </div>
  )
}
