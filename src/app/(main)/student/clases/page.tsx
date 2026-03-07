import { getProfile } from '@/features/auth/services/auth.actions'
import { getMyClasses } from '@/features/students/services/student-portal.actions'
import Link from 'next/link'

export default async function StudentClassesPage() {
  const profile = await getProfile()
  if (!profile) return null

  const enrollments = await getMyClasses()

  return (
    <div className="min-h-screen p-6" style={{ background: '#080616' }}>
      <div className="max-w-sm mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/student" className="text-white/50 hover:text-white transition-colors text-lg">
            ←
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">Mis clases</h1>
            <p className="text-sm text-white/50">Próximas clases inscriptas</p>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div className="rounded-xl border border-white/10 p-6 text-center"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="text-sm text-white/40">Sin clases inscriptas próximas.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {enrollments.map((enrollment) => {
              const cls = enrollment.classes as unknown as {
                id: string
                scheduled_date: string
                start_time: string
                end_time: string
                is_cancelled: boolean
                disciplines: { name: string; color: string } | { name: string; color: string }[] | null
              } | null
              if (!cls) return null

              const disc = Array.isArray(cls.disciplines)
                ? cls.disciplines[0]
                : (cls.disciplines as { name: string; color: string } | null)

              return (
                <div
                  key={enrollment.id}
                  className={`rounded-xl border border-white/10 p-4 flex items-center gap-3 ${
                    cls.is_cancelled ? 'opacity-40' : ''
                  }`}
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg shrink-0"
                    style={{ backgroundColor: disc?.color ?? '#A855F7' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">
                      {disc?.name}
                      {cls.is_cancelled && (
                        <span className="ml-2 text-xs text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded-full">
                          Cancelada
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5">
                      {new Date(cls.scheduled_date + 'T00:00:00').toLocaleDateString('es-AR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      · {cls.start_time.slice(0, 5)}–{cls.end_time.slice(0, 5)}
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
