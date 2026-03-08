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

export default async function StudentClasesPage() {
  const enrollments = await getMyClasses()

  return (
    <div className="min-h-screen p-5" style={{ background: '#0A0A0A' }}>
      <div className="max-w-sm mx-auto space-y-5">

        {/* Header */}
        <div className="pt-2 flex items-center gap-3">
          <Link
            href="/student"
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div>
            <p className="font-display font-bold text-[20px] text-white leading-tight">Mis Clases</p>
            <p className="font-body text-[12px]" style={{ color: '#71717A' }}>Próximas clases inscriptas</p>
          </div>
        </div>

        {/* Classes list */}
        {enrollments.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-white/40 text-sm">No tenés clases inscriptas próximamente</p>
            <Link
              href="/student/scan"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: '#FF2D78', color: '#fff' }}
            >
              Escanear QR para inscribirte
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map((e) => {
              const cls = e.classes as unknown as RawClass
              const disc = Array.isArray(cls?.disciplines) ? cls.disciplines[0] : cls?.disciplines
              const color = disc?.color ?? '#A855F7'

              return (
                <div
                  key={e.id}
                  className="rounded-2xl p-4 relative"
                  style={{ background: color + '18', border: `1px solid ${color}33` }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-display font-bold text-white text-base">{disc?.name ?? 'Clase'}</p>
                    {cls?.is_cancelled && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-2"
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                      >
                        CANCELADA
                      </span>
                    )}
                  </div>
                  <p className="text-white/50 text-sm capitalize">
                    {formatDate(cls?.scheduled_date ?? '')}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {cls?.start_time?.slice(0, 5)} – {cls?.end_time?.slice(0, 5)}
                  </p>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
