export interface Student {
  id: string
  full_name: string
  email: string
  phone: string | null
  is_active: boolean
  center_id: string | null
  created_at: string
}

export interface StudentWithMembership extends Student {
  memberships: {
    id: string
    plan_name: string
    monthly_fee: number
    classes_per_month: number | null
    status: 'active' | 'expired' | 'suspended'
    discipline_id: string | null
    disciplines?: { name: string } | null
  }[]
}

export interface NewStudentInput {
  full_name: string
  email: string
  phone?: string
  discipline_id: string
  plan_name: string
  monthly_fee: number
  classes_per_month: number
}
