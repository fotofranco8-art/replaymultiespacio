import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen" style={{ background: '#07050F' }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-16 relative overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(168,85,247,0.12) 0%, transparent 70%)',
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.20), transparent)' }} />

        <div className="relative z-10 text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div
              className="absolute inset-0 rounded-2xl blur-lg opacity-60"
              style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
            />
            <div
              className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
            >
              R
            </div>
          </div>
          <h1
            className="text-4xl font-semibold text-white mb-3 tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Replay OS
          </h1>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Sistema de gestión para centros de fitness
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="relative w-12 h-12">
              <div
                className="absolute inset-0 rounded-xl blur-md opacity-60"
                style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
              />
              <div
                className="relative w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
              >
                R
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2
              className="text-2xl font-semibold text-white tracking-tight"
              style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
            >
              Bienvenido
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>
              Ingresa a tu cuenta para continuar
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
