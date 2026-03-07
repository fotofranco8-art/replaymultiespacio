import { getHolidays } from '@/features/scheduling/services/scheduling.actions'
import { HolidaysPageClient } from './HolidaysPageClient'

export default async function HolidaysPage() {
  const holidays = await getHolidays()
  return <HolidaysPageClient holidays={holidays} />
}
