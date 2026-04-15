'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

/** Returns the role-appropriate dashboard path */
function getDashboardPath(role: string): string {
  switch (role) {
    case 'Owner': return '/owner/property'
    case 'Tenant': return '/tenant/requests'
    case 'SystemAdmin': return '/admin/users'
    default: return '/search'
  }
}

/** Banner CTA buttons — shows "Register Free" for guests, "Go to Dashboard" for logged-in users */
export function BannerCta() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null

  if (isAuthenticated && user) {
    return (
      <Link
        href={getDashboardPath(user.role)}
        className="inline-flex items-center rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
      >
        Go to Dashboard
      </Link>
    )
  }

  return (
    <Link
      href="/register"
      className="inline-flex items-center rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
    >
      Register Free
    </Link>
  )
}

/** Hero CTA buttons — shows guest CTAs or dashboard link */
export function HeroCta() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null

  return (
    <div className="animate-fade-up delay-300 mt-8 flex flex-wrap gap-3">
      <Link
        href="/search"
        className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 hover:bg-teal-400 hover:shadow-teal-400/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        Search Rooms
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
      {isAuthenticated && user ? (
        <Link
          href={getDashboardPath(user.role)}
          className="inline-flex items-center rounded-xl border border-stone-600 px-6 py-3.5 text-sm font-semibold text-stone-200 hover:bg-stone-800 hover:border-stone-500 transition-all duration-200"
        >
          {user.role === 'Owner' ? 'Manage Properties' : 'My Dashboard'}
        </Link>
      ) : (
        <Link
          href="/register"
          className="inline-flex items-center rounded-xl border border-stone-600 px-6 py-3.5 text-sm font-semibold text-stone-200 hover:bg-stone-800 hover:border-stone-500 transition-all duration-200"
        >
          List Your Property
        </Link>
      )}
    </div>
  )
}

/** Owner section CTA — shows "Get Started as Owner" for guests, dashboard link for owners */
export function OwnerSectionCta() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null

  if (isAuthenticated && user) {
    return (
      <Link
        href={getDashboardPath(user.role)}
        className="inline-flex items-center gap-2 mt-8 rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition-colors"
      >
        {user.role === 'Owner' ? 'Go to My Properties' : 'Go to Dashboard'}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
    )
  }

  return (
    <Link
      href="/register"
      className="inline-flex items-center gap-2 mt-8 rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition-colors"
    >
      Get Started as Owner
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </Link>
  )
}

/** Bottom CTA section — shows register/login for guests, search/dashboard for logged-in */
export function BottomCta() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null

  if (isAuthenticated && user) {
    return (
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-stone-900 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Start Searching
        </Link>
        <Link
          href={getDashboardPath(user.role)}
          className="inline-flex items-center rounded-xl border border-white/30 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-all duration-200"
        >
          Go to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <Link
        href="/search"
        className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-stone-900 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        Start Searching
      </Link>
      <Link
        href="/register"
        className="inline-flex items-center rounded-xl border border-white/30 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-all duration-200"
      >
        Create Account
      </Link>
    </div>
  )
}
