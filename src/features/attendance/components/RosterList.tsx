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
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-white/50">En vivo</span>
        </div>
        <span className="text-sm font-semibold text-white">
          {roster.length} / {totalEnrolled} presentes
        </span>
      </div>

      {roster.length === 0 ? (
        <p className="text-sm text-white/40 py-8 text-center">
          Esperando check-ins...
        </p>
      ) : (
        <ul className="space-y-2">
          {roster.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/10 animate-in slide-in-from-top-2"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
              >
                {entry.profiles?.full_name?.charAt(0) ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">
                  {entry.profiles?.full_name ?? 'Alumno'}
                </p>
                <p className="text-xs text-white/40">
                  {new Date(entry.checked_in_at).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <span className="text-green-400 text-sm">✓</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
