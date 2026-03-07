import { getDisciplines } from '@/features/scheduling/services/scheduling.actions'
import { DisciplinesPageClient } from './DisciplinesPageClient'

export default async function DisciplinesPage() {
  const disciplines = await getDisciplines()
  return <DisciplinesPageClient disciplines={disciplines} />
}
