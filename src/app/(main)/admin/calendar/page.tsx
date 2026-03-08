import {
  getCalendarClasses,
  getClassesForDate,
  getTeachers,
  getDisciplines,
} from '@/features/scheduling/services/scheduling.actions'
import { getRooms } from '@/features/rooms/services/rooms.actions'
import { CalendarPageClient } from './CalendarPageClient'

interface SearchParams {
  year?: string
  month?: string
  view?: string
  date?: string
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const now = new Date()
  const year = params.year ? parseInt(params.year) : now.getFullYear()
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1
  const view = params.view === 'daily' ? 'daily' : 'monthly'
  const date = params.date ?? now.toISOString().split('T')[0]

  const classes = await getCalendarClasses(year, month)

  const [dailyClasses, rooms, teachers, disciplines] = await Promise.all([
    view === 'daily' ? getClassesForDate(date) : Promise.resolve([]),
    getRooms(),
    getTeachers(),
    getDisciplines(),
  ])

  return (
    <CalendarPageClient
      classes={classes}
      dailyClasses={dailyClasses}
      year={year}
      month={month}
      view={view}
      date={date}
      rooms={rooms.filter((r) => r.is_active)}
      teachers={teachers}
      disciplines={disciplines.filter((d) => d.is_active)}
    />
  )
}
