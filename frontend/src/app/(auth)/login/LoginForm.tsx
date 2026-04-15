'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authApi } from '@/lib/api/auth'
import { useAuth } from '@/hooks/use-auth'
import { ApiError } from '@/lib/api/api-client'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 2FA verification state for SystemAdmin
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')

  // Show errors forwarded by Google OAuth callback or other redirects
  const urlError = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const data = await authApi.signIn({ email, password })

      // Admin requires 2FA - show code input
      if (data.requiresVerification) {
        setPendingUserId(data.userId)
        setIsLoading(false)
        return
      }

      completeLogin(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pendingUserId) return
    setError(null)
    setIsLoading(true)
    try {
      const data = await authApi.verifyCode({ userId: pendingUserId, code: verificationCode })
      completeLogin(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const completeLogin = (data: { token: string; role: string; userId: string; fullName: string; expiresAt: string }) => {
    login(data)
    document.cookie = `hmss_token=${data.token}; path=/; max-age=${30 * 60}; SameSite=Strict`
    const redirect = searchParams.get('redirect')
    if (redirect) { window.location.href = redirect; return }
    if (data.role === 'Tenant') window.location.href = '/tenant/requests'
    else if (data.role === 'Owner') window.location.href = '/owner/property'
    else if (data.role === 'SystemAdmin') window.location.href = '/admin/users'
    else window.location.href = '/search'
  }

  // 2FA verification form
  if (pendingUserId) {
    return (
      <form onSubmit={handleVerifyCode} className="space-y-5">
        <div className="rounded-lg bg-teal-50 border border-teal-100 p-4 text-sm text-teal-800">
          <p className="font-medium">Verification Required</p>
          <p className="mt-1 text-teal-600">A 6-digit code has been sent to your email. Please enter it below.</p>
        </div>
        <div className="auth-field">
          <Input
            label="Verification Code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={verificationCode}
            onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 6-digit code"
            required
            className="py-2.5 text-base text-center tracking-[0.3em] font-mono"
          />
        </div>
        {error && <p className="text-sm text-red-600 animate-fade-up">{error}</p>}
        <Button type="submit" size="lg" isLoading={isLoading} className="w-full">Verify</Button>
        <button
          type="button"
          onClick={() => { setPendingUserId(null); setVerificationCode(''); setError(null) }}
          className="w-full text-sm text-stone-500 hover:text-stone-700"
        >
          Back to login
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* URL error (from Google OAuth redirect or other sources) */}
      {urlError && (
        <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">
          {urlError}
        </div>
      )}
      <div className="auth-field" style={{ animationDelay: '0.15s' }}>
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="py-2.5 text-base" />
      </div>
      <div className="auth-field" style={{ animationDelay: '0.25s' }}>
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="py-2.5 text-base" />
      </div>
      {error && <p className="text-sm text-red-600 animate-fade-up">{error}</p>}
      <div className="auth-field" style={{ animationDelay: '0.35s' }}>
        <Button type="submit" size="lg" isLoading={isLoading} className="w-full">Sign In</Button>
      </div>

      {/* Google OAuth — backend handles full flow */}
      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-stone-400">or</span>
        </div>
      </div>
      <a
        href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5236'}/api/auth/google`}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </a>

      <p className="text-center text-sm text-stone-600 auth-field" style={{ animationDelay: '0.45s' }}>
        Don&apos;t have an account? <Link href="/register" className="text-teal-700 hover:underline">Register</Link>
      </p>
    </form>
  )
}
