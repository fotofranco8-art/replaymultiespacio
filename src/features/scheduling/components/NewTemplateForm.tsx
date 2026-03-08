'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { X, Search } from 'lucide-react'
import { toast } from 'sonner'
import { createClassTemplate } from '../services/scheduling.actions'
import type { Discipline } from '../types'
import { DAY_NAMES_FULL } from '../types'

interface Teacher { id: string; full_name: string }
interface Room { id: string; name: string }
interface Student { id: string; full_name: string }

interface Props {
  disciplines: Discipline[]
  teachers: Teacher[]
  rooms: Room[]
  students: Student[]
  onClose: () => void
}

export function NewTemplateForm({ disciplines, teachers, rooms, students, onClose }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [noRoom, setNoRoom] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  const [form, setForm] = useState({
    discipline_id: '',
    teacher_id: '',
    day_of_week: '1',
    start_time: '09:00',
    end_time: '10:00',
    room: '',
    max_capacity: '20',
  })

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  const filteredStudents = students.filter((s) =>
    s.full_name.toLowerCase().includes(studentSearch.toLowerCase())
  )

  function toggleStudent(id: string) {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function selectAll() { setSelectedStudents(filteredStudents.map((s) => s.id)) }
  function clearAll() { setSelectedStudents([]) }

  function handleSubmit() {
    setError(null)
    if (!form.discipline_id) { setError('Seleccioná una disciplina'); return }
    if (!form.teacher_id) { setError('Seleccioná un profesor'); return }

    startTransition(async () => {
      try {
        await createClassTemplate({
          discipline_id: form.discipline_id,
          teacher_id: form.teacher_id,
          day_of_week: Number(form.day_of_week),
          start_time: form.start_time,
          end_time: form.end_time,
          room: noRoom ? undefined : (form.room || undefined),
          max_capacity: Number(form.max_capacity) || 20,
          student_ids: selectedStudents.length > 0 ? selectedStudents : undefined,
        })
        toast.success('Plantilla creada exitosamente')
        onClose()
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error al crear plantilla'
        setError(msg)
        toast.error(msg)
      }
    })
  }

  const inputCls = 'w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500'
  const inputStyle = { background: 'rgba(255,255,255,0.07)' }

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="rounded-2xl w-full max-w-md border border-white/10 overflow-y-auto max-h-[90vh]"
        style={{ background: '#1A0A30' }}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Nueva plantilla semanal</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Disciplina */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Disciplina</label>
            <select value={form.discipline_id} onChange={(e) => set('discipline_id', e.target.value)} className={inputCls} style={inputStyle}>
              <option value="" style={{ background: '#1A0A30' }}>Seleccionar disciplina...</option>
              {disciplines.map((d) => (
                <option key={d.id} value={d.id} style={{ background: '#1A0A30' }}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Profesor */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Profesor</label>
            <select value={form.teacher_id} onChange={(e) => set('teacher_id', e.target.value)} className={inputCls} style={inputStyle}>
              <option value="" style={{ background: '#1A0A30' }}>Seleccionar profesor...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id} style={{ background: '#1A0A30' }}>{t.full_name}</option>
              ))}
            </select>
          </div>

          {/* Día de la semana */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Día de la semana</label>
            <select value={form.day_of_week} onChange={(e) => set('day_of_week', e.target.value)} className={inputCls} style={inputStyle}>
              {DAY_NAMES_FULL.map((d, i) => (
                <option key={i} value={i} style={{ background: '#1A0A30' }}>{d}</option>
              ))}
            </select>
          </div>

          {/* Horarios */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Hora inicio</label>
              <input type="time" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} className={inputCls} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Hora fin</label>
              <input type="time" value={form.end_time} onChange={(e) => set('end_time', e.target.value)} className={inputCls} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </div>
          </div>

          {/* Aula */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Aula</label>
            <label className="flex items-center gap-2 mb-2 cursor-pointer text-sm text-white/50">
              <input
                type="checkbox"
                checked={noRoom}
                onChange={(e) => setNoRoom(e.target.checked)}
                className="w-3.5 h-3.5 rounded"
                style={{ accentColor: '#A855F7' }}
              />
              Sin aula fija
            </label>
            {!noRoom && (
              rooms.length > 0 ? (
                <select value={form.room} onChange={(e) => set('room', e.target.value)} className={inputCls} style={inputStyle}>
                  <option value="" style={{ background: '#1A0A30' }}>Seleccionar aula...</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.name} style={{ background: '#1A0A30' }}>{r.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={form.room}
                  onChange={(e) => set('room', e.target.value)}
                  placeholder="Ej. Salón Principal"
                  className={inputCls}
                  style={inputStyle}
                />
              )
            )}
            {noRoom && (
              <p className="text-xs text-white/30 mt-1">El aula se definirá al crear cada clase individualmente.</p>
            )}
          </div>

          {/* Capacidad */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Capacidad máx.</label>
            <input type="number" min="1" value={form.max_capacity} onChange={(e) => set('max_capacity', e.target.value)} className={inputCls} style={inputStyle} />
          </div>

          {/* Alumnos */}
          {students.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-white/60">
                  Alumnos asignados
                  {selectedStudents.length > 0 && (
                    <span className="ml-1.5 text-xs text-purple-400">({selectedStudents.length} seleccionados)</span>
                  )}
                </label>
                <div className="flex gap-2 text-xs text-white/40">
                  <button type="button" onClick={selectAll} className="hover:text-white/70 transition-colors">Todos</button>
                  <span>·</span>
                  <button type="button" onClick={clearAll} className="hover:text-white/70 transition-colors">Ninguno</button>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-2">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Buscar alumno..."
                  className="w-full border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={inputStyle}
                />
              </div>

              {/* Scrollable list */}
              <div
                className="rounded-xl border border-white/10 divide-y divide-white/5 overflow-y-auto"
                style={{ background: 'rgba(255,255,255,0.04)', maxHeight: '180px' }}
              >
                {filteredStudents.length === 0 ? (
                  <p className="text-xs text-white/30 text-center py-4">Sin resultados</p>
                ) : (
                  filteredStudents.map((s) => {
                    const checked = selectedStudents.includes(s.id)
                    return (
                      <label
                        key={s.id}
                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleStudent(s.id)}
                          className="w-3.5 h-3.5 rounded shrink-0"
                          style={{ accentColor: '#A855F7' }}
                        />
                        <span className="text-sm text-white/80 truncate">{s.full_name}</span>
                      </label>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-white/10 text-white/60 rounded-xl py-2.5 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleSubmit}
              className="flex-1 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-80"
              style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
            >
              {pending ? 'Creando...' : 'Crear plantilla'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
