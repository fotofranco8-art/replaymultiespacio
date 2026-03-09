import { getProfile, logout } from '@/features/auth/services/auth.actions'
import { getNextClass, getAttendanceHistory } from '@/features/students/services/student-portal.actions'
import Link from 'next/link'

const REBOT_TIPS = [
  {
    emoji: '💧',
    title: 'Hidratación',
    body: 'Tomá agua antes y después de entrenar.',
  },
  {
    emoji: '😴',
    title: 'Descanso',
    body: 'El músculo crece mientras dormís. 7-8 hs mínimo.',
  },
  {
    emoji: '🔥',
    title: 'Constancia',
    body: '3 veces por semana es mejor que 7 en un mes.',
  },
]

function minutesUntil(dateStr: string, timeStr: string): number {
  const dt = new Date(`${dateStr}T${timeStr}`)
  return Math.round((dt.getTime() - Date.now()) / 60000)
}

function formatHistoryDate(dateStr: string, timeStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
  return `${day} · ${timeStr.slice(0, 5)}`
}

export default async function StudentPage() {
  const profile = await getProfile()
  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0A0A0A' }}>
      <div className="text-center space-y-4">
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>No se pudo cargar tu perfil</p>
        <form action={logout}>
          <button type="submit" className="text-sm font-semibold cursor-pointer" style={{ color: '#FF2D78' }}>
            Volver a iniciar sesión
          </button>
        </form>
      </div>
    </div>
  )

  const [nextClass, history] = await Promise.all([
    getNextClass(profile.id),
    getAttendanceHistory(profile.id, 5),
  ])

  const initials = (profile.full_name ?? 'A')
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  const firstName = profile.full_name?.split(' ')[0] ?? 'Alumno'

  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const timeLabel = nextClass ? (() => {
    const mins = minutesUntil(nextClass.scheduledDate, nextClass.startTime)
    const isToday = nextClass.scheduledDate === new Date().toISOString().split('T')[0]
    return isToday && mins > 0 && mins < 1440 ? `EN ${mins} MIN` : new Date(nextClass.scheduledDate + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
  })() : null

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0A0A0A', padding: '16px 20px 80px', gap: '12px' }}
    >

      {/* Header */}
      <div className="flex items-center" style={{ gap: '12px' }}>
        {/* Avatar */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 44, height: 44, borderRadius: 22,
            background: '#FF2D78',
          }}
        >
          <span style={{ color: '#fff', fontFamily: 'var(--font-space-grotesk, sans-serif)', fontSize: 16, fontWeight: 700 }}>
            {initials}
          </span>
        </div>

        {/* Nombre + fecha */}
        <div className="flex flex-col flex-1" style={{ gap: 2 }}>
          <span style={{ color: '#fff', fontFamily: 'var(--font-space-grotesk, sans-serif)', fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>
            Hola, {firstName}
          </span>
          <span style={{ color: '#71717A', fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 500, textTransform: 'capitalize' }}>
            {today}
          </span>
        </div>

        {/* Bell icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>

      {/* Card próxima clase */}
      {nextClass ? (
        <div
          className="flex flex-col"
          style={{
            background: '#1A0A2E',
            border: '1px solid rgba(124,58,237,0.27)',
            borderRadius: 20,
            padding: 16,
            gap: 12,
          }}
        >
          {/* Badge row */}
          <div className="flex items-center justify-between">
            <span
              style={{
                background: '#FF2D78', color: '#fff',
                fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 700,
                padding: '6px 12px', borderRadius: 20,
              }}
            >
              PRÓXIMA CLASE
            </span>
            <span
              style={{
                background: 'rgba(255,255,255,0.08)', color: '#A1A1AA',
                fontFamily: 'Space Mono, monospace', fontSize: 10, fontWeight: 500,
                padding: '6px 10px', borderRadius: 20,
              }}
            >
              {timeLabel}
            </span>
          </div>

          {/* Nombre clase */}
          <span style={{ color: '#fff', fontFamily: 'var(--font-space-grotesk, sans-serif)', fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>
            {nextClass.disciplineName}
          </span>

          {/* Horario y sala */}
          <div className="flex items-center" style={{ gap: 8 }}>
            {/* Timer icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span style={{ color: '#A1A1AA', fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 500 }}>
              {nextClass.startTime.slice(0, 5)} – {nextClass.endTime.slice(0, 5)}{nextClass.room ? `  ·  ${nextClass.room}` : ''}
            </span>
          </div>

          {/* Profesor */}
          {nextClass.teacherName && (
            <div className="flex items-center" style={{ gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              <span style={{ color: '#71717A', fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 500 }}>
                Prof. {nextClass.teacherName}
              </span>
            </div>
          )}

          {/* Botón check-in */}
          <Link
            href="/student/scan"
            className="flex items-center justify-center"
            style={{
              background: '#FF2D78',
              borderRadius: 14,
              padding: '12px 18px',
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="3" height="3" rx="0.5" />
            </svg>
            <span style={{ color: '#fff', fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700 }}>
              Hacer Check-in
            </span>
          </Link>
        </div>
      ) : (
        <div
          className="flex flex-col items-center"
          style={{
            background: '#18181B',
            border: '1px solid #27272A',
            borderRadius: 20,
            padding: 16,
            gap: 12,
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'Manrope, sans-serif', fontSize: 13 }}>
            No tenés clases próximas inscriptas
          </span>
          <Link
            href="/student/scan"
            className="flex items-center justify-center"
            style={{ background: '#FF2D78', borderRadius: 14, padding: '10px 18px', gap: 8 }}
          >
            <span style={{ color: '#fff', fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 700 }}>
              Escanear QR
            </span>
          </Link>
        </div>
      )}

      {/* Tips section */}
      <div className="flex flex-col" style={{ gap: 10 }}>
        <span style={{ color: '#52525B', fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }}>
          PARA VOS — REBOT
        </span>
        <div
          className="flex overflow-x-auto"
          style={{ gap: 10, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          {REBOT_TIPS.map((tip) => (
            <div
              key={tip.title}
              className="flex flex-col shrink-0"
              style={{
                width: 110, minWidth: 110,
                background: '#18181B',
                border: '1px solid #27272A',
                borderRadius: 16,
                padding: 14,
                gap: 6,
              }}
            >
              <span style={{ fontSize: 20 }}>{tip.emoji}</span>
              <span style={{ color: '#fff', fontFamily: 'var(--font-space-grotesk, sans-serif)', fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
                {tip.title}
              </span>
              <span style={{ color: '#71717A', fontFamily: 'Manrope, sans-serif', fontSize: 11, lineHeight: 1.4 }}>
                {tip.body}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Historial reciente */}
      {history.length > 0 && (
        <div className="flex flex-col" style={{ gap: 10 }}>
          <span style={{ color: '#52525B', fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }}>
            HISTORIAL RECIENTE
          </span>
          {history.map((item) => (
            <div
              key={item.classId}
              className="flex items-center"
              style={{
                background: '#18181B',
                border: '1px solid #27272A',
                borderRadius: 14,
                padding: '10px 14px',
                gap: 12,
              }}
            >
              {/* Dot disciplina */}
              <div
                style={{
                  width: 8, height: 8, borderRadius: 4, flexShrink: 0,
                  background: item.disciplineColor || '#7C3AED',
                }}
              />

              {/* Info */}
              <div className="flex flex-col flex-1" style={{ gap: 2, minWidth: 0 }}>
                <span style={{ color: '#fff', fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.className}
                </span>
                <span style={{ color: '#52525B', fontFamily: 'Space Mono, monospace', fontSize: 11, textTransform: 'capitalize' }}>
                  {formatHistoryDate(item.scheduledDate, item.startTime)}
                </span>
              </div>

              {/* Badge estado */}
              <span
                style={item.status === 'PRESENTE'
                  ? { background: 'rgba(34,197,94,0.094)', color: '#22c55e', fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, flexShrink: 0 }
                  : { background: 'rgba(249,115,22,0.094)', color: '#f97316', fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, flexShrink: 0 }
                }
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
