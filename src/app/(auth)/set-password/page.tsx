import SetPasswordForm from '@/features/auth/components/SetPasswordForm'

export default function SetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 relative" style={{ background: '#07050F' }}>

      {/* Ambient pink glow */}
      <div
        className="absolute inset-x-0 top-0 h-72 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% -5%, rgba(255,45,120,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl blur-md opacity-50"
              style={{ background: 'rgba(255,45,120,0.55)' }}
            />
            <div
              className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
              style={{
                background: 'linear-gradient(135deg, #FF2D78, #C0155A)',
                fontFamily: 'var(--font-space-grotesk, sans-serif)',
              }}
            >
              R
            </div>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h1
            className="font-semibold text-[22px] text-white mb-1 tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk, sans-serif)' }}
          >
            Crear contraseña
          </h1>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Elegí una contraseña para acceder a tu cuenta
          </p>

          <SetPasswordForm />
        </div>

      </div>
    </div>
  )
}
