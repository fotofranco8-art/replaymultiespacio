import { redirect } from 'next/navigation'
import { getProfile } from '@/features/auth/services/auth.actions'
import { ROLE_REDIRECTS } from '@/features/auth/types'

export default async function DashboardPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  const role = profile.role ?? 'student'
  redirect(ROLE_REDIRECTS[role as keyof typeof ROLE_REDIRECTS])
}
