import { getStudents } from '@/features/students/services/students.actions'
import { getDisciplines } from '@/features/scheduling/services/scheduling.actions'
import { StudentsPageClient } from './StudentsPageClient'

export default async function StudentsPage() {
  const [students, disciplines] = await Promise.all([getStudents(), getDisciplines()])

  return <StudentsPageClient students={students} disciplines={disciplines} />
}
