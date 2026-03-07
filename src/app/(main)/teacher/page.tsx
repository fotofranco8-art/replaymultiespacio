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

  return (
    <div className="min-h-screen p-8" style={{ background: '#080616' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Portal Profesor</h1>
            <p className="text-sm text-white/50 mt-0.5">Hola, {profile.full_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/teacher/profile" className="text-sm text-white/40 hover:text-white/70 transition-colors">
              Mi perfil
            </Link>
            <form action={logout}>
              <button type="submit" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>

        <h2 className="font-semibold text-white/70 text-xs uppercase tracking-widest mb-3">Mis clases de hoy</h2>

        {classes.length === 0 ? (
          <div className="rounded-xl border border-white/10 p-8 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-sm text-white/40">Sin clases programadas para hoy.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {classes.map((cls) => {
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
                  className="flex items-center gap-4 rounded-xl border border-white/10 p-5 hover:border-white/20 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ backgroundColor: disciplineColor ?? '#A855F7' }}
                  >
                    {disciplineName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{disciplineName}</p>
                    <p className="text-sm text-white/40 mt-0.5">
                      {cls.start_time.slice(0, 5)}–{cls.end_time.slice(0, 5)}
                      {cls.room ? ` · ${cls.room}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-white">{present}/{enrolled}</p>
                    <p className="text-xs text-white/40">presentes</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
