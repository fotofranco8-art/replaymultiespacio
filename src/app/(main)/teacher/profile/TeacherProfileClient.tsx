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

  const initials = (fullName || 'P')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  function handleSave() {
    startTransition(async () => {
      await updateTeacherPhone(phoneVal)
      setEditing(false)
    })
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0A0A0A', padding: '16px 20px 80px', gap: '20px' }}
    >
      {/* Header */}
      <div className="flex items-center" style={{ gap: 12 }}>
        <Link
          href="/teacher"
          className="flex items-center justify-center cursor-pointer transition-opacity hover:opacity-70 shrink-0"
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#18181B', border: '1px solid #27272A',
            color: '#A1A1AA',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <span style={{ color: '#fff', fontFamily: 'var(--font-space-grotesk, sans-serif)', fontSize: 20, fontWeight: 700 }}>
          Mi perfil
        </span>
      </div>

      {/* Avatar card */}
      <div
        className="flex flex-col items-center"
        style={{
          background: '#18181B',
          border: '1px solid #27272A',
          borderRadius: 20,
          padding: '28px 20px 24px',
          gap: 10,
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: 72, height: 72, borderRadius: 36,
            background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
            marginBottom: 4,
          }}
        >
          <span style={{ color: '#fff', fontFamily: 'var(--font-space-grotesk, sans-serif)', fontSize: 28, fontWeight: 700 }}>
            {initials}
          </span>
        </div>
        <span style={{ color: '#fff', fontFamily: 'var(--font-space-grotesk, sans-serif)', fontSize: 20, fontWeight: 700, textAlign: 'center' }}>
          {fullName || 'Profesor'}
        </span>
        <span
          style={{
            background: 'rgba(168,85,247,0.12)',
            color: '#C084FC',
            fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 700,
            padding: '4px 12px', borderRadius: 20, letterSpacing: '0.04em',
          }}
        >
          DOCENTE
        </span>
      </div>

      {/* Info cards */}
      <div className="flex flex-col" style={{ gap: 10 }}>
        <span style={{ color: '#52525B', fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }}>
          INFORMACIÓN
        </span>

        {/* Teléfono */}
        <div
          style={{
            background: '#18181B',
            border: '1px solid #27272A',
            borderRadius: 16,
            padding: '14px 16px',
          }}
        >
          <div className="flex items-start justify-between" style={{ gap: 12 }}>
            <div className="flex items-center" style={{ gap: 10 }}>
              <div
                className="flex items-center justify-center shrink-0"
                style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(168,85,247,0.10)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div className="flex flex-col" style={{ gap: 1 }}>
                <span style={{ color: '#71717A', fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 600 }}>
                  Teléfono
                </span>
                {editing ? (
                  <input
                    value={phoneVal}
                    onChange={(e) => setPhoneVal(e.target.value)}
                    placeholder="+54 9 11 1234 5678"
                    className="outline-none"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: 14,
                      fontWeight: 500,
                      width: '160px',
                    }}
                    autoFocus
                  />
                ) : (
                  <span style={{ color: '#fff', fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 500 }}>
                    {phone || '—'}
                  </span>
                )}
              </div>
            </div>

            {editing ? (
              <div className="flex items-center" style={{ gap: 8 }}>
                <button
                  onClick={handleSave}
                  disabled={pending}
                  className="cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-40"
                  style={{
                    background: 'rgba(168,85,247,0.15)',
                    color: '#C084FC',
                    fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 700,
                    padding: '5px 10px', borderRadius: 8, border: 'none',
                  }}
                >
                  {pending ? 'Guardando…' : 'Guardar'}
                </button>
                <button
                  onClick={() => { setEditing(false); setPhoneVal(phone ?? '') }}
                  className="cursor-pointer transition-opacity hover:opacity-70"
                  style={{ color: '#52525B', fontFamily: 'Manrope, sans-serif', fontSize: 11, background: 'none', border: 'none' }}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="cursor-pointer transition-opacity hover:opacity-70 shrink-0"
                style={{
                  color: '#71717A',
                  fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 600,
                  background: 'none', border: 'none', padding: 0,
                }}
              >
                Editar
              </button>
            )}
          </div>
        </div>

        {/* Disciplinas */}
        <div
          style={{
            background: '#18181B',
            border: '1px solid #27272A',
            borderRadius: 16,
            padding: '14px 16px',
          }}
        >
          <div className="flex items-start" style={{ gap: 10 }}>
            <div
              className="flex items-center justify-center shrink-0"
              style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(168,85,247,0.10)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <div className="flex flex-col" style={{ gap: 6, flex: 1 }}>
              <span style={{ color: '#71717A', fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 600 }}>
                Disciplinas
              </span>
              {disciplines.length > 0 ? (
                <div className="flex flex-wrap" style={{ gap: 6 }}>
                  {disciplines.map((d) => (
                    <span
                      key={d}
                      style={{
                        background: 'rgba(168,85,247,0.10)',
                        color: '#C084FC',
                        fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 600,
                        padding: '4px 10px', borderRadius: 20,
                      }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              ) : (
                <span style={{ color: '#3F3F46', fontFamily: 'Manrope, sans-serif', fontSize: 13 }}>—</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
