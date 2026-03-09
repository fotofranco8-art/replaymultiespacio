'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { getTeacherWeekClasses } from '@/features/teachers/services/teacher-portal.actions'

const DAY_LABELS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function formatWeekLabel(weekStart: string): string {
  const start = new Date(weekStart + 'T00:00:00')
  const end = new Date(weekStart + 'T00:00:00')
  end.setDate(end.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  return `${start.toLocaleDateString('es-AR', opts)} – ${end.toLocaleDateString('es-AR', opts)}`
}

type ClsItem = Awaited<ReturnType<typeof getTeacherWeekClasses>>[number]

interface Props {
  teacherId: string
  initialWeekStart: string
  initialClasses: ClsItem[]
}

export function TeacherAgendaClient({ teacherId, initialWeekStart, initialClasses }: Props) {
  const [weekStart, setWeekStart] = useState(initialWeekStart)
  const [classes, setClasses] = useState<ClsItem[]>(initialClasses)
  const [isPending, startTransition] = useTransition()

  function navigateWeek(direction: -1 | 1) {
    const next = addDays(weekStart, direction * 7)
    startTransition(async () => {
      const data = await getTeacherWeekClasses(teacherId, next)
      setWeekStart(next)
      setClasses(data)
    })
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const classesByDate = new Map<string, ClsItem[]>()
  for (const cls of classes) {
    const existing = classesByDate.get(cls.scheduled_date) ?? []
    classesByDate.set(cls.scheduled_date, [...existing, cls])
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', padding: '16px 20px 80px' }}>
      {/* Glow sutil */}
      <div
        className="fixed inset-x-0 top-0 h-64 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% -10%, rgba(168,85,247,0.10) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Título */}
        <div style={{ paddingTop: 8 }}>
          <span style={{ color: '#fff', fontFamily: 'var(--font-space-grotesk, sans-serif)', fontSize: 20, fontWeight: 700 }}>
            Mi Semana
          </span>
        </div>

        {/* Navegador de semana */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#18181B', border: '1px solid #27272A', borderRadius: 14,
            padding: '10px 16px',
            opacity: isPending ? 0.5 : 1, transition: 'opacity 0.2s',
          }}
        >
          <button
            onClick={() => navigateWeek(-1)}
            disabled={isPending}
            style={{ color: '#A855F7', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <span style={{ color: '#fff', fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 600 }}>
            {formatWeekLabel(weekStart)}
          </span>

          <button
            onClick={() => navigateWeek(1)}
            disabled={isPending}
            style={{ color: '#A855F7', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Lista de días */}
        {days.map((dateStr, i) => {
          const dayClasses = classesByDate.get(dateStr) ?? []
          const isToday = dateStr === today
          const dayDate = new Date(dateStr + 'T00:00:00')
          const dayNum = dayDate.getDate()
          const monthStr = dayDate.toLocaleDateString('es-AR', { month: 'short' })

          return (
            <div key={dateStr} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Encabezado del día */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: isToday ? 'linear-gradient(135deg, #A855F7, #7C3AED)' : '#18181B',
                    border: isToday ? 'none' : '1px solid #27272A',
                  }}
                >
                  <span style={{ color: isToday ? '#fff' : '#71717A', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-space-grotesk, sans-serif)' }}>
                    {dayNum}
                  </span>
                </div>
                <span style={{ color: isToday ? '#A855F7' : '#52525B', fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>
                  {DAY_LABELS_FULL[i].toUpperCase()} · {monthStr.toUpperCase()}
                </span>
              </div>

              {/* Clases del día */}
              {dayClasses.length === 0 ? (
                <div
                  style={{
                    background: '#0D0D0D', border: '1px solid #18181B', borderRadius: 12,
                    padding: '10px 14px',
                  }}
                >
                  <span style={{ color: '#3F3F46', fontFamily: 'Manrope, sans-serif', fontSize: 12 }}>
                    Sin clases
                  </span>
                </div>
              ) : (
                dayClasses.map((cls) => {
                  const discipline = Array.isArray(cls.disciplines)
                    ? (cls.disciplines as { name: string; color: string }[])[0]
                    : (cls.disciplines as { name: string; color: string } | null)

                  const enrolled = Array.isArray(cls.class_enrollments) ? cls.class_enrollments.length : 0
                  const present = Array.isArray(cls.attendance) ? cls.attendance.length : 0

                  return (
                    <Link
                      key={cls.id}
                      href={`/teacher/class/${cls.id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: '#18181B', border: '1px solid #27272A', borderRadius: 14,
                        padding: '12px 14px', textDecoration: 'none',
                        opacity: cls.is_cancelled ? 0.4 : 1,
                      }}
                    >
                      {/* Barra de color de disciplina */}
                      <div
                        style={{
                          width: 4, height: 40, borderRadius: 4, flexShrink: 0,
                          background: discipline?.color ?? '#A855F7',
                        }}
                      />

                      {/* Info */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                        <span style={{
                          color: cls.is_cancelled ? '#52525B' : '#fff',
                          fontFamily: 'var(--font-space-grotesk, sans-serif)', fontSize: 14, fontWeight: 700,
                          textDecoration: cls.is_cancelled ? 'line-through' : 'none',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {discipline?.name ?? 'Clase'}
                        </span>
                        <span style={{ color: '#71717A', fontFamily: 'Manrope, sans-serif', fontSize: 12 }}>
                          {cls.start_time.slice(0, 5)}–{cls.end_time.slice(0, 5)}{cls.room ? ` · ${cls.room}` : ''}
                        </span>
                      </div>

                      {/* Contador asistencia */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, flexShrink: 0 }}>
                        <span style={{ color: '#fff', fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-space-grotesk, sans-serif)', lineHeight: 1 }}>
                          {present}<span style={{ color: '#52525B', fontSize: 12, fontWeight: 500 }}>/{enrolled}</span>
                        </span>
                        <span style={{ color: '#52525B', fontFamily: 'Manrope, sans-serif', fontSize: 9, fontWeight: 600 }}>
                          PRESENTES
                        </span>
                      </div>

                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3F3F46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  )
                })
              )}
            </div>
          )
        })}

      </div>
    </div>
  )
}
