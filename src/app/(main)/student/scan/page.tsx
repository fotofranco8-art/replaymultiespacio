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

    const res = await validateAndCheckin(token)
    setResult(res)
    setState('result')
  }

  function handleReset() {
    setResult(null)
    setState('scanning')
    setScanKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen flex flex-col items-center" style={{ background: '#0A0A0A' }}>
      <div className="w-full max-w-sm px-5 pt-8 pb-6 flex flex-col items-center">

        <h1 className="font-display font-bold text-[22px] text-white mb-1">Escanear QR</h1>
        <p className="font-body text-white/40 text-sm text-center mb-8">
          Apuntá tu cámara al código QR del kiosco de recepción
        </p>

        {state === 'result' && result ? (
          /* Result overlay */
          <div className="w-full flex flex-col items-center gap-5 py-8">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: result.success ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}
            >
              {result.success ? (
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>

            {result.studentName && (
              <p className="font-display font-bold text-[20px] text-white text-center">{result.studentName}</p>
            )}
            {result.className && (
              <p className="text-white/60 text-sm text-center">{result.className}</p>
            )}
            <p
              className="text-base font-semibold text-center px-4"
              style={{ color: result.success ? '#22c55e' : '#ef4444' }}
            >
              {result.message}
            </p>

            <button
              onClick={handleReset}
              className="mt-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all"
              style={{ background: '#FF2D78' }}
            >
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
                background: '#0f0a1e',
                border: '2px solid rgba(255,45,120,0.4)',
                boxShadow: '0 0 0 4px rgba(255,45,120,0.1)',
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
                    top: corner.startsWith('t') ? 8 : undefined,
                    bottom: corner.startsWith('b') ? 8 : undefined,
                    left: corner.endsWith('l') ? 8 : undefined,
                    right: corner.endsWith('r') ? 8 : undefined,
                    borderTop: corner.startsWith('t') ? '3px solid #FF2D78' : undefined,
                    borderBottom: corner.startsWith('b') ? '3px solid #FF2D78' : undefined,
                    borderLeft: corner.endsWith('l') ? '3px solid #FF2D78' : undefined,
                    borderRight: corner.endsWith('r') ? '3px solid #FF2D78' : undefined,
                    borderRadius: corner === 'tl' ? '4px 0 0 0' : corner === 'tr' ? '0 4px 0 0' : corner === 'bl' ? '0 0 0 4px' : '0 0 4px 0',
                  }}
                />
              ))}
            </div>

            <p className="text-white/30 text-xs text-center">
              Asegurate de tener buena luz y el QR bien encuadrado
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
