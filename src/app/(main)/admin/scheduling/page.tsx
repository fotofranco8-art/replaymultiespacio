import {
  getDisciplines,
  getClassTemplates,
  getHolidays,
  getTeachers,
} from '@/features/scheduling/services/scheduling.actions'
import { SchedulingPageClient } from './SchedulingPageClient'

export default async function SchedulingPage() {
  const [disciplines, templates, holidays, teachers] = await Promise.all([
    getDisciplines(),
    getClassTemplates(),
    getHolidays(),
    getTeachers(),
  ])

  return (
    <SchedulingPageClient
      disciplines={disciplines}
      templates={templates}
      holidays={holidays}
      teachers={teachers}
    />
  )
}
