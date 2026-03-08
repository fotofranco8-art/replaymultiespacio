export interface Instructor {
  id: string
  full_name: string
  email: string
  phone: string | null
  specialties: string[]
  is_active: boolean
  created_at: string
}

export interface NewInstructorInput {
  full_name: string
  email: string
  phone?: string
  specialties?: string[]
}

export interface UpdateInstructorInput {
  full_name: string
  phone?: string
  specialties?: string[]
}

export const INSTRUCTOR_SPECIALTIES = [
  'Piano', 'Canto', 'Guitarra', 'Batería',
  'Violín', 'Saxo', 'Ukelele', 'Bajo',
  'Producción', 'Iniciación',
]
