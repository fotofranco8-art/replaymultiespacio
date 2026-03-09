import { getProfile } from '@/features/auth/services/auth.actions'
import { getTeacherWeekClasses } from '@/features/teachers/services/teacher-portal.actions'
import { TeacherAgendaClient } from './TeacherAgendaClient'

function getMondayOfWeek(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

export default async function TeacherAgendaPage() {
  const profile = await getProfile()
  if (!profile) return null

  const weekStart = getMondayOfWeek(new Date())
  const classes = await getTeacherWeekClasses(profile.id, weekStart)

  return (
    <TeacherAgendaClient
      teacherId={profile.id}
      initialWeekStart={weekStart}
      initialClasses={classes}
    />
  )
}
