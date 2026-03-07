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
    <div
      className={`min-h-screen flex items-center justify-center p-8 ${
        success ? 'bg-green-50' : 'bg-red-50'
      }`}
    >
      <div className="text-center max-w-sm">
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl ${
            success ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {success ? '✓' : '✗'}
        </div>
        {studentName && (
          <p className="text-xl font-bold text-gray-900 mb-1">{studentName}</p>
        )}
        {className && (
          <p className="text-sm text-gray-600 mb-4">{className}</p>
        )}
        <p
          className={`text-lg font-medium ${success ? 'text-green-800' : 'text-red-800'}`}
        >
          {message}
        </p>
        <a
          href="/"
          className="mt-8 inline-block text-sm text-gray-500 underline"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  )
}
