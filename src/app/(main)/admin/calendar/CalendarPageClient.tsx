'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MonthCalendarGrid } from '@/features/scheduling/components/MonthCalendarGrid'
import { cancelClass } from '@/features/scheduling/services/scheduling.actions'
import type { CalendarClass } from '@/features/scheduling/types'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface Props {
  classes: CalendarClass[]
  year: number
  month: number
}

export function CalendarPageClient({ classes, year, month }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<CalendarClass | null>(null)
  const [cancelling, startCancel] = useTransition()

  function navigate(delta: number) {
    let newMonth = month + delta
    let newYear = year
    if (newMonth < 1) { newMonth = 12; newYear-- }
    if (newMonth > 12) { newMonth = 1; newYear++ }
    router.push(`/admin/calendar?year=${newYear}&month=${newMonth}`)
  }

  function handleCancel(classId: string) {
    startCancel(async () => {
      await cancelClass(classId)
      setSelected(null)
      router.refresh()
    })
  }

  const disciplineName = selected
    ? Array.isArray(selected.disciplines)
      ? (selected.disciplines as { name: string }[])[0]?.name
      : (selected.disciplines as { name: string } | null)?.name
    : null

  const teacherName = selected
    ? Array.isArray(selected.profiles)
      ? (selected.profiles as { full_name: string }[])[0]?.full_name
      : (selected.profiles as { full_name: string } | null)?.full_name
    : null

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendario</h1>
          <p className="text-sm text-white/50 mt-0.5">{MONTH_NAMES[month - 1]} {year}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 text-sm border border-white/10 text-white/60 rounded-lg hover:bg-white/5 transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => navigate(1)}
            className="px-3 py-1.5 text-sm border border-white/10 text-white/60 rounded-lg hover:bg-white/5 transition-colors"
          >
            →
          </button>
          <button
            onClick={() => router.push('/admin/class-templates')}
            className="px-4 py-1.5 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
          >
            Proyectar mes
          </button>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-xl border border-white/10 p-12 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-white/50 text-sm">Sin clases proyectadas para este mes.</p>
          <p className="text-white/30 text-xs mt-1">
            Ve a Plantillas y usa &quot;Proyectar mes&quot; para generar las clases.
          </p>
        </div>
      ) : (
        <MonthCalendarGrid
          classes={classes}
          year={year}
          month={month}
          onSelectClass={setSelected}
        />
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="rounded-2xl p-6 max-w-sm w-full border border-white/10"
            style={{ background: '#1A0A30' }}>
            <h3 className="font-bold text-white text-lg mb-4">{disciplineName}</h3>
            <div className="space-y-2.5 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-white/50">Fecha</span>
                <span className="font-medium text-white">
                  {new Date(selected.scheduled_date + 'T00:00:00').toLocaleDateString('es-AR', {
                    weekday: 'short', day: 'numeric', month: 'long',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Horario</span>
                <span className="font-medium text-white">
                  {selected.start_time.slice(0, 5)}–{selected.end_time.slice(0, 5)}
                </span>
              </div>
              {selected.room && (
                <div className="flex justify-between">
                  <span className="text-white/50">Aula</span>
                  <span className="font-medium text-white">{selected.room}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/50">Instructor</span>
                <span className="font-medium text-white">{teacherName ?? '—'}</span>
              </div>
            </div>

            {selected.is_cancelled ? (
              <div className="text-center py-2 text-sm text-red-400 font-medium bg-red-500/10 rounded-lg mb-3 border border-red-500/20">
                Clase cancelada
              </div>
            ) : (
              <button
                onClick={() => handleCancel(selected.id)}
                disabled={cancelling}
                className="w-full bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-500/30 disabled:opacity-50 mb-2 transition-colors"
              >
                {cancelling ? 'Cancelando...' : 'Cancelar clase'}
              </button>
            )}
            <button
              onClick={() => setSelected(null)}
              className="w-full text-sm text-white/40 hover:text-white/70 py-2 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
