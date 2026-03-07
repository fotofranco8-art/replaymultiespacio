'use client'

import QRCode from 'react-qr-code'

interface Props {
  token: string
  siteUrl: string
}

export function QRDisplay({ token, siteUrl }: Props) {
  const checkinUrl = `${siteUrl}/checkin?token=${token}`

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <QRCode value={checkinUrl} size={240} />
      </div>
      <p className="text-gray-400 text-sm max-w-xs text-center">
        Escaneá con tu app para registrar asistencia
      </p>
    </div>
  )
}
