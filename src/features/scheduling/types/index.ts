export interface Discipline {
  id: string
  center_id: string
  name: string
  description: string | null
  color: string
  type: 'grupal' | 'individual'
  monthly_price: number
  max_capacity: number
  modality: 'anual' | 'seminario'
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
  student_ids?: string[]
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
  student_ids?: string[]
}

export const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
export const DAY_NAMES_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
