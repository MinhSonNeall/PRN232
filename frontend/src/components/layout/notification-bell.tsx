'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { rentalRequestsApi } from '@/lib/api/rental-requests'
import { listingsApi } from '@/lib/api/listings'

interface Notification {
  id: string
  message: string
  href: string
  time: string
  read: boolean
}

const STORAGE_KEY = 'hmss_notifications_read'

/** Load set of read notification IDs from localStorage */
function getReadIds(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'))
  } catch { return new Set() }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

export function NotificationBell() {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return
    const readIds = getReadIds()
    const notifs: Notification[] = []

    try {
      if (user.role === 'Owner') {
        // Fetch owner's listings, then check for pending requests
        const listings = await listingsApi.getOwnerListings()
        const published = listings.filter(l => l.status === 'PublishedAvailable')
        for (const listing of published.slice(0, 10)) {
          try {
            const data = await rentalRequestsApi.getRoomRequests(listing.listingId) as unknown as (Record<string, unknown> | unknown[])
            const reqs = Array.isArray(data) ? data : ((data as Record<string, unknown>)?.requests as unknown[] ?? [])
            const pending = (reqs as { requestId: string; tenantName: string; status: string; submittedAt: string }[]).filter(r => r.status === 'Pending')
            for (const req of pending) {
              notifs.push({
                id: `req-${req.requestId}`,
                message: `${req.tenantName} requested "${listing.title}"`,
                href: `/owner/requests/room/${listing.listingId}`,
                time: req.submittedAt,
                read: readIds.has(`req-${req.requestId}`),
              })
            }
          } catch { /* skip failed listing */ }
        }
      } else if (user.role === 'Tenant') {
        // Fetch tenant's requests and show accepted/rejected
        const requests = await rentalRequestsApi.getMyRequests()
        for (const req of requests) {
          if (req.status === 'Accepted' || req.status === 'Rejected') {
            notifs.push({
              id: `status-${req.requestId}`,
              message: `Your request for "${req.listingTitle}" was ${req.status.toLowerCase()}`,
              href: '/tenant/requests',
              time: req.submittedAt,
              read: readIds.has(`status-${req.requestId}`),
            })
          }
        }
      }
    } catch { /* ignore fetch errors */ }

    // Sort newest first
    notifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    setNotifications(notifs)
  }, [isAuthenticated, user])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  // Poll every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, fetchNotifications])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    const readIds = getReadIds()
    notifications.forEach(n => readIds.add(n.id))
    saveReadIds(readIds)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleClick = (notif: Notification) => {
    const readIds = getReadIds()
    readIds.add(notif.id)
    saveReadIds(readIds)
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))
    setOpen(false)
    window.location.href = notif.href
  }

  if (!isAuthenticated) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        aria-label="Notifications"
      >
        {/* Bell icon */}
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white min-w-[18px] h-[18px] px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-stone-200 bg-white shadow-xl z-50" style={{ animation: 'scaleIn 0.15s ease' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <h3 className="text-sm font-semibold text-stone-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-sm text-stone-400 text-center">No notifications</p>
            ) : (
              notifications.slice(0, 20).map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-stone-50 hover:bg-stone-50 transition-colors ${!n.read ? 'bg-teal-50/50' : ''}`}
                >
                  <p className={`text-sm ${!n.read ? 'font-medium text-stone-900' : 'text-stone-600'}`}>{n.message}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{new Date(n.time).toLocaleDateString()}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
