import { getProfile } from '@/features/auth/services/auth.actions'
import { getTeacherDisciplines } from '@/features/teachers/services/teacher-portal.actions'
import { TeacherProfileClient } from './TeacherProfileClient'

export default async function TeacherProfilePage() {
  const profile = await getProfile()
  if (!profile) return null

  const disciplines = await getTeacherDisciplines(profile.id)

  return (
    <TeacherProfileClient
      fullName={profile.full_name}
      phone={profile.phone}
      disciplines={disciplines}
    />
  )
}
