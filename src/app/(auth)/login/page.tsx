import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen" style={{ background: '#080616' }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1A0A30 0%, #0D0020 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse at 30% 50%, #A855F7 0%, transparent 60%)',
          }}
        />
        <div className="relative z-10 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
          >
            R
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Replay OS</h1>
          <p className="text-white/50 text-lg">Sistema de gestión para centros de fitness</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Bienvenido</h2>
            <p className="mt-1 text-sm text-white/50">Ingresa a tu cuenta para continuar</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
