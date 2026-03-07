import { getProfile } from '@/features/auth/services/auth.actions'
import { getMyBalance } from '@/features/students/services/student-portal.actions'
import Link from 'next/link'

export default async function StudentBalancePage() {
  const profile = await getProfile()
  if (!profile) return null

  const balance = await getMyBalance(profile.id, profile.center_id ?? '')

  return (
    <div className="min-h-screen p-6" style={{ background: '#080616' }}>
      <div className="max-w-sm mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/student" className="text-white/50 hover:text-white transition-colors text-lg">
            ←
          </Link>
          <h1 className="text-lg font-bold text-white">Mi balance</h1>
        </div>

        <div className="rounded-2xl border border-white/10 p-8 text-center"
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          <p className="text-sm text-white/50 mb-4">Clases de recuperación disponibles</p>
          <p className="text-8xl font-bold text-purple-400">{balance?.balance ?? 0}</p>
          <p className="text-xs text-white/30 mt-6 max-w-xs mx-auto">
            Se acumulan automáticamente cuando se cancela una clase por feriado u otra razón.
            Contactá al centro para coordinar tu recuperación.
          </p>
        </div>
      </div>
    </div>
  )
}
