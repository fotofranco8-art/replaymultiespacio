'use client'

import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import {
  createDiscipline,
  updateDiscipline,
  toggleDiscipline,
} from '@/features/scheduling/services/scheduling.actions'
import type { Discipline } from '@/features/scheduling/types'

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
    <div className="flex rounded-lg overflow-hidden border border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="flex-1 py-2 text-sm font-medium transition-all"
          style={
            value === opt.value
              ? { background: 'linear-gradient(135deg, #A855F7, #6366F1)', color: '#fff' }
              : { color: 'rgba(255,255,255,0.4)' }
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

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-2xl w-full max-w-md border border-white/10 overflow-y-auto max-h-[90vh]"
        style={{ background: '#1A0A30' }}
      >
        <div className="p-6 space-y-5">
          <h2 className="text-lg font-bold text-white">{title}</h2>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Nombre</label>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
              placeholder="Ej. Danza Jazz"
              className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Tipo</label>
            <Toggle
              options={[{ value: 'grupal', label: 'Grupal' }, { value: 'individual', label: 'Individual' }]}
              value={form.type}
              onChange={(v) => set('type', v)}
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Color identificativo</label>
            <ColorPicker value={form.color} onChange={(c) => set('color', c)} />
          </div>

          {/* Precio + Capacidad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Precio Mensual</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">$</span>
                <input
                  type="number"
                  min="0"
                  value={form.monthly_price}
                  onChange={(e) => set('monthly_price', e.target.value)}
                  className="w-full border border-white/10 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Capacidad Máx.</label>
              <input
                type="number"
                min="1"
                value={form.max_capacity}
                onChange={(e) => set('max_capacity', e.target.value)}
                className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              />
            </div>
          </div>

          {/* Modalidad */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Modalidad</label>
            <Toggle
              options={[{ value: 'anual', label: '🔄 Anual' }, { value: 'seminario', label: '🎯 Seminario' }]}
              value={form.modality}
              onChange={(v) => set('modality', v)}
            />
          </div>

          {/* Activa */}
          <label className="flex items-center gap-3 cursor-pointer select-none rounded-lg border border-white/10 px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set('is_active', e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500"
            />
            <span className="text-sm text-white/70">Activa</span>
          </label>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="Breve descripción de la disciplina..."
              className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-white/10 text-white/60 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={pending || !form.name.trim()}
              onClick={() => onSave(form)}
              className="flex-1 text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-80"
              style={{ background: 'linear-gradient(135deg, #A855F7, #6366F1)' }}
            >
              {pending ? 'Guardando...' : title.includes('Nueva') ? 'Crear Disciplina' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface Props {
  disciplines: Discipline[]
  templateCounts: Record<string, number>
}

export function DisciplinesPageClient({ disciplines, templateCounts }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null)
  const [pending, startTransition] = useTransition()

  function handleCreate(form: DisciplineFormState) {
    startTransition(async () => {
      await createDiscipline({
        name: form.name,
        color: form.color,
        type: form.type,
        monthly_price: Number(form.monthly_price),
        max_capacity: Number(form.max_capacity),
        modality: form.modality,
        description: form.description || undefined,
      })
      setShowCreate(false)
    })
  }

  function handleUpdate(form: DisciplineFormState) {
    if (!editingDiscipline) return
    startTransition(async () => {
      await updateDiscipline(editingDiscipline.id, {
        name: form.name,
        color: form.color,
        type: form.type,
        monthly_price: Number(form.monthly_price),
        max_capacity: Number(form.max_capacity),
        modality: form.modality,
        description: form.description || undefined,
      })
      setEditingDiscipline(null)
    })
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Disciplinas</h1>
          <p className="text-sm text-white/50 mt-0.5">{disciplines.length} configuradas en el centro</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
          style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
        >
          + Nueva disciplina
        </button>
      </div>

      {disciplines.length === 0 ? (
        <div className="rounded-xl border border-white/10 p-12 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-white/40 text-sm">Sin disciplinas configuradas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {disciplines.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-white/10 overflow-hidden flex flex-col"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              {/* Color strip */}
              <div className="h-2 w-full" style={{ backgroundColor: d.color }} />

              <div className="p-4 flex flex-col gap-3 flex-1">
                {/* Name + status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <p className="font-semibold text-white text-sm leading-tight">{d.name}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      d.is_active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'
                    }`}
                  >
                    {d.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/50">
                    {d.type === 'grupal' ? 'Grupal' : 'Individual'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/50">
                    {d.modality === 'anual' ? '🔄 Anual' : '🎯 Seminario'}
                  </span>
                </div>

                {/* Price + capacity */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white font-semibold">
                    ${Number(d.monthly_price).toLocaleString('es-AR')}
                    <span className="text-white/40 font-normal text-xs">/mes</span>
                  </span>
                  <span className="text-white/40 text-xs">Cap. {d.max_capacity}</span>
                </div>

                {/* Template count */}
                <p className="text-xs text-white/30">
                  {templateCounts[d.id]
                    ? `${templateCounts[d.id]} plantilla${templateCounts[d.id] === 1 ? '' : 's'} activa${templateCounts[d.id] === 1 ? '' : 's'}`
                    : 'Sin plantillas'}
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-1 border-t border-white/5">
                  <button
                    onClick={() => setEditingDiscipline(d)}
                    className="flex-1 text-xs text-white/50 hover:text-white/80 transition-colors py-1"
                  >
                    Editar
                  </button>
                  <div className="w-px bg-white/10" />
                  <button
                    onClick={() => startTransition(() => toggleDiscipline(d.id, !d.is_active))}
                    disabled={pending}
                    className="flex-1 text-xs text-white/50 hover:text-white/80 disabled:opacity-50 transition-colors py-1"
                  >
                    {d.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
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
    </div>
  )
}
