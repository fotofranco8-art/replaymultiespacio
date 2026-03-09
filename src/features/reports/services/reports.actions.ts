'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getMyProfile } from '@/lib/supabase/profile-helper'
import type { ReportSummary, DisciplineStats, MonthlyRevenue, BlockedMembershipInfo } from '../types'

export async function getReportSummary(): Promise<ReportSummary> {
  const admin = createAdminClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) {
    return {
      revenueThisMonth: 0,
      revenueLastMonth: 0,
      activeStudents: 0,
      inactiveStudents: 0,
      classesThisMonth: 0,
      avgAttendanceRate: 0,
      blockedMemberships: 0,
    }
  }
  const centerId = profile.center_id

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() // 0-based

  // Rango mes actual
  const thisMonthStart = new Date(year, month, 1).toISOString()
  const thisMonthEnd = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

  // Rango mes anterior
  const lastMonthStart = new Date(year, month - 1, 1).toISOString()
  const lastMonthEnd = new Date(year, month, 0, 23, 59, 59).toISOString()

  const [
    paymentsThis,
    paymentsLast,
    studentsActive,
    studentsInactive,
    classesThis,
    enrollmentsThis,
    attendanceThis,
    blockedMem,
  ] = await Promise.all([
    // Revenue mes actual
    admin
      .from('payments')
      .select('final_amount')
      .eq('center_id', centerId)
      .gte('created_at', thisMonthStart)
      .lte('created_at', thisMonthEnd),
    // Revenue mes anterior
    admin
      .from('payments')
      .select('final_amount')
      .eq('center_id', centerId)
      .gte('created_at', lastMonthStart)
      .lte('created_at', lastMonthEnd),
    // Alumnos activos
    admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('center_id', centerId)
      .eq('role', 'student')
      .eq('is_active', true),
    // Alumnos inactivos
    admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('center_id', centerId)
      .eq('role', 'student')
      .eq('is_active', false),
    // Clases del mes actual — traemos IDs para filtrar attendance después
    admin
      .from('classes')
      .select('id')
      .eq('center_id', centerId)
      .gte('scheduled_date', thisMonthStart.split('T')[0])
      .lte('scheduled_date', thisMonthEnd.split('T')[0])
      .eq('is_cancelled', false),
    // Inscripciones a clases del mes (para calcular asistencia esperada)
    admin
      .from('class_enrollments')
      .select('class_id')
      .eq('center_id', centerId),
    // Asistencias del mes — sin filtro center_id (columna no existe en schema base)
    // filtramos via class_id join en el cálculo posterior
    admin
      .from('attendance')
      .select('id, class_id')
      .gte('checked_in_at', thisMonthStart)
      .lte('checked_in_at', thisMonthEnd),
    // Membresías bloqueadas
    admin
      .from('memberships')
      .select('id', { count: 'exact', head: true })
      .eq('center_id', centerId)
      .eq('is_blocked', true),
  ])

  const revenueThisMonth = (paymentsThis.data ?? []).reduce(
    (sum, p) => sum + Number(p.final_amount ?? 0),
    0
  )
  const revenueLastMonth = (paymentsLast.data ?? []).reduce(
    (sum, p) => sum + Number(p.final_amount ?? 0),
    0
  )

  // Tasa de asistencia: filtramos attendance por class_id del centro
  const centerClassIds = new Set((classesThis.data ?? []).map((c: { id: string }) => c.id))
  const totalEnrollments = (enrollmentsThis.data ?? []).filter((e) => centerClassIds.has(e.class_id)).length
  const totalAttendance = (attendanceThis.data ?? []).filter((a) => centerClassIds.has(a.class_id)).length
  const avgAttendanceRate =
    totalEnrollments > 0
      ? Math.round((totalAttendance / totalEnrollments) * 100)
      : 0

  return {
    revenueThisMonth: Math.round(revenueThisMonth * 100) / 100,
    revenueLastMonth: Math.round(revenueLastMonth * 100) / 100,
    activeStudents: studentsActive.count ?? 0,
    inactiveStudents: studentsInactive.count ?? 0,
    classesThisMonth: classesThis.data?.length ?? 0,
    avgAttendanceRate,
    blockedMemberships: blockedMem.count ?? 0,
  }
}

