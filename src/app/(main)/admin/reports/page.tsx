import { getReportSummary, getDisciplineReport, getMonthlyRevenueTrend, getBlockedMemberships } from '@/features/reports/services/reports.actions'
import { ReportsPageClient } from './ReportsPageClient'

export default async function ReportsPage() {
  const [summary, disciplineStats, revenueTrend, blockedMemberships] = await Promise.all([
    getReportSummary(),
    getDisciplineReport(),
    getMonthlyRevenueTrend(4),
    getBlockedMemberships(),
  ])

  return (
    <ReportsPageClient
      summary={summary}
      disciplineStats={disciplineStats}
      revenueTrend={revenueTrend}
      blockedMemberships={blockedMemberships}
    />
  )
}
