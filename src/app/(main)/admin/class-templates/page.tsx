import {
  getDisciplines,
  getClassTemplates,
  getTeachers,
} from '@/features/scheduling/services/scheduling.actions'
import { getRooms } from '@/features/rooms/services/rooms.actions'
import { getActiveStudents } from '@/features/payments/services/payments.actions'
import { ClassTemplatesPageClient } from './ClassTemplatesPageClient'

export default async function ClassTemplatesPage() {
  const [disciplines, templates, teachers, rooms, students] = await Promise.all([
    getDisciplines(),
    getClassTemplates(),
    getTeachers(),
    getRooms(),
    getActiveStudents(),
  ])

  return (
    <ClassTemplatesPageClient
      disciplines={disciplines}
      templates={templates}
      teachers={teachers}
      rooms={rooms.filter((r) => r.is_active)}
      students={students}
    />
  )
}
