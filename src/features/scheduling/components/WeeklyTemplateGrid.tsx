'use client'

import { useTransition } from 'react'
import { deleteClassTemplate } from '../services/scheduling.actions'
import type { ClassTemplate } from '../types'
import { DAY_NAMES } from '../types'

interface Props {
  templates: ClassTemplate[]
}

export function WeeklyTemplateGrid({ templates }: Props) {
  const [pending, startTransition] = useTransition()

  if (templates.length === 0) {
    return (
      <p className="text-sm text-white/40 py-6 text-center">
        Sin plantillas. Crea la primera para comenzar a proyectar el mes.
      </p>
    )
  }

  const byDay = Array.from({ length: 7 }, (_, i) =>
    templates.filter((t) => t.day_of_week === i)
  )

  return (
    <div className="grid grid-cols-7 gap-2">
      {DAY_NAMES.map((day, i) => (
        <div key={i} className="min-h-24">
          <div className="text-xs font-semibold text-white/50 mb-2 text-center">{day}</div>
          <div className="space-y-1.5">
            {byDay[i].map((t) => (
              <div
                key={t.id}
                className="rounded-lg p-2 text-xs"
                style={{
                  backgroundColor: `${t.disciplines?.color ?? '#6366f1'}20`,
                  borderLeft: `3px solid ${t.disciplines?.color ?? '#6366f1'}`,
                }}
              >
                <div className="font-semibold text-white">{t.disciplines?.name}</div>
                <div className="text-white/60">
                  {t.start_time.slice(0, 5)}–{t.end_time.slice(0, 5)}
                </div>
                <div className="text-white/40">{t.profiles?.full_name}</div>
                {t.room && <div className="text-white/30">{t.room}</div>}
                <button
                  onClick={() => startTransition(() => deleteClassTemplate(t.id))}
                  disabled={pending}
                  className="mt-1 text-red-400 hover:text-red-600 text-xs"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
