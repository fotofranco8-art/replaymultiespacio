export interface ReportSummary {
  revenueThisMonth: number
  revenueLastMonth: number
  activeStudents: number
  inactiveStudents: number
  classesThisMonth: number
  avgAttendanceRate: number
  blockedMemberships: number
}

export interface DisciplineStats {
  id: string
  name: string
  color: string
  studentCount: number
  revenue: number
  classCount: number
  attendanceRate: number
}

export interface MonthlyRevenue {
  month: string
  revenue: number
}

export interface BlockedMembershipInfo {
  id: string
  student_name: string
  discipline_name: string | null
  discipline_color: string | null
  monthly_fee: number
}
