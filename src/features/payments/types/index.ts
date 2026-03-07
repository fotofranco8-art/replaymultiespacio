export type PaymentMethod = 'cash' | 'transfer'

export interface Payment {
  id: string
  student_id: string
  center_id: string
  membership_id: string | null
  amount: number
  method: PaymentMethod
  transfer_surcharge: boolean
  final_amount: number
  notes: string | null
  registered_by: string | null
  created_at: string
  profiles?: { full_name: string }
}

export interface NewPaymentInput {
  student_id: string
  amount: number
  method: PaymentMethod
  notes?: string
}

export interface CashRegisterSummary {
  cash_total: number
  transfer_total: number
  surcharge_total: number
  grand_total: number
}
