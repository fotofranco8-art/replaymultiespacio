'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { MonthCalendarGrid } from '@/features/scheduling/components/MonthCalendarGrid'
import { DailyAgendaView } from '@/features/scheduling/components/DailyAgendaView'
import { NewAdHocClassForm } from '@/features/scheduling/components/NewAdHocClassForm'
import { cancelClass } from '@/features/scheduling/services/scheduling.actions'
import type { CalendarClass } from '@/features/scheduling/types'
import type { Room } from '@/features/rooms/types'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface Teacher { id: string; full_name: string }
interface DisciplineItem { id: string; name: string; color: string }

interface Props {
  classes: CalendarClass[]
  dailyClasses: CalendarClass[]
  year: number
  month: number
  view: 'monthly' | 'daily'
  date: string
  rooms: Room[]
  teachers: Teacher[]
  disciplines: DisciplineItem[]
}

export function CalendarPageClient({
  classes, dailyClasses, year, month, view, date, rooms, teachers, disciplines,
}: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<CalendarClass | null>(null)
  const [cancelling, startCancel] = useTransition()
  const [showNewClass, setShowNewClass] = useState(false)

  const currentDate = new Date(date + 'T00:00:00')
  const dateLabel = currentDate.toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  function navigateMonth(delta: number) {
    let newMonth = month + delta
    let newYear = year
    if (newMonth < 1) { newMonth = 12; newYear-- }
    if (newMonth > 12) { newMonth = 1; newYear++ }
    router.push(`/admin/calendar?view=monthly&year=${newYear}&month=${newMonth}`)
  }

  function navigateDay(delta: number) {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() + delta)
    const newDate = d.toISOString().split('T')[0]
    router.push(`/admin/calendar?view=daily&date=${newDate}`)
  }

  function goToday() {
    const today = new Date().toISOString().split('T')[0]
    router.push(`/admin/calendar?view=daily&date=${today}`)
  }

  function setView(v: 'monthly' | 'daily') {
    if (v === 'monthly') {
      router.push(`/admin/calendar?view=monthly&year=${year}&month=${month}`)
    } else {
      const today = new Date().toISOString().split('T')[0]
      router.push(`/admin/calendar?view=daily&date=${today}`)
    }
  }

  function handleCancel(classId: string) {
    startCancel(async () => {
      await cancelClass(classId)
      setSelected(null)
      router.refresh()
    })
  }

  const disciplineName = selected?.disciplines?.name ?? null
  const teacherName = selected?.profiles?.full_name ?? null

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Agenda</h1>
          <p className="text-sm text-white/50 mt-0.5 capitalize">
            {view === 'monthly' ? `${MONTH_NAMES[month - 1]} ${year}` : dateLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg overflow-hidden border border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['monthly', 'daily'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-1.5 text-xs font-medium transition-all"
                style={
                  view === v
                    ? { background: 'linear-gradient(135deg, #A855F7, #7C3AED)', color: '#fff' }
                    : { color: 'rgba(255,255,255,0.4)' }
                }
              >
                {v === 'monthly' ? 'Mensual' : 'Diaria'}
              </button>
            ))}
          </div>

          {/* Navigation */}
          {view === 'monthly' ? (
            <>
              <button
                onClick={() => navigateMonth(-1)}
                className="px-3 py-1.5 text-sm border border-white/10 text-white/60 rounded-lg hover:bg-white/5 transition-colors"
              >
                ←
              </button>
              <button
                onClick={() => navigateMonth(1)}
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
            </>
          ) : (
            <>
              <button
                onClick={() => navigateDay(-1)}
                className="px-3 py-1.5 text-sm border border-white/10 text-white/60 rounded-lg hover:bg-white/5 transition-colors"
              >
                ←
              </button>
              <button
                onClick={goToday}
                className="px-3 py-1.5 text-xs border border-white/10 text-white/60 rounded-lg hover:bg-white/5 transition-colors"
              >
                Hoy
              </button>
              <button
                onClick={() => navigateDay(1)}
                className="px-3 py-1.5 text-sm border border-white/10 text-white/60 rounded-lg hover:bg-white/5 transition-colors"
              >
                →
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {view === 'monthly' ? (
        classes.length === 0 ? (
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
        )
      ) : (
        <DailyAgendaView
          classes={dailyClasses}
          rooms={rooms}
          teachers={teachers}
          disciplines={disciplines}
          onNewClass={() => setShowNewClass(true)}
        />
      )}

      {/* Monthly detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="rounded-2xl p-6 max-w-sm w-full border border-white/10" style={{ background: '#1A0A30' }}>
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

      {/* New ad-hoc class form */}
      <AnimatePresence>
        {showNewClass && (
          <NewAdHocClassForm
            disciplines={disciplines}
            rooms={rooms}
            teachers={teachers}
            defaultDate={date}
            onClose={() => { setShowNewClass(false); router.refresh() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
