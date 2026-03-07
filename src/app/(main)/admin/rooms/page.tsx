import { getRooms } from '@/features/rooms/services/rooms.actions'
import { RoomsPageClient } from './RoomsPageClient'

export default async function RoomsPage() {
  const rooms = await getRooms()
  return <RoomsPageClient rooms={rooms} />
}
