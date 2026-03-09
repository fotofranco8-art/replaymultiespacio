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
      {/* Ambient glow */}
      <div
        className="fixed inset-x-0 top-0 h-64 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% -5%, rgba(168,85,247,0.10) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1
            className="text-3xl font-semibold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Panel de Control
          </h1>
          <p className="text-sm mt-1 capitalize" style={{ color: 'rgba(255,255,255,0.40)' }}>{today}</p>
        </div>
        <Link
          href="/admin/students"
          className="btn-primary px-4 py-2 rounded-xl text-sm"
        >
          + Nuevo alumno
        </Link>
      </div>

      {/* Main layout: 70/30 */}
      <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* LEFT: Cronograma Diario (70%) */}
        <div
          className="lg:col-span-3 rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h2
              className="font-semibold text-white text-sm tracking-tight"
              style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
            >
              Cronograma Diario
            </h2>
            <Link
              href="/admin/calendar?view=daily"
              className="text-xs transition-colors"
              style={{ color: 'rgba(168,85,247,0.80)' }}
            >
              Ver agenda →
            </Link>
          </div>

          {!stats?.classesWithAttendance.length ? (
            <div className="px-6 py-16 text-center">
              <p className="text-3xl mb-3">📅</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>Sin clases programadas para hoy.</p>
              <Link
                href="/admin/class-templates"
                className="inline-block mt-3 text-xs transition-colors"
                style={{ color: 'rgba(168,85,247,0.70)' }}
              >
                Ir a plantillas →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <th className="px-6 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.32)' }}>Horario</th>
                    <th className="px-3 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.32)' }}>Clase</th>
                    <th className="px-3 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.32)' }}>Aula</th>
                    <th className="px-3 py-3 text-left text-xs font-medium" style={{ color: 'rgba(255,255,255,0.32)' }}>Profesor</th>
                    <th className="px-6 py-3 text-right text-xs font-medium" style={{ color: 'rgba(255,255,255,0.32)' }}>Check-in</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.classesWithAttendance.map((cls) => {
                    const discipline = Array.isArray(cls.disciplines)
                      ? cls.disciplines[0] as { name: string; color: string }
                      : cls.disciplines as { name: string; color: string } | null
                    const teacher = Array.isArray(cls.profiles)
                      ? (cls.profiles as { full_name: string }[])[0]
                      : cls.profiles as { full_name: string } | null
                    const attendanceCount = Array.isArray(cls.attendance) ? cls.attendance.length : 0

                    return (
                      <tr
                        key={cls.id}
                        className="transition-colors"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <td className="px-6 py-3.5 text-xs font-medium whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.45)' }}>
                          {cls.start_time.slice(0, 5)}–{cls.end_time.slice(0, 5)}
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-2">
                            {discipline?.color && (
                              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: discipline.color }} />
                            )}
                            <span className="text-sm font-medium text-white truncate max-w-[140px]">
                              {discipline?.name ?? '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-xs truncate" style={{ color: 'rgba(255,255,255,0.40)' }}>{cls.room ?? '—'}</td>
                        <td className="px-3 py-3.5 text-xs truncate max-w-[120px]" style={{ color: 'rgba(255,255,255,0.40)' }}>
                          {teacher?.full_name ?? '—'}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              background: attendanceCount > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.07)',
                              color: attendanceCount > 0 ? '#4ade80' : 'rgba(255,255,255,0.30)',
                            }}
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
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.40)' }}>Total Alumnos</p>
                <p
                  className="text-4xl font-semibold text-white tracking-tight"
                  style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
                >
                  {stats?.totalStudents ?? '—'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>activos</p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                👥
              </div>
            </div>
          </div>

          {/* Ingresos del Mes */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.40)' }}>Ingresos del Mes</p>
                <p
                  className="text-4xl font-semibold tracking-tight"
                  style={{ color: '#FBBF24', fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
                >
                  ${monthlyRevenue.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(251,191,36,0.10)' }}
              >
                💰
              </div>
            </div>
          </div>

          {/* Caja de hoy */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.40)' }}>Caja de hoy</p>
            <p
              className="text-2xl font-semibold text-white mb-3 tracking-tight"
              style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
            >
              ${stats ? stats.cajaHoy.toLocaleString('es-AR', { minimumFractionDigits: 0 }) : '—'}
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>Efectivo</span>
                <span style={{ color: '#4ade80' }}>${stats ? stats.cajaEfectivo.toLocaleString('es-AR') : '—'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>Transferencia</span>
                <span style={{ color: '#60a5fa' }}>${stats ? stats.cajaTransferencia.toLocaleString('es-AR') : '—'}</span>
              </div>
            </div>
            <Link
              href="/admin/payments"
              className="btn-primary mt-4 block w-full py-2 rounded-xl text-xs text-center"
            >
              Registrar pago
            </Link>
          </div>

          {/* Pendientes */}
          {(stats?.pendingClasses ?? 0) > 0 && (
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(245,158,11,0.07)',
                border: '1px solid rgba(245,158,11,0.18)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'rgba(251,191,36,0.60)' }}>Clases sin check-in</p>
                  <p
                    className="text-2xl font-semibold tracking-tight"
                    style={{ color: '#FBBF24', fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
                  >
                    {stats?.pendingClasses}
                  </p>
                </div>
                <span className="text-2xl opacity-70">⚠️</span>
              </div>
            </div>
          )}

          {/* Alertas teacher */}
          {teacherAlerts.length > 0 && (
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(245,158,11,0.07)',
                border: '1px solid rgba(245,158,11,0.18)',
              }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: '#FBBF24' }}>
                {teacherAlerts.length} clase{teacherAlerts.length !== 1 ? 's' : ''} sin asistentes
              </p>
              <div className="space-y-1">
                {teacherAlerts.slice(0, 3).map((cls) => {
                  const dName = Array.isArray(cls.disciplines)
                    ? (cls.disciplines as { name: string }[])[0]?.name
                    : (cls.disciplines as { name: string } | null)?.name
                  return (
                    <p key={cls.id} className="text-xs" style={{ color: 'rgba(251,191,36,0.55)' }}>
                      {cls.start_time.slice(0, 5)} · {dName ?? '—'}
                    </p>
                  )
                })}
                {teacherAlerts.length > 3 && (
                  <p className="text-xs" style={{ color: 'rgba(251,191,36,0.30)' }}>+{teacherAlerts.length - 3} más</p>
                )}
              </div>
            </div>
          )}

          {/* Estado del sistema */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-xs font-medium text-green-400">Sistema en línea</p>
            </div>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.22)' }}>Todos los servicios operativos</p>
          </div>
        </div>
      </div>
    </div>
  )
}
