'use client'

import { useState, useEffect, useRef } from 'react'
import { validateAndCheckin } from '@/features/check-in/services/checkin.actions'
import type { CheckinResult } from '@/features/check-in/services/checkin.actions'
import dynamic from 'next/dynamic'

// html5-qrcode is DOM-only
const QrScanner = dynamic(() => import('@/features/students/components/QrScanner'), { ssr: false })

type ScanState = 'scanning' | 'loading' | 'result'

export default function ScanPage() {
  const [state, setState] = useState<ScanState>('scanning')
  const [result, setResult] = useState<CheckinResult | null>(null)
  const [scanKey, setScanKey] = useState(0)

  async function handleScan(scannedText: string) {
    if (state !== 'scanning') return
    setState('loading')

    let token: string | null = null
    try {
      token = new URL(scannedText).searchParams.get('token')
    } catch {
      token = scannedText
    }

    if (!token) {
      setResult({ success: false, message: 'QR inválido — no se encontró token' })
      setState('result')
      return
    }

    try {
      const res = await validateAndCheckin(token)
      setResult(res)
    } catch (err) {
      console.error('[scan] validateAndCheckin error:', err)
      setResult({ success: false, message: 'Error de conexión. Intentá de nuevo.' })
    }
    setState('result')
  }

  function handleReset() {
    setResult(null)
    setState('scanning')
    setScanKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen flex flex-col items-center" style={{ background: '#07050F' }}>
      {/* Ambient glow */}
      <div
        className="absolute inset-x-0 top-0 h-72 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% -5%, rgba(255,45,120,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm px-5 pt-6 pb-6 flex flex-col items-center">

        <h1
          className="font-semibold text-[22px] text-white mb-1 tracking-tight"
          style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
        >
          Escanear QR
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'rgba(255,255,255,0.38)' }}>
          Apuntá tu cámara al código QR del kiosco de recepción
        </p>

        {state === 'result' && result ? (
          /* Result card */
          <div
            className="w-full flex flex-col items-center gap-5 p-6 rounded-2xl"
            style={{
              background: result.success ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: result.success ? '1px solid rgba(34,197,94,0.20)' : '1px solid rgba(239,68,68,0.20)',
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: result.success ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                boxShadow: result.success ? '0 0 24px rgba(34,197,94,0.18)' : '0 0 24px rgba(239,68,68,0.18)',
              }}
            >
              {result.success ? (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>

            {result.studentName && (
              <p
                className="font-semibold text-[20px] text-white text-center tracking-tight"
                style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
              >
                {result.studentName}
              </p>
            )}
            {result.className && (
              <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.55)' }}>{result.className}</p>
            )}
            <p
              className="text-base font-semibold text-center px-4"
              style={{ color: result.success ? '#4ade80' : '#f87171' }}
            >
              {result.message}
            </p>

            <button
              onClick={handleReset}
              className="mt-1 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #FF2D78, #C0155A)', boxShadow: '0 0 16px rgba(255,45,120,0.28)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
              </svg>
              Escanear de nuevo
            </button>
          </div>
        ) : (
          /* Scanner viewfinder */
          <div className="w-full flex flex-col items-center gap-6">
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                width: '280px',
                height: '280px',
                background: 'rgba(7,5,15,0.80)',
                backdropFilter: 'blur(8px)',
                border: '2px solid rgba(255,45,120,0.35)',
                boxShadow: '0 0 0 4px rgba(255,45,120,0.08), 0 0 40px rgba(255,45,120,0.12)',
              }}
            >
              {state === 'loading' ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div
                    className="w-10 h-10 rounded-full border-2 animate-spin"
                    style={{ borderColor: '#FF2D78', borderTopColor: 'transparent' }}
                  />
                </div>
              ) : (
                <QrScanner key={scanKey} onScan={handleScan} />
              )}

              {/* Corner accents */}
              {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
                <div
                  key={corner}
                  className="absolute w-6 h-6"
                  style={{
                    top: corner.startsWith('t') ? 10 : undefined,
                    bottom: corner.startsWith('b') ? 10 : undefined,
                    left: corner.endsWith('l') ? 10 : undefined,
                    right: corner.endsWith('r') ? 10 : undefined,
                    borderTop: corner.startsWith('t') ? '2.5px solid #FF2D78' : undefined,
                    borderBottom: corner.startsWith('b') ? '2.5px solid #FF2D78' : undefined,
                    borderLeft: corner.endsWith('l') ? '2.5px solid #FF2D78' : undefined,
                    borderRight: corner.endsWith('r') ? '2.5px solid #FF2D78' : undefined,
                    borderRadius: corner === 'tl' ? '4px 0 0 0' : corner === 'tr' ? '0 4px 0 0' : corner === 'bl' ? '0 0 0 4px' : '0 0 4px 0',
                  }}
                />
              ))}
            </div>

            <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.28)' }}>
              Asegurate de tener buena luz y el QR bien encuadrado
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
