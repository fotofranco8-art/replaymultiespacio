'use client'

import { useState, useTransition } from 'react'
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
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error')
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
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del feriado"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <button
          onClick={handleAdd}
          disabled={pending || !date || !name}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          Agregar
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {holidays.length > 0 ? (
        <ul className="space-y-2">
          {holidays.map((h) => (
            <li key={h.id} className="flex items-center justify-between bg-orange-50 rounded-lg px-4 py-2">
              <div>
                <span className="text-sm font-medium text-gray-800">{h.name}</span>
                <span className="ml-3 text-sm text-gray-500">{h.date}</span>
              </div>
              <button
                onClick={() => startTransition(() => removeHoliday(h.id))}
                disabled={pending}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">Sin feriados configurados.</p>
      )}
    </div>
  )
}
