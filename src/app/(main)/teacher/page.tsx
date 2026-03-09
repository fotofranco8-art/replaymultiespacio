import { logout, getProfile } from '@/features/auth/services/auth.actions'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'


async function getTeacherClasses(teacherId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('classes')
    .select(`
      id, scheduled_date, start_time, end_time, room,
      disciplines (name, color),
      attendance (count),
      class_enrollments (count)
    `)
    .eq('teacher_id', teacherId)
    .eq('scheduled_date', today)
    .eq('is_cancelled', false)
    .order('start_time')

  return data ?? []
}

export default async function TeacherPage() {
  const profile = await getProfile()
  if (!profile) return null

  const classes = await getTeacherClasses(profile.id)

  const initials = (profile.full_name ?? 'P')
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  const firstName = profile.full_name?.split(' ')[0] ?? 'Profe'

  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0A0A0A', padding: '16px 20px 80px', gap: '16px' }}
    >
      {/* Ambient glow sutil */}
      <div
        className="fixed inset-x-0 top-0 h-64 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% -10%, rgba(168,85,247,0.10) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      <div className="relative flex flex-col" style={{ gap: '16px', zIndex: 1 }}>

        {/* Header */}
        <div className="flex items-center" style={{ gap: '12px' }}>
          {/* Avatar — gradiente púrpura para docentes */}
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 44, height: 44, borderRadius: 22,
              background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
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

          {/* Cerrar sesión */}
          <form action={logout}>
            <button
              type="submit"
              title="Cerrar sesión"
              className="cursor-pointer transition-opacity hover:opacity-70"
              style={{ color: '#52525B' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </form>
        </div>

        {/* Sección clases de hoy */}
        <div className="flex flex-col" style={{ gap: 8 }}>
          <span style={{ color: '#52525B', fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }}>
            TUS CLASES DE HOY
          </span>

          {classes.length === 0 ? (
            <div
              className="flex flex-col items-center"
              style={{
                background: '#18181B',
                border: '1px solid #27272A',
                borderRadius: 20,
                padding: '28px 16px',
                gap: 10,
              }}
            >
              <div
                className="flex items-center justify-center"
                style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(168,85,247,0.10)', marginBottom: 4 }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'Manrope, sans-serif', fontSize: 13, textAlign: 'center' }}>
                No tenés clases programadas para hoy
              </span>
            </div>
          ) : (
            classes.map((cls) => {
              const disciplineName = Array.isArray(cls.disciplines)
                ? cls.disciplines[0]?.name
                : (cls.disciplines as { name: string; color: string } | null)?.name
              const disciplineColor = Array.isArray(cls.disciplines)
                ? cls.disciplines[0]?.color
                : (cls.disciplines as { name: string; color: string } | null)?.color

              const enrolled = Array.isArray(cls.class_enrollments)
                ? cls.class_enrollments.length
                : 0
              const present = Array.isArray(cls.attendance) ? cls.attendance.length : 0

              return (
                <Link
                  key={cls.id}
                  href={`/teacher/class/${cls.id}`}
                  className="flex items-center cursor-pointer"
                  style={{
                    background: '#18181B',
                    border: '1px solid #27272A',
                    borderRadius: 16,
                    padding: '14px 16px',
                    gap: 12,
                    textDecoration: 'none',
                  }}
                >
                  {/* Badge disciplina */}
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 46, height: 46, borderRadius: 13,
                      background: disciplineColor ?? '#A855F7',
                    }}
                  >
                    <span style={{ color: '#fff', fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-space-grotesk, sans-serif)' }}>
                      {disciplineName?.charAt(0) ?? '?'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col flex-1" style={{ gap: 3, minWidth: 0 }}>
                    <span style={{ color: '#fff', fontFamily: 'var(--font-space-grotesk, sans-serif)', fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {disciplineName ?? 'Clase'}
                    </span>
                    <div className="flex items-center" style={{ gap: 6 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span style={{ color: '#71717A', fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 500 }}>
                        {cls.start_time.slice(0, 5)}–{cls.end_time.slice(0, 5)}{cls.room ? `  ·  ${cls.room}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Counter asistencia */}
                  <div className="flex flex-col items-end shrink-0" style={{ gap: 1 }}>
                    <span style={{ color: '#fff', fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-space-grotesk, sans-serif)', lineHeight: 1 }}>
                      {present}
                      <span style={{ color: '#52525B', fontSize: 14, fontWeight: 500 }}>/{enrolled}</span>
                    </span>
                    <span style={{ color: '#52525B', fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 600 }}>
                      PRESENTES
                    </span>
                  </div>

                  {/* Flecha */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3F3F46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}
