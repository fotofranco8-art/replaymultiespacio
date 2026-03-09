import { getProfile, logout } from '@/features/auth/services/auth.actions'
import { createClient } from '@/lib/supabase/server'
import ProfileClient from '@/features/students/components/ProfileClient'

async function getProfileData(studentId: string, centerId: string) {
  const supabase = await createClient()

  const [{ data: membership }, { data: recoveryBalance }] = await Promise.all([
    supabase
      .from('memberships')
      .select('plan_name, monthly_fee, classes_per_month, status, is_blocked')
      .eq('student_id', studentId)
      .eq('status', 'active')
      .maybeSingle(),
    supabase
      .from('recovery_balance')
      .select('balance')
      .eq('student_id', studentId)
      .eq('center_id', centerId)
      .maybeSingle(),
  ])

  return { membership, recoveryBalance }
}

export default async function StudentProfilePage() {
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

  const { membership, recoveryBalance } = await getProfileData(profile.id, profile.center_id ?? '')

  return (
    <ProfileClient
      profile={profile}
      membership={membership}
      recoveryBalance={recoveryBalance?.balance ?? 0}
    />
  )
}
