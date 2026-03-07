import {
  getDisciplines,
  getClassTemplates,
  getTeachers,
} from '@/features/scheduling/services/scheduling.actions'
import { ClassTemplatesPageClient } from './ClassTemplatesPageClient'

export default async function ClassTemplatesPage() {
  const [disciplines, templates, teachers] = await Promise.all([
    getDisciplines(),
    getClassTemplates(),
    getTeachers(),
  ])

  return (
    <ClassTemplatesPageClient
      disciplines={disciplines}
      templates={templates}
      teachers={teachers}
    />
  )
}
