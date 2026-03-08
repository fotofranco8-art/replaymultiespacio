import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: '#0A0A0A' }}>
      <div className="w-full max-w-sm p-8 text-center space-y-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: '#FF2D78' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91" />
          </svg>
        </div>
        <div>
          <h1 className="font-bold text-2xl text-white mb-2">Acceso por invitación</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            El registro es solo por invitación del administrador. Revisá tu email para el enlace de acceso.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full px-4 py-3 rounded-xl font-semibold text-white text-sm transition-all"
          style={{ background: '#FF2D78' }}
        >
          Ir al login
        </Link>
      </div>
    </div>
  )
}
