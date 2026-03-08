export type PaymentMethod = 'cash' | 'transfer'
export type PaymentType = 'student' | 'product'

export interface Payment {
  id: string
  student_id: string | null
  center_id: string
  membership_id: string | null
  amount: number
  method: PaymentMethod
  payment_type: PaymentType
  product_name: string | null
  transfer_surcharge: boolean
  late_surcharge: boolean
  multi_discipline_discount: boolean
  final_amount: number
  notes: string | null
  registered_by: string | null
  created_at: string
  profiles?: { full_name: string } | null
}

export interface NewPaymentInput {
  payment_type: PaymentType
  // student payment
  student_id?: string
  late_surcharge?: boolean
  multi_discipline_discount?: boolean
  // product payment
  product_name?: string
  amount: number
  method: PaymentMethod
  notes?: string
}

export interface CashRegisterSummary {
  cash_total: number
  transfer_total: number
  surcharge_total: number
  student_total: number
  product_total: number
  grand_total: number
}

export interface StudentPaymentInfo {
  disciplines: {
    id: string
    name: string
    monthly_price: number
    modality: 'anual' | 'seminario'
  }[]
  base_amount: number
  has_multi_discount: boolean // 2+ disciplinas anuales
}
