'use client'

import { useState, useTransition } from 'react'
import {
  createDiscipline,
  updateDiscipline,
  toggleDiscipline,
} from '@/features/scheduling/services/scheduling.actions'
import type { Discipline } from '@/features/scheduling/types'

interface Props {
  disciplines: Discipline[]
}

export function DisciplinesPageClient({ disciplines }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#A855F7')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [pending, startTransition] = useTransition()

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await createDiscipline(name, color)
      setName('')
      setColor('#A855F7')
      setShowForm(false)
    })
  }

  function startEdit(d: Discipline) {
    setEditingId(d.id)
    setEditName(d.name)
    setEditColor(d.color)
  }

  function handleUpdate(id: string) {
    startTransition(async () => {
      await updateDiscipline(id, editName, editColor)
      setEditingId(null)
    })
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Disciplinas</h1>
          <p className="text-sm text-white/50 mt-0.5">{disciplines.length} configuradas en el centro</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {disciplines.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-white/10 p-5 flex flex-col gap-3"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <div
                className="w-full h-20 rounded-lg"
                style={{ backgroundColor: d.color }}
              />
              {editingId === d.id ? (
                <div className="space-y-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: 'rgba(255,255,255,0.07)' }}
                  />
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-full h-8 rounded cursor-pointer border border-white/10"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(d.id)}
                      disabled={pending}
                      className="flex-1 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 text-xs text-white/40 hover:text-white/60"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-semibold text-white text-sm">{d.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">— plantillas activas</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        d.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {d.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(d)}
                        className="text-xs text-white/40 hover:text-white/70 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => startTransition(() => toggleDiscipline(d.id, !d.is_active))}
                        disabled={pending}
                        className="text-xs text-white/40 hover:text-white/70 disabled:opacity-50 transition-colors"
                      >
                        {d.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="rounded-2xl p-8 w-full max-w-md border border-white/10" style={{ background: '#1A0A30' }}>
            <h2 className="text-lg font-bold text-white mb-6">Nueva disciplina</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Nombre</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ej: Yoga, Pilates"
                  className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Color</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer border border-white/10 p-1"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
