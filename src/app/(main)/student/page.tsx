import { logout, getProfile } from '@/features/auth/services/auth.actions'
import { createClient } from '@/lib/supabase/server'
import QRCode from 'react-qr-code'

async function getStudentData(studentId: string, centerId: string) {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const [
    { data: membership },
    { data: upcomingClasses },
    { data: recoveryBalance },
    { data: recentPayments },
  ] = await Promise.all([
    supabase
      .from('memberships')
      .select('plan_name, monthly_fee, classes_per_month, status, disciplines(name)')
      .eq('student_id', studentId)
      .eq('status', 'active')
      .maybeSingle(),
    supabase
      .from('class_enrollments')
      .select(`
        classes (
          id, scheduled_date, start_time, end_time,
          disciplines (name, color)
        )
      `)
      .eq('student_id', studentId)
      .gte('classes.scheduled_date', today)
      .order('classes.scheduled_date')
      .limit(5),
    supabase
      .from('recovery_balance')
      .select('balance')
      .eq('student_id', studentId)
      .eq('center_id', centerId)
      .maybeSingle(),
    supabase
      .from('payments')
      .select('final_amount, method, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return { membership, upcomingClasses, recoveryBalance, recentPayments }
}

export default async function StudentPage() {
  const profile = await getProfile()
  if (!profile) return null

  const { membership, recoveryBalance, recentPayments } = await getStudentData(
    profile.id,
    profile.center_id ?? ''
  )

  const qrValue = `student:${profile.id}`

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mi Portal</h1>
            <p className="text-sm text-gray-500">{profile.full_name}</p>
          </div>
          <form action={logout}>
            <button type="submit" className="text-sm text-gray-400 hover:text-gray-700">
              Salir
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {/* QR personal */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <h2 className="font-semibold text-gray-900 mb-4">Mi QR</h2>
            <div className="inline-block bg-white p-4 rounded-xl border border-gray-100">
              <QRCode value={qrValue} size={160} />
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Mostrá este QR al administrador para check-in manual
            </p>
          </div>

          {/* Membership status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Mi membresía</h2>
            {membership ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Plan</span>
                  <span className="font-medium text-gray-900">{membership.plan_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Disciplina</span>
                  <span className="font-medium text-gray-900">
                    {(membership.disciplines as unknown as { name: string } | null)?.name ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cuota</span>
                  <span className="font-medium text-gray-900">
                    ${Number(membership.monthly_fee).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Recuperaciones disponibles</span>
                  <span className="font-bold text-indigo-600">{recoveryBalance?.balance ?? 0}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Sin membresía activa.</p>
            )}
          </div>

          {/* Recent payments */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Ultimos pagos</h2>
            {recentPayments && recentPayments.length > 0 ? (
              <ul className="space-y-2">
                {recentPayments.map((p, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {new Date(p.created_at).toLocaleDateString('es-AR')} ·{' '}
                      {p.method === 'cash' ? 'Efectivo' : 'Transferencia'}
                    </span>
                    <span className="font-medium text-gray-900">
                      ${Number(p.final_amount).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Sin pagos registrados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
