import { getRooms, getRoomStats } from '@/features/rooms/services/rooms.actions'
import { RoomsPageClient } from './RoomsPageClient'

export default async function RoomsPage() {
  const [rooms, stats] = await Promise.all([getRooms(), getRoomStats()])
  return <RoomsPageClient rooms={rooms} stats={stats} />
}
