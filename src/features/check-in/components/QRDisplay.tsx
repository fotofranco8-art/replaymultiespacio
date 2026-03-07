'use client'

import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { createClient } from '@/lib/supabase/client'

interface Props {
  token: string
  siteUrl: string
}

interface OverlayState {
  studentName: string
  success: boolean
}

export function QRDisplay({ token, siteUrl }: Props) {
  const checkinUrl = `${siteUrl}/checkin?token=${token}`
  const [overlay, setOverlay] = useState<OverlayState | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('reception-checkins')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance',
        },
        async (payload) => {
          const { data } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', payload.new.student_id)
            .single()

          setOverlay({
            studentName: data?.full_name ?? 'Alumno',
            success: true,
          })

          setTimeout(() => setOverlay(null), 3000)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 relative">
      <div className="bg-white rounded-2xl p-8 shadow-2xl shadow-purple-500/20">
        <QRCode value={checkinUrl} size={240} />
      </div>
      <p className="text-white/40 text-sm max-w-xs text-center">
        Escaneá con tu app para registrar asistencia
      </p>

      {overlay && (
        <div className="fixed inset-x-0 bottom-0 py-10 text-center border-t border-white/10 backdrop-blur-sm"
          style={{ background: 'rgba(168,85,247,0.15)' }}
        >
          <p className="text-3xl font-bold text-white">¡Bienvenido, {overlay.studentName}!</p>
          <p className="text-lg font-normal mt-2 text-white/60">Asistencia registrada</p>
        </div>
      )}
    </div>
  )
}
