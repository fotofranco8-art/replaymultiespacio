import { validateAndCheckin } from '@/features/check-in/services/checkin.actions'

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function CheckinPage({ searchParams }: Props) {
  const params = await searchParams
  const token = params.token

  if (!token) {
    return <CheckinResult success={false} message="QR inválido. Escanea el código del kiosco." />
  }

  const result = await validateAndCheckin(token)

  return (
    <CheckinResult
      success={result.success}
      message={result.message}
      studentName={result.studentName}
      className={result.className}
    />
  )
}

function CheckinResult({
  success,
  message,
  studentName,
  className,
}: {
  success: boolean
  message: string
  studentName?: string
  className?: string
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#080616' }}>
      <div className="text-center max-w-sm w-full">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-bold text-white"
          style={{
            background: success
              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
              : 'linear-gradient(135deg, #ef4444, #dc2626)',
          }}
        >
          {success ? '✓' : '✗'}
        </div>

        <div
          className="rounded-2xl border border-white/10 p-8"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          {studentName && (
            <p className="text-2xl font-bold text-white mb-1">{studentName}</p>
          )}
          {className && (
            <p className="text-sm text-white/50 mb-4">{className}</p>
          )}
          <p className={`text-lg font-medium ${success ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        </div>

        <a
          href="/"
          className="mt-8 inline-block text-sm text-white/30 hover:text-white/60 transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  )
}
