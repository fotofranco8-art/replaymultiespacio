'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { createRoom, toggleRoom, rotateRoomsForWeek } from '@/features/rooms/services/rooms.actions'
import type { Room, RoomStats } from '@/features/rooms/types'

interface Props {
  rooms: Room[]
  stats: RoomStats
}

// Lunes de la semana actual en formato YYYY-MM-DD (hora local)
function getCurrentWeekMonday(): string {
  const d = new Date()
  const day = d.getDay() // 0=dom
  const diff = (day === 0 ? -6 : 1 - day)
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function formatWeekLabel(mondayStr: string): string {
  const d = new Date(mondayStr + 'T00:00:00')
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function EquipmentTagInput({
  equipment,
  onChange,
}: {
  equipment: string[]
  onChange: (tags: string[]) => void
}) {
  const [input, setInput] = useState('')

  function addTag() {
    const tag = input.trim()
    if (tag && !equipment.includes(tag)) {
      onChange([...equipment, tag])
    }
    setInput('')
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && !input && equipment.length > 0) {
      onChange(equipment.slice(0, -1))
    }
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 min-h-[42px] border border-white/10 rounded-xl px-3 py-2 cursor-text focus-within:ring-2 focus-within:ring-purple-500"
      style={{ background: 'rgba(255,255,255,0.07)' }}
      onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}
    >
      {equipment.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(equipment.filter((t) => t !== tag)) }}
            className="hover:text-white transition-colors"
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={addTag}
        placeholder={equipment.length === 0 ? 'Espejo, Piano, Barras... (Enter para agregar)' : ''}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
      />
    </div>
  )
}

