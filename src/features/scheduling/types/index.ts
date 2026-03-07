export interface Discipline {
  id: string
  center_id: string
  name: string
  description: string | null
  color: string
  is_active: boolean
  created_at: string
}

export interface ClassTemplate {
  id: string
  center_id: string
  discipline_id: string
  teacher_id: string
  day_of_week: number // 0=Sunday, 6=Saturday
  start_time: string
  end_time: string
  room: string | null
  max_capacity: number
  is_active: boolean
  disciplines?: { name: string; color: string }
  profiles?: { full_name: string }
}

export interface Holiday {
  id: string
  center_id: string
  date: string
  name: string
  created_at: string
}

export interface CalendarClass {
  id: string
  scheduled_date: string
  start_time: string
  end_time: string
  room: string | null
  is_cancelled: boolean
  max_capacity: number
  disciplines: { name: string; color: string } | null
  profiles: { full_name: string } | null
}

export interface NewTemplateInput {
  discipline_id: string
  teacher_id: string
  day_of_week: number
  start_time: string
  end_time: string
  room?: string
  max_capacity?: number
}

export const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
