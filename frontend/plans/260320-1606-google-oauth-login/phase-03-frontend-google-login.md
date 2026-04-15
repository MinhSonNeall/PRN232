# Phase 3: Frontend — Google Login Button + Callback Page

**Priority:** Critical | **Effort:** 1h | **Status:** Planned
**Depends on:** Phase 2

## Overview

Add "Login with Google" button to the login page, and a callback page that receives the token from the backend redirect and stores it.

## Related Code Files

- **Modify:** `frontend/src/app/(auth)/login/page.tsx` — add Google button
- **Create:** `frontend/src/app/(auth)/login/google-callback/page.tsx` — token handler
- **Modify:** `frontend/src/hooks/use-auth.ts` — expose `login()` for callback use (already exists)

## Google Login Button

Add to existing `login/page.tsx` below the form submit button:

```tsx
{/* Divider */}
<div className="relative my-4">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-stone-200" />
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-white px-2 text-stone-400">or</span>
  </div>
</div>

{/* Google OAuth button — redirects to backend which handles the full flow */}
<a
  href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5236'}/api/auth/google`}
  className="flex w-full items-center justify-center gap-3 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 transition-colors"
>
  {/* Google "G" SVG icon */}
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
  Continue with Google
</a>
```

## Callback Page

```tsx
// app/(auth)/login/google-callback/page.tsx
'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

const ERROR_MESSAGES: Record<string, string> = {
  access_denied:    'Google sign-in was cancelled.',
  invalid_state:    'Security check failed. Please try again.',
  auth_failed:      'Google sign-in failed. Please try again.',
  account_disabled: 'Your account has been disabled.',
}

export default function GoogleCallbackPage() {
  const params = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const token = params.get('token')
    const role  = params.get('role')
    const error = params.get('error')

    if (error) {
      // Redirect to login with friendly error message
      const msg = ERROR_MESSAGES[error] ?? 'Sign-in failed.'
      window.location.href = `/login?error=${encodeURIComponent(msg)}`
      return
    }

    if (!token || !role) {
      window.location.href = '/login?error=Missing+token'
      return
    }

    // Decode JWT minimally to get userId + fullName + email for AuthUser
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      login({
        token,
        userId:    payload.sub,
        role:      payload.role ?? role,
        fullName:  payload.name ?? payload.email ?? 'User',
        expiresAt: new Date(payload.exp * 1000).toISOString(),
      })
      // login() handles role-based redirect
    } catch {
      window.location.href = '/login?error=Invalid+token'
    }
  }, [params, login])

  return <LoadingSpinner className="min-h-screen" text="Signing you in..." />
}
```

## Login Page — Show Error from Query Param

If `login/page.tsx` doesn't already read `?error=` from URL, add:

```tsx
// At top of LoginForm component:
const searchParams = useSearchParams()
const urlError = searchParams.get('error')

// In JSX, above the form:
{urlError && (
  <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">
    {urlError}
  </div>
)}
```

## Implementation Steps

1. Add Google button to `login/page.tsx` (below password field, after divider)
2. Show `?error=` query param on login page if present
3. Create `app/(auth)/login/google-callback/page.tsx`
4. Verify `use-auth.ts` `login()` handles `SignInResponseDto` with these fields
5. Run `npx tsc --noEmit` — 0 errors

## Success Criteria

- Google button visible on login page with correct Google colors
- Clicking button redirects to `http://localhost:5236/api/auth/google`
- After Google consent, user lands on `/login/google-callback`
- Spinner shown briefly, then redirected by role (Tenant → /tenant/requests)
- Error messages shown on login page for failure cases
