export interface MembershipRow {
  id: string
  student_id: string
  plan_name: string
  monthly_fee: number
  classes_per_month: number | null
  status: 'active' | 'expired' | 'suspended'
  is_blocked: boolean
  start_date: string
  discipline_id: string | null
  center_id: string
  created_at: string
  profiles: {
    full_name: string
    email: string
  } | null
  disciplines: {
    name: string
    color: string
  } | null
}

export type MembershipStatus = 'active' | 'expired' | 'suspended'
