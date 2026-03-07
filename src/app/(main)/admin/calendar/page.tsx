import { getCalendarClasses } from '@/features/scheduling/services/scheduling.actions'
import { CalendarPageClient } from './CalendarPageClient'

interface SearchParams {
  year?: string
  month?: string
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

  const classes = await getCalendarClasses(year, month)

  return <CalendarPageClient classes={classes} year={year} month={month} />
}
