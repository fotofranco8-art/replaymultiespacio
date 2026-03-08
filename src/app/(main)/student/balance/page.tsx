import { getProfile } from '@/features/auth/services/auth.actions'
import { getMyBalance } from '@/features/students/services/student-portal.actions'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

async function getActiveMembership(studentId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('memberships')
    .select('plan_name, classes_per_month, monthly_fee, status, discipline_id, disciplines(name)')
    .eq('student_id', studentId)
    .eq('status', 'active')
    .maybeSingle()
  return data
}

export default async function StudentBalancePage() {
  const profile = await getProfile()
  if (!profile) return null

  const [balance, membership] = await Promise.all([
    profile.center_id ? getMyBalance(profile.id, profile.center_id) : null,
    getActiveMembership(profile.id),
  ])

  const recoveryCredits = balance?.balance ?? 0
  const classesPerMonth = membership?.classes_per_month ?? 0

  return (
    <div className="min-h-screen p-5" style={{ background: '#0A0A0A' }}>
      <div className="max-w-sm mx-auto space-y-5">

        {/* Header */}
        <div className="pt-2 flex items-center gap-3">
          <Link
            href="/student"
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div>
            <p className="font-display font-bold text-[20px] text-white leading-tight">Mi Balance</p>
            <p className="font-body text-[12px]" style={{ color: '#71717A' }}>Créditos y membresía</p>
          </div>
        </div>

        {/* Membership card */}
        {membership ? (
          <div
            className="rounded-2xl p-5"
            style={{ background: '#18181B', border: '1px solid #27272A' }}
          >
            <p className="font-body font-bold text-[10px] uppercase tracking-wider mb-3" style={{ color: '#52525B' }}>
              Membresía activa
            </p>
            <p className="font-display font-bold text-white text-xl mb-1">{membership.plan_name}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="text-center">
                <p className="font-display font-bold text-2xl text-white">{classesPerMonth}</p>
                <p className="text-white/40 text-xs mt-0.5">clases/mes</p>
              </div>
              <div className="w-px h-10" style={{ background: '#27272A' }} />
              <div className="text-center">
                <p className="font-display font-bold text-2xl text-white">
                  ${Number(membership.monthly_fee).toLocaleString('es-AR')}
                </p>
                <p className="text-white/40 text-xs mt-0.5">cuota mensual</p>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-white/40 text-sm">Sin membresía activa</p>
          </div>
        )}

        {/* Recovery balance card */}
        <div
          className="rounded-2xl p-5"
          style={{ background: recoveryCredits > 0 ? '#A855F718' : '#18181B', border: recoveryCredits > 0 ? '1px solid #A855F733' : '1px solid #27272A' }}
        >
          <p className="font-body font-bold text-[10px] uppercase tracking-wider mb-3" style={{ color: '#52525B' }}>
            Créditos de recupero
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: recoveryCredits > 0 ? '#A855F7' : 'rgba(255,255,255,0.06)' }}
            >
              <span className="font-display font-bold text-white text-2xl">{recoveryCredits}</span>
            </div>
            <div>
              <p className="font-display font-semibold text-white text-base">
                {recoveryCredits === 0 ? 'Sin créditos' : recoveryCredits === 1 ? '1 clase disponible' : `${recoveryCredits} clases disponibles`}
              </p>
              <p className="text-white/40 text-xs mt-0.5 leading-snug">
                {recoveryCredits > 0
                  ? 'Clases acreditadas por feriados o cancelaciones'
                  : 'Los créditos se acreditan cuando se cancela una clase'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
