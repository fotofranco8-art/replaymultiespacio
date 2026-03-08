'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { WeeklyTemplateGrid } from '@/features/scheduling/components/WeeklyTemplateGrid'
import { HolidayManager } from '@/features/scheduling/components/HolidayManager'
import { NewTemplateForm } from '@/features/scheduling/components/NewTemplateForm'
import { createDiscipline, projectMonth } from '@/features/scheduling/services/scheduling.actions'
import type { Discipline, ClassTemplate, Holiday } from '@/features/scheduling/types'

interface Teacher {
  id: string
  full_name: string
}

interface Props {
  disciplines: Discipline[]
  templates: ClassTemplate[]
  holidays: Holiday[]
  teachers: Teacher[]
}

export function SchedulingPageClient({ disciplines, templates, holidays, teachers }: Props) {
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [showDisciplineForm, setShowDisciplineForm] = useState(false)
  const [projecting, startProjection] = useTransition()

  // Discipline form state
  const [discName, setDiscName] = useState('')
  const [discColor, setDiscColor] = useState('#6366f1')
  const [discPending, startDisc] = useTransition()

  function handleProjectMonth() {
    const now = new Date()
    startProjection(async () => {
      try {
        await projectMonth(now.getFullYear(), now.getMonth() + 1)
        toast.success('Mes proyectado exitosamente')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error al proyectar')
      }
    })
  }

  function handleCreateDiscipline(e: React.FormEvent) {
    e.preventDefault()
    startDisc(async () => {
      await createDiscipline(discName, discColor)
      setDiscName('')
      setShowDisciplineForm(false)
    })
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Disciplines */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Disciplinas</h2>
            <button
              onClick={() => setShowDisciplineForm((v) => !v)}
              className="text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5"
            >
              + Nueva disciplina
            </button>
          </div>
          {showDisciplineForm && (
            <form onSubmit={handleCreateDiscipline} className="flex gap-3 mb-4">
              <input
                value={discName}
                onChange={(e) => setDiscName(e.target.value)}
                placeholder="Nombre (ej: Yoga, Pilates)"
                required
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <input
                type="color"
                value={discColor}
                onChange={(e) => setDiscColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-gray-200"
              />
              <button
                type="submit"
                disabled={discPending}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                Crear
              </button>
            </form>
          )}
          {disciplines.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {disciplines.map((d) => (
                <span
                  key={d.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: d.color }}
                >
                  {d.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Sin disciplinas. Crea una para empezar.</p>
          )}
        </div>

        {/* Weekly template */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Plantilla semanal</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTemplateForm(true)}
                disabled={disciplines.length === 0 || teachers.length === 0}
                className="text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 disabled:opacity-40"
              >
                + Nueva clase
              </button>
              <button
                onClick={handleProjectMonth}
                disabled={projecting || templates.length === 0}
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {projecting ? 'Proyectando...' : 'Proyectar mes'}
              </button>
            </div>
          </div>
          {(disciplines.length === 0 || teachers.length === 0) && (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-4 py-2 mb-4">
              {disciplines.length === 0
                ? 'Crea al menos una disciplina y un profesor antes de agregar clases.'
                : 'No hay profesores registrados en el sistema.'}
            </p>
          )}
          <WeeklyTemplateGrid templates={templates} />
        </div>

        {/* Holidays */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Feriados</h2>
          <HolidayManager holidays={holidays} />
        </div>
      </div>

      {showTemplateForm && (
        <NewTemplateForm
          disciplines={disciplines}
          teachers={teachers}
          onClose={() => setShowTemplateForm(false)}
        />
      )}
    </div>
  )
}
