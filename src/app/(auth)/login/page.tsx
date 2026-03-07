import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Replay OS</h1>
          <p className="mt-1 text-sm text-gray-500">Ingresa a tu cuenta</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
