'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { createAdHocClass } from '../services/scheduling.actions'

interface Room { id: string; name: string }
interface Teacher { id: string; full_name: string }
interface DisciplineItem { id: string; name: string; color: string }

interface Props {
  disciplines: DisciplineItem[]
  rooms: Room[]
  teachers: Teacher[]
  defaultDate: string
  onClose: () => void
}

export function NewAdHocClassForm({ disciplines, rooms, teachers, defaultDate, onClose }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [noRoom, setNoRoom] = useState(false)

  const [form, setForm] = useState({
    discipline_id: '',
    teacher_id: '',
    room: '',
    scheduled_date: defaultDate,
    start_time: '09:00',
    end_time: '10:00',
    max_capacity: '20',
  })

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function handleSubmit() {
    setError(null)
    if (!form.discipline_id) { setError('Seleccioná una disciplina'); return }
    if (!form.scheduled_date) { setError('La fecha es requerida'); return }
    if (!form.start_time || !form.end_time) { setError('Los horarios son requeridos'); return }
    if (form.start_time >= form.end_time) { setError('La hora de inicio debe ser antes de la de fin'); return }

    startTransition(async () => {
      try {
        await createAdHocClass({
          discipline_id: form.discipline_id,
          teacher_id: form.teacher_id || undefined,
          room: noRoom ? undefined : (form.room || undefined),
          scheduled_date: form.scheduled_date,
          start_time: form.start_time,
          end_time: form.end_time,
          max_capacity: Number(form.max_capacity) || 20,
        })
        toast.success('Clase creada exitosamente')
        onClose()
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error al crear la clase'
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
          <h2 className="text-lg font-bold text-white">Nueva Clase</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Disciplina */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Disciplina</label>
            <select
              value={form.discipline_id}
              onChange={(e) => set('discipline_id', e.target.value)}
              className={inputCls}
              style={inputStyle}
            >
              <option value="" style={{ background: '#1A0A30' }}>Seleccionar disciplina...</option>
              {disciplines.map((d) => (
                <option key={d.id} value={d.id} style={{ background: '#1A0A30' }}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Profesor */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Profesor (opcional)</label>
            <select
              value={form.teacher_id}
              onChange={(e) => set('teacher_id', e.target.value)}
              className={inputCls}
              style={inputStyle}
            >
              <option value="" style={{ background: '#1A0A30' }}>Sin profesor asignado</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id} style={{ background: '#1A0A30' }}>{t.full_name}</option>
              ))}
            </select>
          </div>

          {/* Aula */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Aula</label>
            <label
              className="flex items-center gap-2 mb-2 cursor-pointer text-sm text-white/50"
            >
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
              <select
                value={form.room}
                onChange={(e) => set('room', e.target.value)}
                className={inputCls}
                style={inputStyle}
              >
                <option value="" style={{ background: '#1A0A30' }}>Seleccionar aula...</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.name} style={{ background: '#1A0A30' }}>{r.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Fecha</label>
            <input
              type="date"
              value={form.scheduled_date}
              onChange={(e) => set('scheduled_date', e.target.value)}
              className={inputCls}
              style={{ ...inputStyle, colorScheme: 'dark' }}
            />
          </div>

          {/* Horarios */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Hora inicio</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => set('start_time', e.target.value)}
                className={inputCls}
                style={{ ...inputStyle, colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Hora fin</label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => set('end_time', e.target.value)}
                className={inputCls}
                style={{ ...inputStyle, colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Capacidad */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Capacidad máx.</label>
            <input
              type="number"
              min="1"
              value={form.max_capacity}
              onChange={(e) => set('max_capacity', e.target.value)}
              className={inputCls}
              style={inputStyle}
            />
          </div>

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
              {pending ? 'Creando...' : 'Crear Clase'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
