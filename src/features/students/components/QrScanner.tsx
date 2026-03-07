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

    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      if (stopped || !containerRef.current) return

      const scanner = new Html5QrcodeScanner(
        id,
        { fps: 10, qrbox: { width: 240, height: 240 }, rememberLastUsedCamera: true },
        false
      )
      scannerRef.current = scanner

      scanner.render(
        (decodedText: string) => {
          onScan(decodedText)
        },
        () => {
          // scan error — ignore
        }
      )
    })

    return () => {
      stopped = true
      const s = scannerRef.current as { clear?: () => Promise<void> } | null
      if (s?.clear) s.clear().catch(() => null)
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
