import { createClient } from '@/lib/supabase/server'
import { QRDisplay } from '@/features/check-in/components/QRDisplay'

// Reception is a public kiosk page — center_id comes from env (single-tenant)
const CENTER_ID = process.env.NEXT_PUBLIC_CENTER_ID ?? '00000000-0000-0000-0000-000000000001'

async function getQRToken(): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('qr_tokens')
    .select('token')
    .eq('center_id', CENTER_ID)
    .maybeSingle()
  return data?.token ?? null
}

export default async function ReceptionPage() {
  const token = await getQRToken()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Replay OS</h1>
        <p className="text-gray-500 text-sm mb-10">Kiosco de asistencia</p>
        {token ? (
          <QRDisplay token={token} siteUrl={siteUrl} />
        ) : (
          <div className="text-red-400 text-sm">
            Error al cargar QR. Contacta al administrador.
          </div>
        )}
      </div>
    </div>
  )
}
