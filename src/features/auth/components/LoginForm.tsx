'use client'

import { useState } from 'react'
import { login } from '../services/auth.actions'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="tu@email.com"
          className="glass-input"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="glass-input"
        />
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ color: '#f87171', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.18)' }}
        >
          {error === 'Invalid login credentials'
            ? 'Email o contraseña incorrectos'
            : error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}
