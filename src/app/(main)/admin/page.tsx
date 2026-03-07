import { getProfile } from '@/features/auth/services/auth.actions'
import { createClient } from '@/lib/supabase/server'
import { getMonthlyRevenue, getTeacherAlerts } from '@/features/scheduling/services/scheduling.actions'
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
        attendance (id)
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
  const [profile, stats, monthlyRevenue, teacherAlerts] = await Promise.all([
    getProfile(),
    getAdminStats(),
    getMonthlyRevenue(),
    getTeacherAlerts(),
  ])

  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-white/50 mt-0.5 capitalize">{today}</p>
        </div>
        <Link
          href="/admin/students"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: 'linear-gradient(135deg, #A855F7, #6366F1)' }}
        >
          + Nuevo alumno
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-white/10 p-5" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/50">Alumnos activos</p>
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <span className="text-purple-400 text-xs">👥</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.totalStudents ?? '—'}</p>
          <p className="text-xs text-white/40 mt-1">registrados</p>
        </div>

        <div className="rounded-xl border border-white/10 p-5" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/50">Clases hoy</p>
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 text-xs">📅</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.classesToday ?? '—'}</p>
          <p className="text-xs text-white/40 mt-1">programadas</p>
        </div>

        <div className="rounded-xl border border-white/10 p-5" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/50">Recaudación del mes</p>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <span className="text-amber-400 text-xs">↗</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-400">
            ${monthlyRevenue.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-white/40 mt-1">este mes</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Clases de hoy */}
        <div className="col-span-3 rounded-xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Clases de hoy</h2>
            <Link href="/admin/calendar" className="text-xs text-purple-400 hover:text-purple-300">
              Ver todas →
            </Link>
          </div>
          {!stats?.classesWithAttendance.length ? (
            <p className="text-sm text-white/40 py-4">Sin clases programadas.</p>
          ) : (
            <div className="space-y-2">
              {stats.classesWithAttendance.map((cls) => {
                const disciplineName = Array.isArray(cls.disciplines)
                  ? cls.disciplines[0]?.name
                  : (cls.disciplines as { name: string; color: string } | null)?.name
                const disciplineColor = Array.isArray(cls.disciplines)
                  ? cls.disciplines[0]?.color
                  : (cls.disciplines as { name: string; color: string } | null)?.color
                const attendanceCount = Array.isArray(cls.attendance) ? cls.attendance.length : 0

                return (
                  <div
                    key={cls.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-white/5"
                    style={{ background: `${disciplineColor ?? '#A855F7'}12` }}
                  >
                    <div
                      className="w-1 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: disciplineColor ?? '#A855F7' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{disciplineName}</p>
                      <p className="text-xs text-white/50">
                        {cls.start_time.slice(0, 5)}–{cls.end_time.slice(0, 5)}
                        {cls.room ? ` · ${cls.room}` : ''}
                      </p>
                    </div>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${disciplineColor ?? '#A855F7'}30`,
                        color: disciplineColor ?? '#A855F7',
                      }}
                    >
                      {attendanceCount} pres.
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Caja de hoy */}
        <div className="col-span-2 rounded-xl border border-white/10 p-6 flex flex-col" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Caja de hoy</h2>
            <Link href="/admin/payments" className="text-xs text-purple-400 hover:text-purple-300 text-xl leading-none">⊞</Link>
          </div>
          <p className="text-xs text-white/50 mb-1">Total día</p>
          <p className="text-3xl font-bold text-white mb-4">
            ${stats ? stats.cajaHoy.toLocaleString('es-AR', { minimumFractionDigits: 0 }) : '—'}
          </p>
          <div className="space-y-2 mb-4 flex-1">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Efectivo</span>
              <span className="text-white font-medium">—</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Transferencia</span>
              <span className="text-white font-medium">—</span>
            </div>
          </div>
          <Link
            href="/admin/payments"
            className="w-full py-2 rounded-lg text-sm font-medium text-white text-center transition-opacity hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #A855F7, #6366F1)' }}
          >
            Registrar pago
          </Link>
        </div>
      </div>

      {/* Teacher alerts */}
      {teacherAlerts.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-500/20 p-5" style={{ background: 'rgba(245,158,11,0.08)' }}>
          <h2 className="font-semibold text-amber-400 mb-3">
            Clases sin asistentes ({teacherAlerts.length})
          </h2>
          <div className="space-y-1.5">
            {teacherAlerts.map((cls) => {
              const disciplineName = Array.isArray(cls.disciplines)
                ? (cls.disciplines as { name: string }[])[0]?.name
                : (cls.disciplines as { name: string } | null)?.name
              const teacherName = Array.isArray(cls.profiles)
                ? (cls.profiles as { full_name: string }[])[0]?.full_name
                : (cls.profiles as { full_name: string } | null)?.full_name
              return (
                <div key={cls.id} className="text-sm text-amber-300/80">
                  {cls.start_time.slice(0, 5)} · {disciplineName} · {teacherName ?? '—'}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
