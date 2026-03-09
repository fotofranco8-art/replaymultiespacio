export interface Room {
  id: string
  center_id: string
  name: string
  capacity: number
  description: string | null
  equipment: string[]
  type: 'grupal' | 'individual'
  is_active: boolean
  created_at: string
}

export interface NewRoomInput {
  name: string
  capacity: number
  description?: string
  equipment?: string[]
  type?: 'grupal' | 'individual'
}

export interface RoomStats {
  total_rooms: number
  total_capacity: number
  occupancy_today: number // percentage 0-100
}
