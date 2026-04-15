'use client'
import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/hooks/use-chat'
import { useAuth } from '@/hooks/use-auth'
import { chatApi } from '@/lib/api/chat'

interface ChatBoxProps {
  /** Legacy request-scoped mode — auto-resolved to conversationId */
  requestId?: string
  /** Conversation-based mode */
  conversationId?: string
  /** Display name of the other party */
  otherPartyName: string
  /** Optional: hide the header (for embedded use in chat pages) */
  hideHeader?: boolean
}

export function ChatBox({ requestId, conversationId: propConvId, otherPartyName, hideHeader }: ChatBoxProps) {
  const [resolvedConvId, setResolvedConvId] = useState<string | undefined>(propConvId)
  const [resolving, setResolving] = useState(false)

  // Sync when propConvId changes (e.g. owner switches conversation in sidebar)
  useEffect(() => {
    if (propConvId) setResolvedConvId(propConvId)
  }, [propConvId])

  // When requestId is provided, resolve it to a conversationId
  useEffect(() => {
    if (propConvId || !requestId) return
    setResolving(true)
    chatApi.getConversationForRequest(requestId)
      .then(res => setResolvedConvId(res.conversationId))
      .catch(() => {}) // useChat will handle connection errors
      .finally(() => setResolving(false))
  }, [requestId, propConvId])

  // Use propConvId directly when available, fall back to resolved
  const effectiveConvId = propConvId ?? resolvedConvId

  if (resolving) {
    return <div className="py-8 text-center text-sm text-stone-400">Connecting to chat...</div>
  }

  // Always use conversation mode once resolved
  return (
    <ChatBoxInner
      conversationId={effectiveConvId}
      otherPartyName={otherPartyName}
      hideHeader={hideHeader}
    />
  )
}

function ChatBoxInner({ conversationId, otherPartyName, hideHeader }: {
  conversationId?: string
  otherPartyName: string
  hideHeader?: boolean
}) {
  const { user } = useAuth()
  const { messages, connected, error, sendMessage } = useChat({ conversationId })
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    await sendMessage(input)
    setInput('')
  }

  if (error) return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
      Chat unavailable: {error}
    </div>
  )

  return (
    <div className="flex flex-col rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden h-full">
      {!hideHeader && (
        <div className="flex items-center gap-2 border-b border-stone-100 px-4 py-3">
          <div className={`h-2 w-2 rounded-full ${connected ? 'bg-teal-500' : 'bg-stone-300'}`} />
          <span className="text-sm font-semibold text-stone-700">Chat with {otherPartyName}</span>
          {!connected && <span className="text-xs text-stone-400">Connecting...</span>}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[240px]">
        {messages.length === 0 && (
          <p className="text-center text-xs text-stone-400 py-8">No messages yet. Say hello!</p>
        )}
        {messages.map(msg => {
          const isMine = msg.senderId === user?.userId
          return (
            <div key={msg.messageId} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                isMine
                  ? 'bg-teal-600 text-white rounded-br-sm'
                  : 'bg-stone-100 text-stone-800 rounded-bl-sm'
              }`}>
                {!isMine && (
                  <p className="text-[10px] font-semibold mb-0.5 text-stone-500">{msg.senderName}</p>
                )}
                <p>{msg.body}</p>
                <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-teal-200' : 'text-stone-400'}`}>
                  {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-stone-100 px-4 py-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          maxLength={2000}
          disabled={!connected}
          className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!connected || !input.trim()}
          className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-40 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  )
}
