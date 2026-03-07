export interface Instructor {
  id: string
  full_name: string
  email: string
  phone: string | null
  is_active: boolean
  created_at: string
}

export interface NewInstructorInput {
  full_name: string
  email: string
  phone?: string
}
