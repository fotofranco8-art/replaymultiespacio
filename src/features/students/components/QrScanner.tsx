'use client'

import { useEffect, useRef } from 'react'

interface Props {
  onScan: (text: string) => void
}

export default function QrScanner({ onScan }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<unknown>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const id = 'qr-reader-' + Math.random().toString(36).slice(2)
    containerRef.current.id = id

    let stopped = false

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (stopped || !containerRef.current) return

      const scanner = new Html5Qrcode(id)
      scannerRef.current = scanner

      const config = { fps: 10, qrbox: { width: 240, height: 240 } }
      const onSuccess = (decodedText: string) => { onScan(decodedText) }
      const onError = () => { /* ignorar errores de frames sin QR */ }

      // Intentar cámara trasera primero, fallback a cualquier cámara
      scanner
        .start({ facingMode: 'environment' }, config, onSuccess, onError)
        .catch(() => {
          if (!stopped) {
            scanner.start({ facingMode: 'user' }, config, onSuccess, onError).catch(() => null)
          }
        })
    })

    return () => {
      stopped = true
      const s = scannerRef.current as { stop?: () => Promise<void> } | null
      if (s?.stop) s.stop().catch(() => null)
    }
  }, [onScan])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ colorScheme: 'dark' }}
    />
  )
}
