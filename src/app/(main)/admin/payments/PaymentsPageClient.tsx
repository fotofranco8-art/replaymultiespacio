'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { utils, writeFile } from 'xlsx'
import { CashRegisterSummary } from '@/features/payments/components/CashRegisterSummary'
import { PaymentForm } from '@/features/payments/components/PaymentForm'
import { exportPaymentsPDF } from '@/features/payments/utils/export'
import type { Payment, CashRegisterSummary as Summary } from '@/features/payments/types'

interface Student {
  id: string
  full_name: string
}

interface Props {
  payments: Payment[]
  summary: Summary
  students: Student[]
}

export function PaymentsPageClient({ payments, summary, students }: Props) {
  const [showForm, setShowForm] = useState(false)

  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  function exportPayments() {
    const rows = payments.map((p) => ({
      Fecha: new Date(p.created_at).toLocaleDateString('es-AR'),
      Hora: new Date(p.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      Tipo: p.payment_type === 'product' ? 'Producto' : 'Alumno',
      Concepto: p.payment_type === 'product' ? (p.product_name ?? '') : (p.profiles?.full_name ?? ''),
      Método: p.method === 'cash' ? 'Efectivo' : 'Transferencia',
      'Monto base': Number(p.amount),
      Total: Number(p.final_amount),
    }))
    const ws = utils.json_to_sheet(rows)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Pagos')
    writeFile(wb, `pagos-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1
            className="text-3xl font-semibold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Caja
          </h1>
          <p className="text-sm mt-1 capitalize" style={{ color: 'rgba(255,255,255,0.40)' }}>{today}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {payments.length > 0 && (
            <>
              <button
                onClick={() => exportPaymentsPDF(payments, summary)}
                className="btn-secondary px-4 py-2 rounded-xl text-sm"
              >
                Exportar PDF
              </button>
              <button
                onClick={exportPayments}
                className="btn-secondary px-4 py-2 rounded-xl text-sm"
              >
                Exportar Excel
              </button>
            </>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary px-4 py-2 rounded-xl text-sm"
          >
            + Registrar pago
          </button>
        </div>
      </div>

      <CashRegisterSummary summary={summary} />

      <div
        className="mt-5 rounded-2xl p-6"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <h2
          className="font-semibold text-white mb-4 text-sm tracking-tight"
          style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
        >
          Movimientos de hoy
        </h2>
        {payments.length === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>Sin pagos registrados hoy.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[580px]">
              <thead>
                <tr className="text-left" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="pb-3 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.32)' }}>Tipo</th>
                  <th className="pb-3 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.32)' }}>Concepto</th>
                  <th className="pb-3 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.32)' }}>Método</th>
                  <th className="pb-3 text-xs font-medium text-right" style={{ color: 'rgba(255,255,255,0.32)' }}>Base</th>
                  <th className="pb-3 text-xs font-medium text-right" style={{ color: 'rgba(255,255,255,0.32)' }}>Total</th>
                  <th className="pb-3 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.32)' }}>Hora</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const concepto = p.payment_type === 'product'
                    ? (p.product_name ?? 'Producto')
                    : (p.profiles?.full_name ?? '—')

                  return (
                    <tr key={p.id} className="transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="py-3.5">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: p.payment_type === 'product' ? 'rgba(255,255,255,0.08)' : 'rgba(168,85,247,0.13)',
                            color: p.payment_type === 'product' ? 'rgba(255,255,255,0.55)' : '#C084FC',
                          }}
                        >
                          {p.payment_type === 'product' ? '🛍️ Producto' : '🎓 Alumno'}
                        </span>
                      </td>
                      <td className="py-3.5 font-medium text-white text-sm">{concepto}</td>
                      <td className="py-3.5">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: p.method === 'cash' ? 'rgba(34,197,94,0.13)' : 'rgba(59,130,246,0.13)',
                            color: p.method === 'cash' ? '#4ade80' : '#60a5fa',
                          }}
                        >
                          {p.method === 'cash' ? 'Efectivo' : 'Transferencia'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                        ${Number(p.amount).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                      </td>
                      <td className="py-3.5 text-right font-semibold text-white text-sm">
                        ${Number(p.final_amount).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                      </td>
                      <td className="py-3.5 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {new Date(p.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <PaymentForm students={students} onClose={() => setShowForm(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
