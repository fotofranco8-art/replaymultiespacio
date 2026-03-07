'use client'

import { useRealtimeRoster } from '../hooks/useRealtimeRoster'
import type { AttendanceEntry } from '../hooks/useRealtimeRoster'

interface Props {
  classId: string
  initial: AttendanceEntry[]
  totalEnrolled: number
}

export function RosterList({ classId, initial, totalEnrolled }: Props) {
  const roster = useRealtimeRoster(classId, initial)

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-gray-500">En vivo</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">
          {roster.length} / {totalEnrolled} presentes
        </span>
      </div>

      {roster.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">
          Esperando check-ins...
        </p>
      ) : (
        <ul className="space-y-2">
          {roster.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3 animate-in slide-in-from-top-2"
            >
              <div className="w-9 h-9 rounded-full bg-green-200 flex items-center justify-center text-sm font-bold text-green-800">
                {entry.profiles?.full_name?.charAt(0) ?? '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {entry.profiles?.full_name ?? 'Alumno'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(entry.checked_in_at).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <span className="ml-auto text-green-600 text-sm">✓</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
