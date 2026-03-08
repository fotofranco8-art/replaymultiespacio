import { getInstructors } from '@/features/instructors/services/instructors.actions'
import { InstructorsPageClient } from './InstructorsPageClient'

export default async function InstructorsPage() {
  const instructors = await getInstructors().catch(() => [])
  return <InstructorsPageClient instructors={instructors} />
}
