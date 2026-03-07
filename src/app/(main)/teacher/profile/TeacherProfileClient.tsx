'use client'

import { useState, useTransition } from 'react'
import { updateTeacherPhone } from '@/features/teachers/services/teacher-portal.actions'
import Link from 'next/link'

interface Props {
  fullName: string
  phone: string | null
  disciplines: string[]
}

export function TeacherProfileClient({ fullName, phone, disciplines }: Props) {
  const [editing, setEditing] = useState(false)
  const [phoneVal, setPhoneVal] = useState(phone ?? '')
  const [pending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      await updateTeacherPhone(phoneVal)
      setEditing(false)
    })
  }

  return (
    <div className="min-h-screen p-8" style={{ background: '#080616' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/teacher" className="text-white/40 hover:text-white/70 transition-colors text-lg">
            ←
          </Link>
          <h1 className="text-2xl font-bold text-white">Mi perfil</h1>
        </div>

        <div className="rounded-xl border border-white/10 p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
            <span className="text-white/50">Nombre</span>
            <span className="font-medium text-white">{fullName}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
            <span className="text-white/50">Teléfono</span>
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  value={phoneVal}
                  onChange={(e) => setPhoneVal(e.target.value)}
                  className="border border-white/10 rounded-lg px-2 py-1 text-sm text-white w-40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                />
                <button
                  onClick={handleSave}
                  disabled={pending}
                  className="text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-xs text-white/40 hover:text-white/60"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{phone ?? '—'}</span>
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-white/40 hover:text-white/60"
                >
                  Editar
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-between text-sm pt-0">
            <span className="text-white/50">Disciplinas</span>
            <span className="font-medium text-white text-right">
              {disciplines.length > 0 ? disciplines.join(', ') : '—'}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/teacher"
            className="block text-center text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            Volver a mis clases
          </Link>
        </div>
      </div>
    </div>
  )
}
