import type { CashRegisterSummary as Summary } from '../types'

interface Props {
  summary: Summary
}

export function CashRegisterSummary({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-green-50 rounded-xl p-4">
        <p className="text-xs font-medium text-green-700 mb-1">Efectivo</p>
        <p className="text-2xl font-bold text-green-900">${summary.cash_total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
      </div>
      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-xs font-medium text-blue-700 mb-1">Transferencia (base)</p>
        <p className="text-2xl font-bold text-blue-900">${summary.transfer_total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
      </div>
      <div className="bg-amber-50 rounded-xl p-4">
        <p className="text-xs font-medium text-amber-700 mb-1">Recargos (10%)</p>
        <p className="text-2xl font-bold text-amber-900">${summary.surcharge_total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
      </div>
      <div className="bg-gray-900 rounded-xl p-4">
        <p className="text-xs font-medium text-gray-300 mb-1">Total del dia</p>
        <p className="text-2xl font-bold text-white">${summary.grand_total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
      </div>
    </div>
  )
}
