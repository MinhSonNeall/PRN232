'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import * as signalR from '@microsoft/signalr'
import { useAuth } from '@/hooks/use-auth'

const HUB_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5236') + '/hub/chat'
const UNREAD_KEY = 'hmss_chat_unread'

interface ChatNotification {
  id: string
  conversationId: string
  senderName: string
  body: string
  timestamp: number
}

/** Reads unread chat count from localStorage */
export function getUnreadChatCount(): number {
  try {
    const items: ChatNotification[] = JSON.parse(localStorage.getItem(UNREAD_KEY) ?? '[]')
    return items.length
  } catch { return 0 }
}

/** Clears unread chat notifications (call when user opens chat page) */
export function clearUnreadChat(conversationId?: string) {
  if (!conversationId) {
    localStorage.setItem(UNREAD_KEY, '[]')
  } else {
    try {
      const items: ChatNotification[] = JSON.parse(localStorage.getItem(UNREAD_KEY) ?? '[]')
      localStorage.setItem(UNREAD_KEY, JSON.stringify(items.filter(i => i.conversationId !== conversationId)))
    } catch {
      localStorage.setItem(UNREAD_KEY, '[]')
    }
  }
  window.dispatchEvent(new Event('hmss-chat-unread-change'))
}

function addUnread(notif: ChatNotification) {
  try {
    const items: ChatNotification[] = JSON.parse(localStorage.getItem(UNREAD_KEY) ?? '[]')
    // Avoid duplicates, keep last 50
    const filtered = items.filter(i => i.id !== notif.id)
    filtered.unshift(notif)
    localStorage.setItem(UNREAD_KEY, JSON.stringify(filtered.slice(0, 50)))
  } catch {
    localStorage.setItem(UNREAD_KEY, JSON.stringify([notif]))
  }
  window.dispatchEvent(new Event('hmss-chat-unread-change'))
}

/**
 * Global chat notification toast.
 * Shows a floating toast when a new chat message arrives via SignalR.
 * Mount once in the app layout.
 */
export function ChatNotificationToast() {
  const { user, isAuthenticated } = useAuth()
  const [toasts, setToasts] = useState<ChatNotification[]>([])
  const connRef = useRef<signalR.HubConnection | null>(null)
  const router = useRouter()

  const handleNewMessage = useCallback((data: { conversationId: string; senderName: string; body: string }) => {
    // Check if user is currently on chat page for this conversation
    if (window.location.search.includes(data.conversationId)) return

    const notif: ChatNotification = {
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      conversationId: data.conversationId,
      senderName: data.senderName,
      body: data.body,
      timestamp: Date.now(),
    }

    addUnread(notif)
    setToasts(prev => [...prev.slice(-2), notif]) // max 3 visible toasts

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== notif.id))
    }, 5000)
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !user || user.role === 'SystemAdmin') return

    const token = localStorage.getItem('hmss_token')
    if (!token) return

    let stopped = false

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.None)
      .build()

    conn.on('NewChatMessage', (data) => {
      if (!stopped) handleNewMessage(data)
    })

    conn.start()
      .then(() => { if (!stopped) connRef.current = conn })
      .catch(() => {})

    return () => {
      stopped = true
      connRef.current = null
      conn.stop().catch(() => {})
    }
  }, [isAuthenticated, user, handleNewMessage])

  const handleClick = (notif: ChatNotification) => {
    setToasts(prev => prev.filter(t => t.id !== notif.id))
    clearUnreadChat(notif.conversationId)
    const chatPath = user?.role === 'Owner' ? '/owner/chat' : '/tenant/chat'
    router.push(`${chatPath}?c=${notif.conversationId}`)
  }

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 w-80 rounded-xl border border-stone-200 bg-white p-3 shadow-xl"
          style={{ animation: 'slideInRight 0.2s ease' }}
        >
          {/* Chat icon */}
          <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <button onClick={() => handleClick(t)} className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-stone-800 truncate">{t.senderName}</p>
            <p className="text-xs text-stone-500 truncate">{t.body}</p>
          </button>
          <button
            onClick={() => dismiss(t.id)}
            className="flex-shrink-0 text-stone-400 hover:text-stone-600 p-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
