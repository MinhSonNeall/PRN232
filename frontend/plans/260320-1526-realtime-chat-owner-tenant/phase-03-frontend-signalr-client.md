# Phase 3: Frontend — SignalR Client + Chat UI Component

**Priority:** Critical | **Effort:** 2h | **Status:** Complete
**Depends on:** Phase 2

## Overview

Install `@microsoft/signalr`, build a reusable `ChatBox` component with connection management and message UI.

## Related Code Files

- **Create:** `frontend/src/hooks/use-chat.ts` — SignalR connection hook
- **Create:** `frontend/src/components/shared/ChatBox.tsx` — chat UI component
- **Create:** `frontend/src/lib/api/chat.ts` — REST history API call
- **Create:** `frontend/src/types/chat.ts` — types

## Install Dependency

```bash
cd frontend && npm install @microsoft/signalr
```

## Types

```typescript
// types/chat.ts
export interface ChatMessageDto {
  messageId: string
  senderId: string
  senderName: string
  body: string
  sentAt: string
}
```

## API Client

```typescript
// lib/api/chat.ts
import { apiRequest } from './api-client'
import type { ChatMessageDto } from '@/types/chat'

export const chatApi = {
  getHistory: (requestId: string) =>
    apiRequest<ChatMessageDto[]>(`/api/chat/${requestId}/history`),
}
```

## useChat Hook

```typescript
// hooks/use-chat.ts
'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import * as signalR from '@microsoft/signalr'
import type { ChatMessageDto } from '@/types/chat'
import { chatApi } from '@/lib/api/chat'

const HUB_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5236') + '/hub/chat'

export function useChat(requestId: string) {
  const [messages, setMessages]   = useState<ChatMessageDto[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const connRef = useRef<signalR.HubConnection | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('hmss_token') ?? ''

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    conn.on('ReceiveMessage', (msg: ChatMessageDto) =>
      setMessages(prev => [...prev, msg])
    )

    const start = async () => {
      try {
        // Load history first, then connect
        const history = await chatApi.getHistory(requestId)
        setMessages(history)

        await conn.start()
        await conn.invoke('JoinChat', requestId)
        setConnected(true)
        connRef.current = conn
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Chat unavailable')
      }
    }

    start()
    return () => { conn.stop() }
  }, [requestId])

  const sendMessage = useCallback(async (body: string) => {
    if (!connRef.current || !body.trim()) return
    await connRef.current.invoke('SendMessage', requestId, body.trim())
  }, [requestId])

  return { messages, connected, error, sendMessage }
}
```

## ChatBox Component

```typescript
// components/shared/ChatBox.tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/hooks/use-chat'
import { useAuth } from '@/hooks/use-auth'

interface ChatBoxProps {
  requestId: string
  /** Display name of the other party */
  otherPartyName: string
}

export function ChatBox({ requestId, otherPartyName }: ChatBoxProps) {
  const { user } = useAuth()
  const { messages, connected, error, sendMessage } = useChat(requestId)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
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
    <div className="flex flex-col rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-stone-100 px-4 py-3">
        <div className={`h-2 w-2 rounded-full ${connected ? 'bg-teal-500' : 'bg-stone-300'}`} />
        <span className="text-sm font-semibold text-stone-700">Chat with {otherPartyName}</span>
        {!connected && <span className="text-xs text-stone-400">Connecting...</span>}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[240px] max-h-[400px]">
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

      {/* Input */}
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
```

## Implementation Steps

1. `npm install @microsoft/signalr` in frontend/
2. Create `src/types/chat.ts`
3. Create `src/lib/api/chat.ts`
4. Create `src/hooks/use-chat.ts`
5. Create `src/components/shared/ChatBox.tsx`
6. Run `npx tsc --noEmit` — fix any type errors

## Success Criteria

- TypeScript compiles clean
- `ChatBox` renders message history on mount
- New messages appear in real-time without page refresh
- Sent messages bubble right (teal), received bubble left (stone)
- Auto-scroll to newest message
