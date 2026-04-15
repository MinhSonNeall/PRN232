'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useConversations } from '@/hooks/use-conversations'
import { ConversationList } from '@/components/chat/conversation-list'
import { ChatBox } from '@/components/shared/ChatBox'
import { clearUnreadChat } from '@/components/chat/chat-notification-toast'
import type { ConversationListItemDto } from '@/types/chat'

export default function TenantChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { conversations, isLoading, error } = useConversations()

  const selectedId = searchParams.get('c') ?? undefined
  const selected = conversations.find(c => c.conversationId === selectedId)

  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')

  const handleSelect = (conv: ConversationListItemDto) => {
    router.replace(`/tenant/chat?c=${conv.conversationId}`, { scroll: false })
    clearUnreadChat(conv.conversationId)
    setMobileView('chat')
  }

  if (isLoading) return <div className="py-12 text-center text-stone-400">Loading conversations...</div>
  if (error) return <div className="py-12 text-center text-red-500">{error}</div>

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold text-stone-900">Messages</h1>

      <div className="flex rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden" style={{ height: '70vh' }}>
        {/* Conversation list */}
        <div className={`w-full md:w-80 md:flex-shrink-0 border-r border-stone-100 overflow-y-auto ${
          mobileView === 'chat' ? 'hidden md:block' : ''
        }`}>
          <div className="px-4 py-3 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-700">Conversations</h2>
          </div>
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>

        {/* Chat panel */}
        <div className={`flex-1 flex flex-col ${
          mobileView === 'list' ? 'hidden md:flex' : 'flex'
        }`}>
          {selected ? (
            <>
              <div className="md:hidden flex items-center gap-2 px-4 py-2 border-b border-stone-100">
                <button
                  onClick={() => setMobileView('list')}
                  className="text-sm text-teal-600 font-medium"
                >
                  &larr; Back
                </button>
                <span className="text-sm font-semibold text-stone-700">{selected.otherPartyName}</span>
              </div>
              <div className="hidden md:flex items-center gap-2 px-4 py-3 border-b border-stone-100">
                <span className="text-sm font-semibold text-stone-700">{selected.otherPartyName}</span>
                {selected.listingTitle && (
                  <span className="text-xs text-stone-400">— {selected.listingTitle}</span>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatBox
                  conversationId={selected.conversationId}
                  otherPartyName={selected.otherPartyName}
                  hideHeader
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
