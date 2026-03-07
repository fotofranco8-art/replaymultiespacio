import { logout, getProfile } from '@/features/auth/services/auth.actions'
import { createClient } from '@/lib/supabase/server'
import QRCode from 'react-qr-code'
import Link from 'next/link'

async function getStudentData(studentId: string, centerId: string) {
  const supabase = await createClient()

  const [{ data: membership }, { data: recoveryBalance }, { data: recentPayments }] =
    await Promise.all([
      supabase
        .from('memberships')
        .select('plan_name, monthly_fee, classes_per_month, status, is_blocked, disciplines(name)')
        .eq('student_id', studentId)
        .eq('status', 'active')
        .maybeSingle(),
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

  return { membership, recoveryBalance, recentPayments }
}

export default async function StudentPage() {
  const profile = await getProfile()
  if (!profile) return null

  const { membership, recoveryBalance, recentPayments } = await getStudentData(
    profile.id,
    profile.center_id ?? ''
  )

  const isBlocked = membership?.is_blocked === true
  const qrValue = `student:${profile.id}`

  return (
    <div className="min-h-screen p-6" style={{ background: '#080616' }}>
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-white">Mi Portal</h1>
            <p className="text-sm text-white/50">{profile.full_name}</p>
          </div>
          <form action={logout}>
            <button type="submit" className="text-sm text-white/40 hover:text-white transition-colors">
              Salir
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {/* QR personal */}
          <div className="rounded-2xl border border-white/10 p-6 text-center"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <h2 className="font-semibold text-white mb-4">Mi QR Personal</h2>
            <div className={`inline-block p-4 rounded-xl bg-white ${isBlocked ? 'opacity-30' : ''}`}>
              <QRCode value={qrValue} size={140} />
            </div>
            {isBlocked ? (
              <p className="text-sm text-red-400 font-medium mt-3">
                QR bloqueado — regularizá tu pago
              </p>
            ) : (
              <p className="text-xs text-white/40 mt-3">
                Mostrá este QR al profesor para check-in
              </p>
            )}
          </div>

          {/* Membresía */}
          <div className="rounded-2xl border border-white/10 p-5"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <h2 className="font-semibold text-white mb-3">Mi membresía</h2>
            {membership ? (
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Plan</span>
                  <span className="text-white font-medium">
                    {membership.classes_per_month} clases/mes
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Cuota</span>
                  <span className="text-white font-medium">
                    ${Number(membership.monthly_fee).toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Recuperaciones</span>
                  <span className="font-bold text-purple-400 text-base">
                    {recoveryBalance?.balance ?? 0}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/40">Sin membresía activa.</p>
            )}
          </div>

          {/* Últimos pagos */}
          <div className="rounded-2xl border border-white/10 p-5"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <h2 className="font-semibold text-white mb-3">Últimos pagos</h2>
            {recentPayments && recentPayments.length > 0 ? (
              <ul className="space-y-2.5">
                {recentPayments.map((p, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-white/50">
                      {new Date(p.created_at).toLocaleDateString('es-AR')}
                      {' · '}
                      {p.method === 'cash' ? 'Efectivo' : 'Transferencia'}
                    </span>
                    <span className="font-medium text-white">
                      ${Number(p.final_amount).toLocaleString('es-AR')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/40">Sin pagos registrados.</p>
            )}
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/student/clases"
              className="rounded-xl border border-white/10 p-4 text-center hover:bg-white/10 transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <p className="text-sm font-medium text-white">Mis clases</p>
              <p className="text-xs text-white/40 mt-0.5">Próximas inscriptas</p>
            </Link>
            <Link
              href="/student/balance"
              className="rounded-xl border border-white/10 p-4 text-center hover:bg-white/10 transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <p className="text-sm font-medium text-white">Mi balance</p>
              <p className="text-xs text-purple-400 font-semibold mt-0.5">
                {recoveryBalance?.balance ?? 0} recuperaciones
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
