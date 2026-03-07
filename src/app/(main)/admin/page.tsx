import { getProfile } from '@/features/auth/services/auth.actions'
import { createClient } from '@/lib/supabase/server'
import { AdminNav } from '@/shared/components/AdminNav'
import Link from 'next/link'

async function getAdminStats() {
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('center_id').single()
  if (!profile?.center_id) return null

  const today = new Date().toISOString().split('T')[0]

  const [
    { count: totalStudents },
    { count: classesToday },
    { data: paymentsToday },
    { data: classesWithAttendance },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('center_id', profile.center_id)
      .eq('role', 'student')
      .eq('is_active', true),
    supabase
      .from('classes')
      .select('*', { count: 'exact', head: true })
      .eq('center_id', profile.center_id)
      .eq('scheduled_date', today)
      .eq('is_cancelled', false),
    supabase
      .from('payments')
      .select('final_amount')
      .eq('center_id', profile.center_id)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`),
    supabase
      .from('classes')
      .select(`
        id, start_time, end_time, room,
        disciplines (name, color),
        attendance (count)
      `)
      .eq('center_id', profile.center_id)
      .eq('scheduled_date', today)
      .eq('is_cancelled', false)
      .order('start_time'),
  ])

  const cajaHoy = (paymentsToday ?? []).reduce((sum, p) => sum + Number(p.final_amount), 0)

  return {
    totalStudents: totalStudents ?? 0,
    classesToday: classesToday ?? 0,
    cajaHoy,
    classesWithAttendance: classesWithAttendance ?? [],
  }
}

export default async function AdminPage() {
  const [profile, stats] = await Promise.all([getProfile(), getAdminStats()])

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Bienvenido, {profile?.full_name}</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Alumnos activos</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalStudents ?? '—'}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Clases hoy</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.classesToday ?? '—'}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Caja del dia</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats ? `$${stats.cajaHoy.toLocaleString('es-AR', { minimumFractionDigits: 0 })}` : '—'}
            </p>
          </div>
        </div>

        {/* Today's classes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Clases de hoy</h2>
            {stats?.classesWithAttendance.length === 0 ? (
              <p className="text-sm text-gray-500">Sin clases programadas.</p>
            ) : (
              <div className="space-y-3">
                {stats?.classesWithAttendance.map((cls) => {
                  const disciplineName = Array.isArray(cls.disciplines)
                    ? cls.disciplines[0]?.name
                    : (cls.disciplines as { name: string; color: string } | null)?.name
                  const disciplineColor = Array.isArray(cls.disciplines)
                    ? cls.disciplines[0]?.color
                    : (cls.disciplines as { name: string; color: string } | null)?.color

                  const attendanceCount = Array.isArray(cls.attendance)
                    ? cls.attendance.length
                    : 0

                  return (
                    <div
                      key={cls.id}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: `${disciplineColor ?? '#6366f1'}15` }}
                    >
                      <div
                        className="w-1 h-10 rounded-full"
                        style={{ backgroundColor: disciplineColor ?? '#6366f1' }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{disciplineName}</p>
                        <p className="text-xs text-gray-500">
                          {cls.start_time.slice(0, 5)}–{cls.end_time.slice(0, 5)}
                          {cls.room ? ` · ${cls.room}` : ''}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {attendanceCount} presentes
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Accesos rapidos</h2>
            <div className="space-y-2">
              <Link
                href="/admin/students"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 text-sm text-gray-700"
              >
                <span className="text-lg">👥</span>
                <span>Ver alumnos</span>
              </Link>
              <Link
                href="/admin/payments"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 text-sm text-gray-700"
              >
                <span className="text-lg">💰</span>
                <span>Registrar pago</span>
              </Link>
              <Link
                href="/admin/scheduling"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 text-sm text-gray-700"
              >
                <span className="text-lg">📅</span>
                <span>Ver agenda</span>
              </Link>
              <Link
                href="/reception"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 text-sm text-gray-700"
              >
                <span className="text-lg">📱</span>
                <span>Kiosco QR</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
