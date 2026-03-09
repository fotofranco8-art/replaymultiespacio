'use client'

import { HolidayManager } from '@/features/scheduling/components/HolidayManager'
import type { Holiday } from '@/features/scheduling/types'

interface Props {
  holidays: Holiday[]
}

export function HolidaysPageClient({ holidays }: Props) {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-semibold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Feriados
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Al agregar un feriado se cancelan las clases del día y se acredita recuperación.
          </p>
        </div>
      </div>
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <HolidayManager holidays={holidays} />
      </div>
    </div>
  )
}
