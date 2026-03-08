'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { addHoliday, removeHoliday } from '../services/scheduling.actions'
import type { Holiday } from '../types'

interface Props {
  holidays: Holiday[]
}

export function HolidayManager({ holidays }: Props) {
  const [pending, startTransition] = useTransition()
  const [date, setDate] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    if (!date || !name) return
    setError(null)
    startTransition(async () => {
      try {
        await addHoliday(date, name)
        setDate('')
        setName('')
        toast.success('Feriado agregado')
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error al agregar feriado'
        setError(msg)
        toast.error(msg)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del feriado"
          className="flex-1 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        />
        <button
          onClick={handleAdd}
          disabled={pending || !date || !name}
          className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-opacity hover:opacity-80"
          style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
        >
          Agregar
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {holidays.length > 0 ? (
        <ul className="space-y-2">
          {holidays.map((h) => (
            <li key={h.id} className="flex items-center justify-between rounded-lg px-4 py-3 border border-white/10"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <div>
                  <span className="text-sm font-medium text-white">{h.name}</span>
                  <span className="ml-3 text-sm text-white/40">{h.date}</span>
                </div>
              </div>
              <button
                onClick={() => startTransition(async () => {
                  await removeHoliday(h.id)
                  toast.success('Feriado eliminado')
                })}
                disabled={pending}
                className="text-xs text-white/30 hover:text-red-400 transition-colors"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-white/40">Sin feriados configurados.</p>
      )}
    </div>
  )
}
