import { getProfile, logout } from '@/features/auth/services/auth.actions'
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

const glassCard = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.07)',
}

export default async function StudentBalancePage() {
  const profile = await getProfile()
  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#07050F' }}>
      <div className="text-center space-y-4">
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>No se pudo cargar tu perfil</p>
        <form action={logout}>
          <button type="submit" className="text-sm font-semibold cursor-pointer" style={{ color: '#FF2D78' }}>
            Volver a iniciar sesión
          </button>
        </form>
      </div>
    </div>
  )

  const [balance, membership] = await Promise.all([
    profile.center_id ? getMyBalance(profile.id, profile.center_id) : null,
    getActiveMembership(profile.id),
  ])

  const recoveryCredits = balance?.balance ?? 0
  const classesPerMonth = membership?.classes_per_month ?? 0

  return (
    <div className="min-h-screen" style={{ background: '#07050F' }}>
      <div className="max-w-sm mx-auto px-5 space-y-5 pt-2">

        {/* Header */}
        <div className="pt-1 flex items-center gap-3">
          <Link
            href="/student"
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-opacity hover:opacity-70"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div>
            <p
              className="font-semibold text-[20px] text-white leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
            >
              Mi Balance
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>Créditos y membresía</p>
          </div>
        </div>

        {/* Membership card */}
        {membership ? (
          <div className="rounded-2xl p-5" style={glassCard}>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(255,45,120,0.50)' }}
            >
              Membresía activa
            </p>
            <p
              className="font-semibold text-white text-xl mb-3 tracking-tight"
              style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
            >
              {membership.plan_name}
            </p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p
                  className="font-semibold text-2xl text-white tracking-tight"
                  style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
                >
                  {classesPerMonth}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>clases/mes</p>
              </div>
              <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="text-center">
                <p
                  className="font-semibold text-2xl text-white tracking-tight"
                  style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
                >
                  ${Number(membership.monthly_fee).toLocaleString('es-AR')}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>cuota mensual</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-5 text-center" style={glassCard}>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>Sin membresía activa</p>
          </div>
        )}

        {/* Recovery balance card */}
        <div
          className="rounded-2xl p-5"
          style={
            recoveryCredits > 0
              ? { background: 'rgba(255,45,120,0.07)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,45,120,0.18)' }
              : glassCard
          }
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: recoveryCredits > 0 ? 'rgba(255,45,120,0.50)' : 'rgba(255,255,255,0.25)' }}
          >
            Créditos de recupero
          </p>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={
                recoveryCredits > 0
                  ? { background: 'linear-gradient(135deg, #FF2D78, #C0155A)', boxShadow: '0 0 16px rgba(255,45,120,0.30)' }
                  : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }
              }
            >
              <span
                className="font-bold text-white text-2xl"
                style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
              >
                {recoveryCredits}
              </span>
            </div>
            <div>
              <p className="font-medium text-white text-base leading-snug">
                {recoveryCredits === 0 ? 'Sin créditos' : recoveryCredits === 1 ? '1 clase disponible' : `${recoveryCredits} clases disponibles`}
              </p>
              <p className="text-xs mt-1 leading-snug" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {recoveryCredits > 0
                  ? 'Clases acreditadas por feriados o cancelaciones'
                  : 'Se acreditan cuando se cancela una clase'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
