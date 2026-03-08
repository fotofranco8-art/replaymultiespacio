'use client'

import { useState } from 'react'
import type { CalendarClass } from '../types'

interface Room {
  id: string
  name: string
}

interface Teacher {
  id: string
  full_name: string
}

interface DisciplineItem {
  id: string
  name: string
  color: string
}

interface Props {
  classes: CalendarClass[]
  rooms: Room[]
  teachers: Teacher[]
  disciplines: DisciplineItem[]
  onNewClass: () => void
}

const SLOT_HEIGHT = 72 // px per hour
const START_HOUR = 7
const END_HOUR = 22
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR)

function timeToDecimalHour(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h + m / 60
}

export function DailyAgendaView({ classes, rooms, teachers, disciplines, onNewClass }: Props) {
  const [filterRoom, setFilterRoom] = useState('')
  const [filterTeacher, setFilterTeacher] = useState('')
  const [filterDiscipline, setFilterDiscipline] = useState('')

  // Determine columns: rooms that appear in classes OR rooms from the rooms list
  const classRoomNames = [...new Set(classes.map((c) => c.room).filter(Boolean) as string[])]
  const allRoomNames = [...new Set([...rooms.map((r) => r.name), ...classRoomNames])]
  const columns = allRoomNames.length > 0 ? allRoomNames : ['General']

  // Filter classes
  const filtered = classes.filter((c) => {
    if (filterRoom && c.room !== filterRoom) return false
    if (filterTeacher && c.profiles?.full_name !== filterTeacher) return false
    if (filterDiscipline && c.disciplines?.name !== filterDiscipline) return false
    return true
  })

  // Unique teachers and disciplines appearing in today's classes
  const classTeachers = [...new Set(classes.map((c) => c.profiles?.full_name).filter(Boolean))]
  const classDisciplines = [...new Set(classes.map((c) => c.disciplines?.name).filter(Boolean))]

  const totalHeight = HOURS.length * SLOT_HEIGHT
  const selectStyle = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.7)',
    borderRadius: '8px',
    fontSize: '12px',
    padding: '6px 10px',
    outline: 'none',
  }

  return (
    <div>
      {/* Filters + action row */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {/* Room filter */}
        <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} style={selectStyle}>
          <option value="">Todas las aulas</option>
          {allRoomNames.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        {/* Teacher filter */}
        {classTeachers.length > 0 && (
          <select value={filterTeacher} onChange={(e) => setFilterTeacher(e.target.value)} style={selectStyle}>
            <option value="">Todos los profesores</option>
            {classTeachers.map((t) => <option key={t} value={t!}>{t}</option>)}
          </select>
        )}

        {/* Discipline filter */}
        {classDisciplines.length > 0 && (
          <select value={filterDiscipline} onChange={(e) => setFilterDiscipline(e.target.value)} style={selectStyle}>
            <option value="">Todas las disciplinas</option>
            {classDisciplines.map((d) => <option key={d} value={d!}>{d}</option>)}
          </select>
        )}

        <div className="ml-auto">
          <button
            onClick={onNewClass}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
          >
            + Nueva Clase
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-xl border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {/* Column headers */}
        <div className="flex" style={{ minWidth: columns.length * 180 + 56 }}>
          <div className="w-14 shrink-0 border-b border-white/10" />
          {columns.map((col) => (
            <div
              key={col}
              className="flex-1 border-l border-b border-white/10 px-3 py-2.5 text-center"
              style={{ minWidth: 180 }}
            >
              <span className="text-xs font-semibold text-white/70">{col}</span>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="flex relative" style={{ height: totalHeight, minWidth: columns.length * 180 + 56 }}>
          {/* Hours labels */}
          <div className="w-14 shrink-0 relative">
            {HOURS.map((h, i) => (
              <div
                key={h}
                className="absolute w-full flex items-start justify-end pr-2 pt-1"
                style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
              >
                <span className="text-xs text-white/25">{String(h).padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>

          {/* Room columns */}
          {columns.map((col) => {
            const colClasses = filtered.filter((c) => (c.room ?? 'General') === col)

            return (
              <div
                key={col}
                className="flex-1 relative border-l border-white/5"
                style={{ minWidth: 180, height: totalHeight }}
              >
                {/* Hour lines */}
                {HOURS.map((h, i) => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-white/5"
                    style={{ top: i * SLOT_HEIGHT }}
                  />
                ))}

                {/* Classes */}
                {colClasses.map((cls) => {
                  const startH = timeToDecimalHour(cls.start_time)
                  const endH = timeToDecimalHour(cls.end_time)
                  const top = (startH - START_HOUR) * SLOT_HEIGHT + 1
                  const height = Math.max((endH - startH) * SLOT_HEIGHT - 4, 24)
                  const color = cls.disciplines?.color ?? '#A855F7'

                  return (
                    <div
                      key={cls.id}
                      className="absolute left-1.5 right-1.5 rounded-lg px-2.5 py-1.5 overflow-hidden"
                      style={{
                        top,
                        height,
                        backgroundColor: color + '22',
                        borderLeft: `3px solid ${color}`,
                      }}
                    >
                      <p className="text-xs font-semibold text-white truncate leading-tight">
                        {cls.disciplines?.name ?? 'Clase'}
                      </p>
                      <p className="text-[10px] text-white/50 leading-tight mt-0.5">
                        {cls.start_time.slice(0, 5)}–{cls.end_time.slice(0, 5)}
                      </p>
                      {cls.profiles?.full_name && height >= 56 && (
                        <p className="text-[10px] text-white/40 truncate leading-tight">
                          {cls.profiles.full_name}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-white/40 py-8">Sin clases para este día.</p>
      )}
    </div>
  )
}