export function RoomsPageClient({ rooms, stats }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formCapacity, setFormCapacity] = useState(20)
  const [formDescription, setFormDescription] = useState('')
  const [formEquipment, setFormEquipment] = useState<string[]>([])
  const [formType, setFormType] = useState<'grupal' | 'individual'>('grupal')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Rotación semanal
  const [rotationWeek, setRotationWeek] = useState(getCurrentWeekMonday)
  const [rotationResult, setRotationResult] = useState<{ assigned: number; skipped: number } | null>(null)
  const [rotatingPending, startRotating] = useTransition()

  function resetForm() {
    setFormName('')
    setFormCapacity(20)
    setFormDescription('')
    setFormEquipment([])
    setFormType('grupal')
    setError(null)
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        await createRoom({
          name: formName,
          capacity: formCapacity,
          description: formDescription || undefined,
          equipment: formEquipment,
          type: formType,
        })
        resetForm()
        setShowForm(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear aula')
      }
    })
  }

  function handleRotate() {
    setRotationResult(null)
    startRotating(async () => {
      const result = await rotateRoomsForWeek(rotationWeek)
      setRotationResult(result)
    })
  }

  const glassCard = {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.07)',
  }

  const inputCls = 'glass-input w-full'

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1
            className="text-3xl font-semibold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Aulas y Equipos
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>{rooms.filter((r) => r.is_active).length} activas</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="btn-primary px-4 py-2 rounded-xl text-sm"
        >
          + Nueva aula
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Aulas', value: stats.total_rooms, color: 'text-white' },
          { label: 'Capacidad Total', value: `${stats.total_capacity} pers.`, color: 'text-white' },
          { label: 'Ocupación Hoy', value: `${stats.occupancy_today}%`, color: '#C084FC' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4" style={glassCard}>
            <p className="text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.40)' }}>{label}</p>
            <p
              className="text-2xl font-semibold tracking-tight"
              style={{ color: typeof color === 'string' && color.startsWith('#') ? color : '#fff', fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Rooms grid */}
      {rooms.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={glassCard}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Sin aulas configuradas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="rounded-2xl p-5 flex flex-col gap-3"
              style={glassCard}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg opacity-80">🏛️</span>
                  <div>
                    <p className="font-medium text-white text-sm">{room.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>Cap. {room.capacity} personas</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: room.is_active ? 'rgba(34,197,94,0.13)' : 'rgba(255,255,255,0.07)',
                      color: room.is_active ? '#4ade80' : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {room.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={
                      room.type === 'grupal'
                        ? { background: 'rgba(168,85,247,0.14)', color: '#C084FC' }
                        : { background: 'rgba(249,115,22,0.14)', color: '#fb923c' }
                    }
                  >
                    {room.type === 'grupal' ? 'Grupal' : 'Individual'}
                  </span>
                </div>
              </div>

              {room.description && (
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>{room.description}</p>
              )}

              {room.equipment && room.equipment.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {room.equipment.map((eq) => (
                    <span
                      key={eq}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(168,85,247,0.12)', color: '#C084FC', border: '1px solid rgba(168,85,247,0.20)' }}
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              )}

              <div
                className="flex items-center justify-end pt-1"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <button
                  onClick={() => startTransition(() => toggleRoom(room.id, !room.is_active))}
                  disabled={pending}
                  className="text-xs transition-colors disabled:opacity-40"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.70)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                >
                  {room.is_active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sección rotación semanal */}
      <div className="rounded-2xl p-6" style={glassCard}>
        <h2
          className="text-base font-semibold text-white mb-1"
          style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
        >
          Rotación Semanal
        </h2>
        <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.38)' }}>
          Asigna aulas automáticamente a las clases sin aula fija de la semana seleccionada.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Navegación de semana */}
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => { setRotationResult(null); setRotationWeek((w) => addDays(w, -7)) }}
              className="text-white/50 hover:text-white transition-colors text-sm px-1"
            >
              ←
            </button>
            <span className="text-sm text-white font-medium min-w-[140px] text-center">
              Sem. {formatWeekLabel(rotationWeek)}
            </span>
            <button
              onClick={() => { setRotationResult(null); setRotationWeek((w) => addDays(w, 7)) }}
              className="text-white/50 hover:text-white transition-colors text-sm px-1"
            >
              →
            </button>
          </div>

          {/* Botón rotar */}
          <button
            onClick={handleRotate}
            disabled={rotatingPending}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #FF2D78, #C0155A)' }}
          >
            {rotatingPending ? 'Rotando...' : 'Rotar ahora'}
          </button>

          {/* Resultado */}
          {rotationResult && (
            <span
              className="text-sm font-medium px-3 py-2 rounded-xl"
              style={{
                background: rotationResult.assigned > 0 ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                color: rotationResult.assigned > 0 ? '#4ade80' : 'rgba(255,255,255,0.45)',
              }}
            >
              {rotationResult.assigned > 0
                ? `✓ ${rotationResult.assigned} clases asignadas`
                : 'Sin clases pendientes de asignación'}
              {rotationResult.skipped > 0 && ` · ${rotationResult.skipped} sin aula disponible`}
            </span>
          )}
        </div>
      </div>

      {/* Create modal */}
      {showForm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowForm(false); resetForm() } }}
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
                Nueva aula
              </h2>
              <button
                onClick={() => { setShowForm(false); resetForm() }}
                className="transition-colors p-1 rounded-lg hover:bg-white/[0.06]"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Nombre</label>
                <input value={formName} onChange={(e) => setFormName(e.target.value)} required placeholder="Ej. Sala Principal" className={inputCls} />
              </div>

              {/* Tipo de aula */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Tipo de aula</label>
                <div className="flex gap-2">
                  {(['grupal', 'individual'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormType(t)}
                      className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                      style={
                        formType === t
                          ? t === 'grupal'
                            ? { background: 'rgba(168,85,247,0.22)', color: '#C084FC', border: '1px solid rgba(168,85,247,0.35)' }
                            : { background: 'rgba(249,115,22,0.18)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.30)' }
                          : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.40)', border: '1px solid rgba(255,255,255,0.08)' }
                      }
                    >
                      {t === 'grupal' ? 'Grupal' : 'Individual'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Capacidad</label>
                <input type="number" value={formCapacity} onChange={(e) => setFormCapacity(Number(e.target.value))} min={1} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Descripción (opcional)</label>
                <input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Breve descripción..." className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Equipamiento</label>
                <EquipmentTagInput equipment={formEquipment} onChange={setFormEquipment} />
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>Presioná Enter o coma para agregar cada item</p>
              </div>

              {error && <p className="text-sm text-red-400 rounded-xl px-3 py-2" style={{ background: 'rgba(239,68,68,0.10)' }}>{error}</p>}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="btn-secondary flex-1 rounded-xl py-2.5 text-sm">
                  Cancelar
                </button>
                <button type="submit" disabled={pending || !formName.trim()} className="btn-primary flex-1 rounded-xl py-2.5 text-sm font-medium">
                  {pending ? 'Creando...' : 'Crear aula'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
