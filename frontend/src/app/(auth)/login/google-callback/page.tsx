'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

// Maps backend error codes to user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  access_denied:    'Google sign-in was cancelled.',
  invalid_state:    'Security check failed. Please try again.',
  auth_failed:      'Google sign-in failed. Please try again.',
  account_disabled: 'Your account has been disabled.',
  unverified_email: 'Your Google email is not verified.',
}

export default function GoogleCallbackPage() {
  const params = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const token = params.get('token')
    const role  = params.get('role')
    const error = params.get('error')

    if (error) {
      const msg = ERROR_MESSAGES[error] ?? 'Sign-in failed. Please try again.'
      window.location.href = `/login?error=${encodeURIComponent(msg)}`
      return
    }

    if (!token || !role) {
      window.location.href = '/login?error=Missing+token'
      return
    }

    try {
      // Minimal JWT decode to extract userId and email for AuthUser
      const payload = JSON.parse(atob(token.split('.')[1]))

      login({
        token,
        userId:   payload.sub,
        role:     role,                           // use query param — safer than parsing ClaimTypes.Role URI
        fullName: payload.email ?? 'User',        // JWT has no name claim; email is readable fallback
        expiresAt: new Date(payload.exp * 1000).toISOString(),
      })

      // Set cookie for middleware route protection (same as password login)
      document.cookie = `hmss_token=${token}; path=/; max-age=${30 * 60}; SameSite=Strict`

      // Role-based redirect
      if (role === 'Tenant')      window.location.href = '/tenant/requests'
      else if (role === 'Owner')  window.location.href = '/owner/property'
      else if (role === 'SystemAdmin') window.location.href = '/admin/users'
      else                        window.location.href = '/search'
    } catch {
      window.location.href = '/login?error=Invalid+token'
    }
  }, [params, login])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        <p className="text-stone-500">Signing you in...</p>
      </div>
    </div>
  )
}
