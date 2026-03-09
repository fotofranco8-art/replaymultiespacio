import { getProfile, logout } from '@/features/auth/services/auth.actions'
import { getNextClass, getAttendanceHistory } from '@/features/students/services/student-portal.actions'
import Link from 'next/link'

const REBOT_TIPS = [
  {
    title: 'Hidratación',
    text: 'Tomá agua antes, durante y después de entrenar.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6 9 4 13.5 4 16a8 8 0 0 0 16 0c0-2.5-2-7-8-14z" />
      </svg>
    ),
    color: '#38BDF8',
  },
  {
    title: 'Descanso',
    text: 'El músculo crece mientras dormís. 7-8 hs mínimo.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
    color: '#A78BFA',
  },
  {
    title: 'Nutrición',
    text: 'Comé proteínas dentro de los 30 min post-entreno.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12M12 12C12 7 8 4 3 3c0 5 3 9 9 9zm0 0c0-5 4-8 9-9c0 5-3 9-9 9z" />
      </svg>
    ),
    color: '#4ADE80',
  },
  {
    title: 'Constancia',
    text: '3 veces por semana es mejor que 7 veces en un mes.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    color: '#FB923C',
  },
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

const glassCard = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.07)',
}

export default async function StudentPage() {
  const profile = await getProfile()
  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#07050F' }}>
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

  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="min-h-screen relative" style={{ background: '#07050F' }}>
      {/* Ambient pink glow */}
      <div
        className="absolute inset-x-0 top-0 h-72 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,45,120,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-sm mx-auto px-5 space-y-5 pt-2">

        {/* Header */}
        <div className="flex items-center gap-3 pt-1">
          <div className="relative shrink-0">
            <div
              className="absolute inset-0 rounded-full blur-md opacity-60"
              style={{ background: 'rgba(255,45,120,0.50)' }}
            />
            <div
              className="relative w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #FF2D78, #C0155A)' }}
            >
              {initials}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="font-semibold text-[18px] text-white leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
            >
              Hola, {profile.full_name?.split(' ')[0]}
            </p>
            <p className="text-[12px] capitalize mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{today}</p>
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
              style={{
                background: nextClass.disciplineColor + '12',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${nextClass.disciplineColor}28`,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className="font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,45,120,0.90)', color: '#fff', fontSize: '10px', letterSpacing: '0.06em' }}
                >
                  PRÓXIMA CLASE
                </span>
                <span
                  className="font-semibold px-2 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)', fontSize: '11px' }}
                >
                  {timeLabel}
                </span>
              </div>
              <p
                className="font-semibold text-xl mb-1 text-white tracking-tight"
                style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
              >
                {nextClass.disciplineName}
              </p>
              <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {nextClass.startTime.slice(0, 5)}–{nextClass.endTime.slice(0, 5)}
                {nextClass.room ? ` · ${nextClass.room}` : ''}
              </p>
              {nextClass.teacherName && (
                <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>Prof. {nextClass.teacherName}</p>
              )}
              <Link
                href="/student/scan"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #FF2D78, #C0155A)',
                  boxShadow: '0 0 18px rgba(255,45,120,0.28)',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="3" height="3" rx="0.5" />
                </svg>
                Hacer Check-in
              </Link>
            </div>
          )
        })() : (
          <div className="rounded-2xl p-5 text-center" style={glassCard}>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>Sin clases próximas inscriptas</p>
            <Link
              href="/student/scan"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #FF2D78, #C0155A)', color: '#fff', boxShadow: '0 0 14px rgba(255,45,120,0.22)' }}
            >
              Escanear QR
            </Link>
          </div>
        )}

        {/* Tips Rebot */}
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'rgba(255,45,120,0.50)' }}
          >
            Rebot Tips
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {REBOT_TIPS.map((tip) => (
              <div
                key={tip.title}
                className="shrink-0 rounded-2xl p-4"
                style={{ ...glassCard, width: '148px' }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5"
                  style={{ background: tip.color + '18', color: tip.color, border: `1px solid ${tip.color}28` }}
                >
                  {tip.icon}
                </div>
                <p
                  className="font-semibold text-white text-sm mb-1 leading-tight"
                  style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
                >
                  {tip.title}
                </p>
                <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.38)' }}>{tip.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Historial reciente */}
        {history.length > 0 && (
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(255,45,120,0.50)' }}
            >
              Historial reciente
            </p>
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.classId}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={glassCard}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: item.disciplineColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium text-white text-sm truncate"
                      style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
                    >
                      {item.className}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>
                      {formatDate(item.scheduledDate)} · {item.startTime.slice(0, 5)}
                    </p>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={item.status === 'PRESENTE'
                      ? { background: 'rgba(34,197,94,0.13)', color: '#4ade80' }
                      : { background: 'rgba(249,115,22,0.13)', color: '#fb923c' }
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
