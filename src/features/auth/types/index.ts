export type UserRole = 'admin' | 'teacher' | 'student' | 'reception'

export interface Profile {
  id: string
  center_id: string | null
  role: UserRole
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  profile: Profile | null
}

export const ROLE_REDIRECTS: Record<UserRole, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
  reception: '/reception',
}
