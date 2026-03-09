import { getMyClasses } from '@/features/students/services/student-portal.actions'
import Link from 'next/link'

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'short',
  })
}

type RawClass = {
  id: string
  scheduled_date: string
  start_time: string
  end_time: string
  is_cancelled: boolean
  disciplines: { name: string; color: string } | { name: string; color: string }[] | null
}

const glassCard = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.07)',
}

export default async function StudentClasesPage() {
  const enrollments = await getMyClasses()

  return (
    <div className="min-h-screen" style={{ background: '#07050F' }}>
      <div className="max-w-sm mx-auto px-5 space-y-5 pt-2">

        {/* Header */}
        <div className="pt-1 flex items-center gap-3">
          <Link
            href="/student"
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-opacity hover:opacity-70"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div>
            <p
              className="font-semibold text-[20px] text-white leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
            >
              Mis Clases
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
              {enrollments.length > 0 ? `${enrollments.length} próximas inscriptas` : 'Próximas clases inscriptas'}
            </p>
          </div>
        </div>

        {/* Classes list */}
        {enrollments.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={glassCard}>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>No tenés clases inscriptas próximamente</p>
            <Link
              href="/student/scan"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #FF2D78, #C0155A)', color: '#fff', boxShadow: '0 0 14px rgba(255,45,120,0.22)' }}
            >
              Escanear QR para inscribirte
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map((e) => {
              const cls = e.classes as unknown as RawClass
              const disc = Array.isArray(cls?.disciplines) ? cls.disciplines[0] : cls?.disciplines
              const color = disc?.color ?? '#FF2D78'

              return (
                <div
                  key={e.id}
                  className="rounded-2xl p-4 relative"
                  style={{
                    background: color + '10',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `1px solid ${color}25`,
                  }}
                >
                  {/* Color accent line */}
                  <div
                    className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                    style={{ background: color }}
                  />
                  <div className="pl-3">
                    <div className="flex items-start justify-between mb-1">
                      <p
                        className="font-semibold text-white text-base tracking-tight"
                        style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
                      >
                        {disc?.name ?? 'Clase'}
                      </p>
                      {cls?.is_cancelled && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-2"
                          style={{ background: 'rgba(239,68,68,0.13)', color: '#f87171' }}
                        >
                          CANCELADA
                        </span>
                      )}
                    </div>
                    <p className="text-sm capitalize" style={{ color: 'rgba(255,255,255,0.50)' }}>
                      {formatDate(cls?.scheduled_date ?? '')}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>
                      {cls?.start_time?.slice(0, 5)} – {cls?.end_time?.slice(0, 5)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
