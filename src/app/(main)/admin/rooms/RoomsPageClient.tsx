'use client'

import { useState, useTransition } from 'react'
import { createRoom, toggleRoom } from '@/features/rooms/services/rooms.actions'
import type { Room } from '@/features/rooms/types'

interface Props {
  rooms: Room[]
}

export function RoomsPageClient({ rooms }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState(20)
  const [description, setDescription] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        await createRoom({ name, capacity, description: description || undefined })
        setName('')
        setCapacity(20)
        setDescription('')
        setShowForm(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear aula')
      }
    })
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Aulas</h1>
          <p className="text-sm text-white/50 mt-0.5">{rooms.length} configuradas en el centro</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
          style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
        >
          + Nueva aula
        </button>
      </div>

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
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white">{room.name}</p>
                  {room.description && (
                    <p className="text-xs text-white/40 mt-0.5">{room.description}</p>
                  )}
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
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-xs text-white/40">{room.capacity} personas</span>
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

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="rounded-2xl p-8 w-full max-w-md border border-white/10" style={{ background: '#1A0A30' }}>
            <h2 className="text-lg font-bold text-white mb-6">Nueva aula</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Nombre</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ej: Sala Principal"
                  className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Capacidad</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  min={1}
                  className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  Descripción (opcional)
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(null) }}
                  className="flex-1 border border-white/10 text-white/60 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-opacity hover:opacity-80"
                  style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
                >
                  {pending ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
