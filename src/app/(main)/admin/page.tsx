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
    { data: classesWithAttendance },
    { data: paymentsToday },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('center_id', profile.center_id)
      .eq('role', 'student')
      .eq('is_active', true),
    supabase
      .from('classes')
      .select(`
        id, start_time, end_time, room,
        disciplines (name, color),
        profiles (full_name),
        attendance (id)
      `)
      .eq('center_id', profile.center_id)
      .eq('scheduled_date', today)
      .eq('is_cancelled', false)
      .order('start_time'),
    supabase
      .from('payments')
      .select('final_amount, method')
      .eq('center_id', profile.center_id)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`),
  ])

  const payments = paymentsToday ?? []
  const cajaHoy = payments.reduce((sum, p) => sum + Number(p.final_amount), 0)
  const cajaEfectivo = payments.filter((p) => p.method === 'cash').reduce((sum, p) => sum + Number(p.final_amount), 0)
  const cajaTransferencia = payments.filter((p) => p.method === 'transfer').reduce((sum, p) => sum + Number(p.final_amount), 0)

  const allClasses = classesWithAttendance ?? []
  const pendingClasses = allClasses.filter((cls) => {
    const count = Array.isArray(cls.attendance) ? cls.attendance.length : 0
    return count === 0
  })

  return {
    totalStudents: totalStudents ?? 0,
    cajaHoy,
    cajaEfectivo,
    cajaTransferencia,
    classesWithAttendance: allClasses,
    pendingClasses: pendingClasses.length,
  }
}

export default async function AdminPage() {
  const [, stats, monthlyRevenue, teacherAlerts] = await Promise.all([
    getProfile(),
    getAdminStats(),
    getMonthlyRevenue(),
    getTeacherAlerts(),
  ])

  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
          <p className="text-sm text-white/50 mt-0.5 capitalize">{today}</p>
        </div>
        <Link
          href="/admin/students"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
          style={{ background: 'linear-gradient(135deg, #A855F7, #6366F1)' }}
        >
          + Nuevo alumno
        </Link>
      </div>

      {/* Main layout: 70/30 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Cronograma Diario (70%) */}
        <div className="lg:col-span-3 rounded-xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Cronograma Diario</h2>
            <Link
              href="/admin/calendar?view=daily"
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Ver agenda →
            </Link>
          </div>

          {!stats?.classesWithAttendance.length ? (
            <div className="px-6 py-12 text-center">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-sm text-white/40">Sin clases programadas para hoy.</p>
              <Link
                href="/admin/class-templates"
                className="inline-block mt-3 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Ir a plantillas →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/40">Horario</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white/40">Clase</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white/40">Aula</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white/40">Profesor</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-white/40">Asistentes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.classesWithAttendance.map((cls) => {
                    const discipline = Array.isArray(cls.disciplines)
                      ? cls.disciplines[0] as { name: string; color: string }
                      : cls.disciplines as { name: string; color: string } | null
                    const teacher = Array.isArray(cls.profiles)
                      ? (cls.profiles as { full_name: string }[])[0]
                      : cls.profiles as { full_name: string } | null
                    const attendanceCount = Array.isArray(cls.attendance) ? cls.attendance.length : 0

                    return (
                      <tr key={cls.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-3.5 text-white/60 text-xs font-medium whitespace-nowrap">
                          {cls.start_time.slice(0, 5)}–{cls.end_time.slice(0, 5)}
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-2">
                            {discipline?.color && (
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: discipline.color }} />
                            )}
                            <span className="text-sm font-medium text-white truncate max-w-[140px]">
                              {discipline?.name ?? '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-xs text-white/50">{cls.room ?? '—'}</td>
                        <td className="px-3 py-3.5 text-xs text-white/50 truncate max-w-[120px]">
                          {teacher?.full_name ?? '—'}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              attendanceCount > 0
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-white/10 text-white/40'
                            }`}
                          >
                            {attendanceCount}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT: Stats (30%) */}
        <div className="lg:col-span-2 space-y-3">
          {/* Total Alumnos */}
          <div className="rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50 mb-1">Total Alumnos</p>
                <p className="text-3xl font-bold text-white">{stats?.totalStudents ?? '—'}</p>
                <p className="text-xs text-white/30 mt-0.5">activos</p>
              </div>
              <span className="text-2xl opacity-60">👥</span>
            </div>
          </div>

          {/* Ingresos del Mes */}
          <div className="rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50 mb-1">Ingresos del Mes</p>
                <p className="text-3xl font-bold text-amber-400">
                  ${monthlyRevenue.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <span className="text-2xl opacity-60">💰</span>
            </div>
          </div>

          {/* Caja de hoy */}
          <div className="rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-xs text-white/50 mb-2">Caja de hoy</p>
            <p className="text-2xl font-bold text-white mb-2">
              ${stats ? stats.cajaHoy.toLocaleString('es-AR', { minimumFractionDigits: 0 }) : '—'}
            </p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Efectivo</span>
                <span className="text-green-400">${stats ? stats.cajaEfectivo.toLocaleString('es-AR') : '—'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Transferencia</span>
                <span className="text-blue-400">${stats ? stats.cajaTransferencia.toLocaleString('es-AR') : '—'}</span>
              </div>
            </div>
            <Link
              href="/admin/payments"
              className="mt-3 block w-full py-2 rounded-xl text-xs font-medium text-white text-center transition-opacity hover:opacity-80"
              style={{ background: 'linear-gradient(135deg, #A855F7, #6366F1)' }}
            >
              Registrar pago
            </Link>
          </div>

          {/* Pendientes */}
          {(stats?.pendingClasses ?? 0) > 0 && (
            <div className="rounded-xl border border-amber-500/20 p-4" style={{ background: 'rgba(245,158,11,0.06)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-400/70 mb-1">Clases sin check-in</p>
                  <p className="text-2xl font-bold text-amber-400">{stats?.pendingClasses}</p>
                </div>
                <span className="text-2xl opacity-60">⚠️</span>
              </div>
            </div>
          )}

          {/* Alertas de clases sin asistentes */}
          {teacherAlerts.length > 0 && (
            <div className="rounded-xl border border-amber-500/20 p-4" style={{ background: 'rgba(245,158,11,0.06)' }}>
              <p className="text-xs text-amber-400 font-medium mb-2">
                {teacherAlerts.length} clase{teacherAlerts.length !== 1 ? 's' : ''} sin asistentes
              </p>
              <div className="space-y-1">
                {teacherAlerts.slice(0, 3).map((cls) => {
                  const dName = Array.isArray(cls.disciplines)
                    ? (cls.disciplines as { name: string }[])[0]?.name
                    : (cls.disciplines as { name: string } | null)?.name
                  return (
                    <p key={cls.id} className="text-xs text-amber-300/70">
                      {cls.start_time.slice(0, 5)} · {dName ?? '—'}
                    </p>
                  )
                })}
                {teacherAlerts.length > 3 && (
                  <p className="text-xs text-amber-300/40">+{teacherAlerts.length - 3} más</p>
                )}
              </div>
            </div>
          )}

          {/* Estado del sistema */}
          <div className="rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-xs text-green-400 font-medium">Sistema en línea</p>
            </div>
            <p className="text-xs text-white/30 mt-1">Todos los servicios operativos</p>
          </div>
        </div>
      </div>
    </div>
  )
}
