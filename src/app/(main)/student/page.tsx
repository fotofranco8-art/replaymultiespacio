import { getProfile } from '@/features/auth/services/auth.actions'
import { getNextClass, getAttendanceHistory } from '@/features/students/services/student-portal.actions'
import Link from 'next/link'

const REBOT_TIPS = [
  { emoji: '💧', title: 'Hidratación', text: 'Tomá agua antes, durante y después de entrenar.' },
  { emoji: '😴', title: 'Descanso', text: 'El músculo crece mientras dormís. 7-8 hs mínimo.' },
  { emoji: '🥗', title: 'Nutrición', text: 'Comé proteínas dentro de los 30 min post-entreno.' },
  { emoji: '🔥', title: 'Constancia', text: '3 veces por semana es mejor que 7 veces en un mes.' },
]

function minutesUntil(dateStr: string, timeStr: string): number {
  const dt = new Date(`${dateStr}T${timeStr}`)
  return Math.round((dt.getTime() - Date.now()) / 60000)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

export default async function StudentPage() {
  const profile = await getProfile()
  if (!profile) return null

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

  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="min-h-screen p-5" style={{ background: '#080616' }}>
      <div className="max-w-sm mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3 pt-2">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: '#FF2D78' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-base leading-tight">
              Hola, {profile.full_name?.split(' ')[0]}
            </p>
            <p className="text-white/40 text-xs capitalize">{today}</p>
          </div>
        </div>

        {/* Próxima clase */}
        {nextClass ? (() => {
          const mins = minutesUntil(nextClass.scheduledDate, nextClass.startTime)
          const isToday = nextClass.scheduledDate === new Date().toISOString().split('T')[0]
          const timeLabel = isToday && mins > 0 && mins < 1440
            ? `EN ${mins} MIN`
            : formatDate(nextClass.scheduledDate)

          return (
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: nextClass.disciplineColor + '22', border: `1px solid ${nextClass.disciplineColor}44` }}
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: '#FF2D78', color: '#fff' }}
                >
                  PRÓXIMA CLASE
                </span>
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                >
                  {timeLabel}
                </span>
              </div>
              <p className="text-white font-bold text-xl mb-1">{nextClass.disciplineName}</p>
              <p className="text-white/60 text-sm mb-1">
                {nextClass.startTime.slice(0, 5)}–{nextClass.endTime.slice(0, 5)}
                {nextClass.room ? ` · ${nextClass.room}` : ''}
              </p>
              {nextClass.teacherName && (
                <p className="text-white/40 text-xs mb-4">Prof. {nextClass.teacherName}</p>
              )}
              <Link
                href="/student/scan"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
                style={{ background: '#FF2D78' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" />
                </svg>
                Hacer Check-in
              </Link>
            </div>
          )
        })() : (
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-white/40 text-sm">Sin clases próximas inscriptas</p>
            <Link
              href="/student/scan"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: '#FF2D78', color: '#fff' }}
            >
              Escanear QR
            </Link>
          </div>
        )}

        {/* Tips Rebot */}
        <div>
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Para vos — Rebot</p>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {REBOT_TIPS.map((tip) => (
              <div
                key={tip.title}
                className="shrink-0 rounded-xl p-4"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  width: '148px',
                }}
              >
                <span className="text-2xl">{tip.emoji}</span>
                <p className="text-white font-semibold text-sm mt-2">{tip.title}</p>
                <p className="text-white/40 text-xs mt-1 leading-snug">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Historial reciente */}
        {history.length > 0 && (
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Historial reciente</p>
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.classId}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: item.disciplineColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.className}</p>
                    <p className="text-white/40 text-xs">
                      {formatDate(item.scheduledDate)} · {item.startTime.slice(0, 5)}
                    </p>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={item.status === 'PRESENTE'
                      ? { background: 'rgba(34,197,94,0.15)', color: '#22c55e' }
                      : { background: 'rgba(249,115,22,0.15)', color: '#f97316' }
                    }
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
