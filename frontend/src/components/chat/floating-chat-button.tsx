'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useConversations } from '@/hooks/use-conversations'
import { getUnreadChatCount, clearUnreadChat } from '@/components/chat/chat-notification-toast'
import type { ConversationListItemDto } from '@/types/chat'

/** Floating chat FAB — only shown for authenticated Tenant/Owner users */
export function FloatingChatButton() {
  const { user, isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  // Track unread count changes
  useEffect(() => {
    const sync = () => setUnread(getUnreadChatCount())
    sync()
    window.addEventListener('hmss-chat-unread-change', sync)
    return () => window.removeEventListener('hmss-chat-unread-change', sync)
  }, [])

  if (!isAuthenticated || !user || user.role === 'SystemAdmin') return null

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 hover:scale-105 transition-all duration-200"
        aria-label="Open chat"
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 rounded-full bg-red-500 text-[11px] font-bold text-white px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Mini panel */}
      {open && <FloatingChatPanel role={user.role} onClose={() => setOpen(false)} />}
    </>
  )
}

function FloatingChatPanel({ role, onClose }: { role: string; onClose: () => void }) {
  const router = useRouter()
  const { conversations, isLoading } = useConversations()

  const chatPath = role === 'Owner' ? '/owner/chat' : '/tenant/chat'

  const handleSelect = (conv: ConversationListItemDto) => {
    router.push(`${chatPath}?c=${conv.conversationId}`)
    onClose()
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-stone-50">
        <span className="text-sm font-semibold text-stone-700">Messages</span>
        <button
          onClick={() => { router.push(chatPath); onClose() }}
          className="text-xs text-teal-600 font-medium hover:text-teal-700"
        >
          View All
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-stone-400">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="py-8 text-center text-sm text-stone-400">No conversations yet</div>
        ) : (
          conversations.slice(0, 8).map(conv => (
            <button
              key={conv.conversationId}
              onClick={() => handleSelect(conv)}
              className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-800 truncate">{conv.otherPartyName}</span>
                {conv.lastMessageAt && (
                  <span className="text-[10px] text-stone-400 flex-shrink-0 ml-2">
                    {timeAgo(conv.lastMessageAt)}
                  </span>
                )}
              </div>
              {conv.lastMessageBody && (
                <p className="text-xs text-stone-500 truncate mt-0.5">{conv.lastMessageBody}</p>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}
