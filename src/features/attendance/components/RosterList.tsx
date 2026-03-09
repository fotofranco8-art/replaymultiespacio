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
  const percent = totalEnrolled > 0 ? Math.round((roster.length / totalEnrolled) * 100) : 0

  return (
    <div>
      {/* Header con conteo */}
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div className="flex items-center" style={{ gap: 8 }}>
          <div className="flex items-center" style={{ gap: 6 }}>
            <span
              style={{
                display: 'inline-block',
                width: 8, height: 8, borderRadius: 4,
                background: '#22c55e',
                boxShadow: '0 0 6px rgba(34,197,94,0.60)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
            <span style={{ color: '#22c55e', fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em' }}>
              EN VIVO
            </span>
          </div>
        </div>

        <div className="flex items-center" style={{ gap: 6 }}>
          <span style={{ color: '#fff', fontFamily: 'var(--font-space-grotesk, sans-serif)', fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
            {roster.length}
            <span style={{ color: '#3F3F46', fontSize: 16, fontWeight: 500 }}>/{totalEnrolled}</span>
          </span>
          <span
            style={{
              background: roster.length > 0 ? 'rgba(34,197,94,0.10)' : 'rgba(255,255,255,0.06)',
              color: roster.length > 0 ? '#22c55e' : '#52525B',
              fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 700,
              padding: '3px 8px', borderRadius: 12,
            }}
          >
            {percent}%
          </span>
        </div>
      </div>

      {/* Barra de progreso */}
      <div
        style={{
          height: 4, borderRadius: 2, background: '#27272A', marginBottom: 20, overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percent}%`,
            background: 'linear-gradient(90deg, #A855F7, #7C3AED)',
            borderRadius: 2,
            transition: 'width 0.5s ease',
          }}
        />
      </div>

      {roster.length === 0 ? (
        <div
          className="flex flex-col items-center"
          style={{ padding: '28px 0', gap: 8 }}
        >
          <div
            style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(168,85,247,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 4,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Manrope, sans-serif', fontSize: 13, textAlign: 'center' }}>
            Esperando check-ins…
          </span>
          <span style={{ color: '#3F3F46', fontFamily: 'Manrope, sans-serif', fontSize: 11, textAlign: 'center' }}>
            Los alumnos aparecen aquí al escanear el QR
          </span>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: 8 }}>
          {roster.map((entry) => {
            const name = entry.profiles?.full_name ?? 'Alumno'
            const initial = name.charAt(0).toUpperCase()
            const time = new Date(entry.checked_in_at).toLocaleTimeString('es-AR', {
              hour: '2-digit', minute: '2-digit',
            })

            return (
              <div
                key={entry.id}
                className="flex items-center"
                style={{
                  background: 'rgba(34,197,94,0.04)',
                  border: '1px solid rgba(34,197,94,0.12)',
                  borderRadius: 14,
                  padding: '10px 14px',
                  gap: 12,
                }}
              >
                {/* Avatar */}
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                  }}
                >
                  <span style={{ color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-space-grotesk, sans-serif)' }}>
                    {initial}
                  </span>
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1" style={{ gap: 1, minWidth: 0 }}>
                  <span style={{ color: '#fff', fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name}
                  </span>
                  <span style={{ color: '#52525B', fontFamily: 'Space Mono, monospace', fontSize: 11 }}>
                    {time}
                  </span>
                </div>

                {/* Check */}
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 24, height: 24, borderRadius: 12,
                    background: 'rgba(34,197,94,0.15)',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
