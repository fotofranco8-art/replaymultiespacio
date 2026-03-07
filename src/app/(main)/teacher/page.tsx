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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Portal Profesor</h1>
            <p className="text-sm text-gray-500 mt-1">Hola, {profile.full_name}</p>
          </div>
          <form action={logout}>
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-700 underline">
              Cerrar sesion
            </button>
          </form>
        </div>

        <h2 className="font-semibold text-gray-900 mb-3">Mis clases de hoy</h2>

        {classes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Sin clases programadas para hoy.</p>
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
                  className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: disciplineColor ?? '#6366f1' }}
                    >
                      {disciplineName?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{disciplineName}</p>
                      <p className="text-sm text-gray-500">
                        {cls.start_time.slice(0, 5)}–{cls.end_time.slice(0, 5)}
                        {cls.room ? ` · ${cls.room}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{present}/{enrolled}</p>
                      <p className="text-xs text-gray-500">presentes</p>
                    </div>
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