export async function getDisciplineReport(): Promise<DisciplineStats[]> {
  const admin = createAdminClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return []
  const centerId = profile.center_id

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const thisMonthStart = new Date(year, month, 1).toISOString().split('T')[0]
  const thisMonthEnd = new Date(year, month + 1, 0).toISOString().split('T')[0]

  // Traemos disciplinas activas del centro
  const { data: disciplines } = await admin
    .from('disciplines')
    .select('id, name, color')
    .eq('center_id', centerId)
    .eq('is_active', true)
    .order('name')

  if (!disciplines?.length) return []

  // Para cada disciplina calculamos stats en paralelo
  const results = await Promise.all(
    disciplines.map(async (disc) => {
      const [studentRes, revenueRes, classRes] = await Promise.all([
        // Alumnos con membresía activa en esta disciplina
        admin
          .from('memberships')
          .select('id', { count: 'exact', head: true })
          .eq('center_id', centerId)
          .eq('discipline_id', disc.id)
          .eq('status', 'active'),
        // Revenue del mes de pagos de alumnos con membresía en esta disciplina
        admin
          .from('payments')
          .select('final_amount, memberships!inner(discipline_id)')
          .eq('center_id', centerId)
          .eq('memberships.discipline_id', disc.id)
          .gte('created_at', `${thisMonthStart}T00:00:00`)
          .lte('created_at', `${thisMonthEnd}T23:59:59`),
        // Clases del mes de esta disciplina
        admin
          .from('classes')
          .select('id')
          .eq('center_id', centerId)
          .eq('discipline_id', disc.id)
          .gte('scheduled_date', thisMonthStart)
          .lte('scheduled_date', thisMonthEnd)
          .eq('is_cancelled', false),
      ])

      const studentCount = studentRes.count ?? 0
      const revenue = (revenueRes.data ?? []).reduce(
        (sum, p) => sum + Number(p.final_amount ?? 0),
        0
      )
      const classCount = classRes.data?.length ?? 0

      // Asistencia: buscamos attendance de clases de esta disciplina en el mes
      let attendanceRate = 0
      if (classRes.data?.length) {
        const classIds = classRes.data.map((c) => c.id)
        const [enrollRes, attendRes] = await Promise.all([
          admin
            .from('class_enrollments')
            .select('id', { count: 'exact', head: true })
            .in('class_id', classIds),
          admin
            .from('attendance')
            .select('id', { count: 'exact', head: true })
            .in('class_id', classIds),
        ])
        const enrolled = enrollRes.count ?? 0
        const attended = attendRes.count ?? 0
        attendanceRate = enrolled > 0 ? Math.round((attended / enrolled) * 100) : 0
      }

      return {
        id: disc.id,
        name: disc.name,
        color: disc.color ?? '#888',
        studentCount,
        revenue: Math.round(revenue * 100) / 100,
        classCount,
        attendanceRate,
      } satisfies DisciplineStats
    })
  )

  // Ordenar por revenue descendente
  return results.sort((a, b) => b.revenue - a.revenue)
}

export async function getMonthlyRevenueTrend(months = 4): Promise<MonthlyRevenue[]> {
  const admin = createAdminClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return []
  const centerId = profile.center_id

  const now = new Date()
  const result: MonthlyRevenue[] = []

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString()

    const { data } = await admin
      .from('payments')
      .select('final_amount')
      .eq('center_id', centerId)
      .gte('created_at', start)
      .lte('created_at', end)

    const revenue = (data ?? []).reduce((sum, p) => sum + Number(p.final_amount ?? 0), 0)

    // Nombre del mes en español
    const monthName = d.toLocaleDateString('es-AR', { month: 'short' })
    result.push({
      month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      revenue: Math.round(revenue * 100) / 100,
    })
  }

  return result
}

export async function getBlockedMemberships(): Promise<BlockedMembershipInfo[]> {
  const admin = createAdminClient()
  const profile = await getMyProfile()
  if (!profile?.center_id) return []
  const centerId = profile.center_id

  const { data: memberships } = await admin
    .from('memberships')
    .select('id, student_id, discipline_id, monthly_fee')
    .eq('center_id', centerId)
    .eq('is_blocked', true)
    .order('created_at', { ascending: false })

  if (!memberships?.length) return []

  const studentIds = [...new Set(memberships.map((m) => m.student_id).filter(Boolean))]
  const disciplineIds = [...new Set(memberships.map((m) => m.discipline_id).filter(Boolean))]

  const [profilesRes, disciplinesRes] = await Promise.all([
    admin.from('profiles').select('id, full_name').in('id', studentIds),
    disciplineIds.length > 0
      ? admin.from('disciplines').select('id, name, color').in('id', disciplineIds)
      : Promise.resolve({ data: [] }),
  ])

  const profileMap: Record<string, string> = {}
  for (const p of profilesRes.data ?? []) profileMap[p.id] = p.full_name ?? ''

  const disciplineMap: Record<string, { name: string; color: string }> = {}
  for (const d of disciplinesRes.data ?? []) disciplineMap[d.id] = { name: d.name, color: d.color ?? '#888' }

  return memberships.map((m) => ({
    id: m.id,
    student_name: m.student_id ? (profileMap[m.student_id] ?? 'Sin nombre') : 'Sin nombre',
    discipline_name: m.discipline_id ? (disciplineMap[m.discipline_id]?.name ?? null) : null,
    discipline_color: m.discipline_id ? (disciplineMap[m.discipline_id]?.color ?? null) : null,
    monthly_fee: Number(m.monthly_fee ?? 0),
  }))
}
