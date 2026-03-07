'use client'

import { HolidayManager } from '@/features/scheduling/components/HolidayManager'
import type { Holiday } from '@/features/scheduling/types'

interface Props {
  holidays: Holiday[]
}

export function HolidaysPageClient({ holidays }: Props) {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Feriados</h1>
          <p className="text-sm text-white/50 mt-0.5">
            Al agregar un feriado se cancelan las clases del día y se acredita recuperación.
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <HolidayManager holidays={holidays} />
      </div>
    </div>
  )
}
