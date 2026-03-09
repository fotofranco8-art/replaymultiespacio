'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { MonthCalendarGrid } from '@/features/scheduling/components/MonthCalendarGrid'
import { DailyAgendaView } from '@/features/scheduling/components/DailyAgendaView'
import { NewAdHocClassForm } from '@/features/scheduling/components/NewAdHocClassForm'
import { cancelClass } from '@/features/scheduling/services/scheduling.actions'
import { rotateRoomsForMonth } from '@/features/rooms/services/rooms.actions'
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
  const [syncing, startSync] = useTransition()
  const [syncResult, setSyncResult] = useState<{ assigned: number; skipped: number } | null>(null)

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

  const navBtnStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.55)',
    borderRadius: '0.625rem',
    padding: '0.375rem 0.75rem',
    fontSize: '0.875rem',
    transition: 'all 0.15s',
    cursor: 'pointer',
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1
            className="text-3xl font-semibold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Agenda
          </h1>
          <p className="text-sm mt-1 capitalize" style={{ color: 'rgba(255,255,255,0.40)' }}>
            {view === 'monthly' ? `${MONTH_NAMES[month - 1]} ${year}` : dateLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {(['monthly', 'daily'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-1.5 text-xs font-medium transition-all"
                style={
                  view === v
                    ? { background: 'linear-gradient(135deg, #A855F7, #7C3AED)', color: '#fff', boxShadow: '0 0 12px rgba(168,85,247,0.25)' }
                    : { color: 'rgba(255,255,255,0.40)' }
                }
              >
                {v === 'monthly' ? 'Mensual' : 'Diaria'}
              </button>
            ))}
          </div>

          {/* Navigation */}
          {view === 'monthly' ? (
            <>
              <button onClick={() => navigateMonth(-1)} style={navBtnStyle}>←</button>
              <button onClick={() => navigateMonth(1)} style={navBtnStyle}>→</button>
              <button
                onClick={() => router.push('/admin/class-templates')}
                className="btn-primary px-4 py-1.5 rounded-xl text-sm font-medium"
              >
                Proyectar mes
              </button>
              <button
                onClick={() =>
                  startSync(async () => {
                    const result = await rotateRoomsForMonth(year, month)
                    setSyncResult(result)
                    router.refresh()
                  })
                }
                disabled={syncing}
                className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: syncing ? 'rgba(255,255,255,0.40)' : 'rgba(255,255,255,0.80)',
                }}
              >
                {syncing ? 'Sincronizando…' : '⟳ Sincronizar aulas'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigateDay(-1)} style={navBtnStyle}>←</button>
              <button
                onClick={goToday}
                style={navBtnStyle}
                className="text-xs"
              >
                Hoy
              </button>
              <button onClick={() => navigateDay(1)} style={navBtnStyle}>→</button>
            </>
          )}
        </div>
      </div>

      {/* Resultado de sincronización de aulas */}
      {syncResult && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm mb-4"
          style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.20)', color: '#4ade80' }}
        >
          <span>✓</span>
          <span>
            {syncResult.assigned} aula{syncResult.assigned !== 1 ? 's' : ''} asignada{syncResult.assigned !== 1 ? 's' : ''}
            {syncResult.skipped > 0 ? `, ${syncResult.skipped} sin aula disponible` : ''}
          </span>
          <button
            onClick={() => setSyncResult(null)}
            className="ml-auto"
            style={{ color: 'rgba(74,222,128,0.60)' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Content */}
      {view === 'monthly' ? (
        classes.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Sin clases proyectadas para este mes.</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
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
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null) }}
        >
          <div className="glass-modal rounded-2xl p-6 max-w-sm w-full">
            <h3
              className="font-semibold text-white text-lg mb-4 tracking-tight"
              style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
            >
              {disciplineName}
            </h3>
            <div className="space-y-2.5 text-sm mb-6">
              <div className="flex justify-between">
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>Fecha</span>
                <span className="font-medium text-white">
                  {new Date(selected.scheduled_date + 'T00:00:00').toLocaleDateString('es-AR', {
                    weekday: 'short', day: 'numeric', month: 'long',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>Horario</span>
                <span className="font-medium text-white">
                  {selected.start_time.slice(0, 5)}–{selected.end_time.slice(0, 5)}
                </span>
              </div>
              {selected.room && (
                <div className="flex justify-between">
                  <span style={{ color: 'rgba(255,255,255,0.45)' }}>Aula</span>
                  <span className="font-medium text-white">{selected.room}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>Instructor</span>
                <span className="font-medium text-white">{teacherName ?? '—'}</span>
              </div>
            </div>

            {selected.is_cancelled ? (
              <div
                className="text-center py-2 text-sm font-medium rounded-xl mb-3"
                style={{ color: '#f87171', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}
              >
                Clase cancelada
              </div>
            ) : (
              <button
                onClick={() => handleCancel(selected.id)}
                disabled={cancelling}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium mb-2 transition-colors disabled:opacity-50"
                style={{ color: '#f87171', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}
              >
                {cancelling ? 'Cancelando...' : 'Cancelar clase'}
              </button>
            )}
            <button
              onClick={() => setSelected(null)}
              className="w-full text-sm py-2 transition-colors"
              style={{ color: 'rgba(255,255,255,0.38)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.70)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}
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
