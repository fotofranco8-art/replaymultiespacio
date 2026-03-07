import {
  getTodayPayments,
  getCashRegisterSummary,
  getActiveStudents,
} from '@/features/payments/services/payments.actions'
import { PaymentsPageClient } from './PaymentsPageClient'

export default async function PaymentsPage() {
  const [payments, summary, students] = await Promise.all([
    getTodayPayments(),
    getCashRegisterSummary(),
    getActiveStudents(),
  ])

  return <PaymentsPageClient payments={payments} summary={summary} students={students} />
}
