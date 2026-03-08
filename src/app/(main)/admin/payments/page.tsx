import {
  getTodayPayments,
  getCashRegisterSummary,
  getActiveStudents,
} from '@/features/payments/services/payments.actions'
import { PaymentsPageClient } from './PaymentsPageClient'

export default async function PaymentsPage() {
  const [payments, summary, students] = await Promise.all([
    getTodayPayments().catch(() => []),
    getCashRegisterSummary().catch(() => ({ cash_total: 0, transfer_total: 0, surcharge_total: 0, grand_total: 0 })),
    getActiveStudents().catch(() => []),
  ])

  return <PaymentsPageClient payments={payments} summary={summary} students={students} />
}
