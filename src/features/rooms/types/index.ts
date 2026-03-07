export interface Room {
  id: string
  center_id: string
  name: string
  capacity: number
  description: string | null
  is_active: boolean
  created_at: string
}

export interface NewRoomInput {
  name: string
  capacity: number
  description?: string
}
