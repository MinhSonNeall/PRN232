'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/Button'
import { NotificationBell } from '@/components/layout/notification-bell'

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change via escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const roleLinks = () => {
    if (!isAuthenticated || !user) return null
    const links: { href: string; label: string }[] =
      user.role === 'Tenant' ? [
        { href: '/tenant/requests', label: 'My Requests' },
        { href: '/tenant/chat', label: 'Chat' },
      ] :
      user.role === 'Owner' ? [
        { href: '/owner/property', label: 'Properties' },
        { href: '/owner/requests', label: 'Requests' },
        { href: '/owner/arrangements', label: 'Arrangements' },
        { href: '/owner/verification', label: 'Verification' },
        { href: '/owner/chat', label: 'Chat' },
      ] :
      user.role === 'SystemAdmin' ? [
        { href: '/admin/users', label: 'Users' },
        { href: '/admin/verifications', label: 'Verifications' },
        { href: '/admin/listings', label: 'Listings' },
      ] : []
    return links
  }

  const links = roleLinks() ?? []

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-stone-200/60'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 text-white text-sm font-bold shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
              H
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-stone-900">HMSS</span>
              <span className="text-[10px] font-medium text-stone-400 -mt-1 tracking-widest uppercase">Hotel Search</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/search">Search</NavLink>
            {links.map(l => <NavLink key={l.href} href={l.href}>{l.label}</NavLink>)}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <span className="text-sm font-medium text-stone-600 px-2">{user?.fullName}</span>
                <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link href="/register">
                  <Button size="sm" className="!bg-teal-600 hover:!bg-teal-700 !shadow-none">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-[5px] p-2.5 rounded-xl hover:bg-stone-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <span className={`block h-[2px] w-5 bg-stone-700 rounded-full transition-all duration-300 origin-center ${isOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block h-[2px] w-5 bg-stone-700 rounded-full transition-all duration-300 ${isOpen ? 'opacity-0 scale-0' : ''}`} />
            <span className={`block h-[2px] w-5 bg-stone-700 rounded-full transition-all duration-300 origin-center ${isOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-stone-100 bg-white px-5 py-4 space-y-1">
            <MobileNavLink href="/search" onClick={() => setIsOpen(false)}>Search</MobileNavLink>
            {links.map(l => (
              <MobileNavLink key={l.href} href={l.href} onClick={() => setIsOpen(false)}>
                {l.label}
              </MobileNavLink>
            ))}
            <div className="pt-3 mt-2 border-t border-stone-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <span className="text-sm font-medium text-stone-600 px-3 py-1.5">{user?.fullName}</span>
                  <Button variant="ghost" size="sm" onClick={() => { logout(); setIsOpen(false) }}>Logout</Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">Login</Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full !bg-teal-600 hover:!bg-teal-700">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

/* Desktop nav link with animated underline */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-50 transition-colors duration-200"
    >
      {children}
    </Link>
  )
}

/* Mobile nav link */
function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2.5 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
    >
      {children}
    </Link>
  )
}
