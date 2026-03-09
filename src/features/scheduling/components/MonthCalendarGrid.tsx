import type { CalendarClass } from '../types'

interface Props {
  classes: CalendarClass[]
  year: number
  month: number
  onSelectClass: (cls: CalendarClass) => void
}

const DAY_HEADERS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function MonthCalendarGrid({ classes, year, month, onSelectClass }: Props) {
  // Group classes by date
  const classesByDate = new Map<string, CalendarClass[]>()
  for (const cls of classes) {
    const existing = classesByDate.get(cls.scheduled_date) ?? []
    classesByDate.set(cls.scheduled_date, [...existing, cls])
  }

  const firstDay = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const startDayOfWeek = firstDay.getDay()

  const cells: (number | null)[] = []
  for (let i = 0; i < startDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const today = new Date()

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="grid grid-cols-7 border-b border-white/10">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-white/40">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 divide-x divide-y divide-white/5">
        {cells.map((day, idx) => {
          const dateStr = day
            ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            : null
          const dayClasses = dateStr ? (classesByDate.get(dateStr) ?? []) : []
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() + 1 &&
            year === today.getFullYear()

          return (
            <div key={idx} className={`min-h-24 p-1.5`} style={!day ? { background: 'rgba(0,0,0,0.15)' } : undefined}>
              {day && (
                <>
                  <span
                    className={`text-xs font-medium mb-1 inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      isToday ? 'bg-purple-600 text-white' : 'text-white/50'
                    }`}
                  >
                    {day}
                  </span>
                  <div className="space-y-0.5">
                    {dayClasses.map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => onSelectClass(cls)}
                        className={`w-full text-left px-1.5 py-0.5 rounded text-xs text-white truncate transition-opacity hover:opacity-80 ${
                          cls.is_cancelled ? 'opacity-40 line-through' : ''
                        }`}
                        style={{ backgroundColor: cls.disciplines?.color ?? '#6366f1' }}
                      >
                        {cls.start_time.slice(0, 5)} {cls.disciplines?.name}{cls.room ? ` · ${cls.room}` : ''}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
