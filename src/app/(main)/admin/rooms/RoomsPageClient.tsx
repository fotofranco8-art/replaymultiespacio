'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { createRoom, toggleRoom } from '@/features/rooms/services/rooms.actions'
import type { Room, RoomStats } from '@/features/rooms/types'

interface Props {
  rooms: Room[]
  stats: RoomStats
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
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setFormName('')
    setFormCapacity(20)
    setFormDescription('')
    setFormEquipment([])
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
        })
        resetForm()
        setShowForm(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear aula')
      }
    })
  }

  const inputCls = 'w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500'
  const inputStyle = { background: 'rgba(255,255,255,0.07)' }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Aulas y Equipos</h1>
          <p className="text-sm text-white/50 mt-0.5">{rooms.filter((r) => r.is_active).length} activas</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
          style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
        >
          + Nueva aula
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-xs text-white/50 mb-1.5">Total Aulas</p>
          <p className="text-2xl font-bold text-white">{stats.total_rooms}</p>
        </div>
        <div className="rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-xs text-white/50 mb-1.5">Capacidad Total</p>
          <p className="text-2xl font-bold text-white">{stats.total_capacity}</p>
          <p className="text-xs text-white/30">personas</p>
        </div>
        <div className="rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-xs text-white/50 mb-1.5">Ocupación Hoy</p>
          <p className="text-2xl font-bold text-purple-400">{stats.occupancy_today}%</p>
        </div>
      </div>

      {/* Rooms grid */}
      {rooms.length === 0 ? (
        <div className="rounded-xl border border-white/10 p-12 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-white/40 text-sm">Sin aulas configuradas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="rounded-xl border border-white/10 p-5 flex flex-col gap-3"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏛️</span>
                  <div>
                    <p className="font-semibold text-white text-sm">{room.name}</p>
                    <p className="text-xs text-white/40">Cap. {room.capacity} personas</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    room.is_active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/10 text-white/40'
                  }`}
                >
                  {room.is_active ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              {/* Description */}
              {room.description && (
                <p className="text-xs text-white/40">{room.description}</p>
              )}

              {/* Equipment chips */}
              {room.equipment && room.equipment.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {room.equipment.map((eq) => (
                    <span key={eq} className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
                      {eq}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end pt-1 border-t border-white/5">
                <button
                  onClick={() => startTransition(() => toggleRoom(room.id, !room.is_active))}
                  disabled={pending}
                  className="text-xs text-white/40 hover:text-white/70 disabled:opacity-50 transition-colors"
                >
                  {room.is_active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowForm(false); resetForm() } }}
        >
          <div className="rounded-2xl w-full max-w-md border border-white/10 overflow-y-auto max-h-[90vh]" style={{ background: '#1A0A30' }}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Nueva aula</h2>
              <button onClick={() => { setShowForm(false); resetForm() }} className="text-white/40 hover:text-white/70 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Nombre</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="Ej. Sala Principal"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Capacidad</label>
                <input
                  type="number"
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(Number(e.target.value))}
                  min={1}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Descripción (opcional)</label>
                <input
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Breve descripción..."
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Equipamiento</label>
                <EquipmentTagInput equipment={formEquipment} onChange={setFormEquipment} />
                <p className="text-xs text-white/30 mt-1">Presioná Enter o coma para agregar cada item</p>
              </div>

              {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm() }}
                  className="flex-1 border border-white/10 text-white/60 rounded-xl py-2.5 text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending || !formName.trim()}
                  className="flex-1 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-80"
                  style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
                >
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
