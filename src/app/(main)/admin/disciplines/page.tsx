import { getDisciplines, getClassTemplates } from '@/features/scheduling/services/scheduling.actions'
import { DisciplinesPageClient } from './DisciplinesPageClient'

export default async function DisciplinesPage() {
  const [disciplines, templates] = await Promise.all([getDisciplines(), getClassTemplates()])

  const templateCounts: Record<string, number> = {}
  for (const t of templates) {
    templateCounts[t.discipline_id] = (templateCounts[t.discipline_id] ?? 0) + 1
  }

  return <DisciplinesPageClient disciplines={disciplines} templateCounts={templateCounts} />
}
