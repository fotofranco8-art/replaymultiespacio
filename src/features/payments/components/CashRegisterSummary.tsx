import type { CashRegisterSummary as Summary } from '../types'

interface Props {
  summary: Summary
}

export function CashRegisterSummary({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="rounded-xl border border-white/10 p-5" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <p className="text-xs text-white/50 mb-2">Total mes</p>
        <p className="text-2xl font-bold text-white">${summary.grand_total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</p>
      </div>
      <div className="rounded-xl border border-white/10 p-5" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <p className="text-xs text-white/50 mb-2">Efectivo</p>
        <p className="text-2xl font-bold text-green-400">${summary.cash_total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</p>
      </div>
      <div className="rounded-xl border border-white/10 p-5" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <p className="text-xs text-white/50 mb-2">Transferencias</p>
        <p className="text-2xl font-bold text-blue-400">${summary.transfer_total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</p>
      </div>
      <div className="rounded-xl border border-white/10 p-5" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <p className="text-xs text-white/50 mb-2">Recargo +10%</p>
        <p className="text-2xl font-bold text-amber-400">${summary.surcharge_total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</p>
      </div>
    </div>
  )
}
