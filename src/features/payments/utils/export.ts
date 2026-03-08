import type { Payment, CashRegisterSummary } from '../types'

export function exportPaymentsPDF(payments: Payment[], summary: CashRegisterSummary) {
  // jsPDF se importa dinámicamente para evitar SSR issues
  import('jspdf').then(async ({ jsPDF }) => {
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF()
    const today = new Date().toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    const dateStr = new Date().toISOString().split('T')[0]

    // Header
    doc.setFillColor(26, 10, 48)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Replay OS', 14, 18)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Cierre de caja', 14, 27)
    doc.setFontSize(9)
    doc.setTextColor(180, 180, 210)
    doc.text(today, 14, 35)

    // Summary boxes
    doc.setTextColor(40, 40, 40)
    const boxY = 50
    const boxes = [
      { label: 'Efectivo', value: `$${Number(summary.cash_total).toLocaleString('es-AR')}`, color: [34, 197, 94] as [number, number, number] },
      { label: 'Transferencia', value: `$${Number(summary.transfer_total).toLocaleString('es-AR')}`, color: [59, 130, 246] as [number, number, number] },
      { label: 'Recargo', value: `$${Number(summary.surcharge_total).toLocaleString('es-AR')}`, color: [245, 158, 11] as [number, number, number] },
      { label: 'TOTAL', value: `$${Number(summary.grand_total).toLocaleString('es-AR')}`, color: [168, 85, 247] as [number, number, number] },
    ]

    boxes.forEach((box, i) => {
      const x = 14 + i * 47
      doc.setDrawColor(...box.color)
      doc.setLineWidth(0.5)
      doc.roundedRect(x, boxY, 43, 22, 3, 3)
      doc.setTextColor(...box.color)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(box.label, x + 4, boxY + 8)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(box.value, x + 4, boxY + 17)
    })

    // Payments table
    autoTable(doc, {
      startY: boxY + 32,
      head: [['Hora', 'Alumno', 'Método', 'Monto base', 'Recargo', 'Total']],
      body: payments.map((p) => [
        new Date(p.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        p.profiles?.full_name ?? '—',
        p.method === 'cash' ? 'Efectivo' : 'Transferencia',
        `$${Number(p.amount).toLocaleString('es-AR')}`,
        p.method === 'transfer' ? `$${(Number(p.final_amount) - Number(p.amount)).toLocaleString('es-AR')}` : '—',
        `$${Number(p.final_amount).toLocaleString('es-AR')}`,
      ]),
      headStyles: { fillColor: [26, 10, 48], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 246, 255] },
      styles: { font: 'helvetica' },
    })

    doc.save(`cierre-caja-${dateStr}.pdf`)
  })
  .catch((err: Error) => {
    console.error('[exportPaymentsPDF]', err)
    alert('No se pudo exportar el PDF. Revisá la consola.')
  })
}
