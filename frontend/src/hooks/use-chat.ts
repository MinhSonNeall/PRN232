'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import * as signalR from '@microsoft/signalr'
import type { ChatMessageDto } from '@/types/chat'
import { chatApi } from '@/lib/api/chat'

const HUB_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5236') + '/hub/chat'

interface UseChatParams {
  /** Legacy request-scoped mode */
  requestId?: string
  /** Conversation-based mode */
  conversationId?: string
}

/**
 * Unified chat hook supporting both request-scoped and conversation-based messaging.
 * Pass either requestId or conversationId (not both).
 */
export function useChat({ requestId, conversationId }: UseChatParams) {
  const [messages, setMessages] = useState<ChatMessageDto[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const connRef = useRef<signalR.HubConnection | null>(null)

  const mode = conversationId ? 'conversation' : 'request'
  const groupKey = conversationId ?? requestId ?? ''

  useEffect(() => {
    if (!groupKey) return

    const token = localStorage.getItem('hmss_token')
    if (!token) {
      setError('Please log in to use chat')
      return
    }

    let stopped = false

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.None)
      .build()

    conn.on('ReceiveMessage', (msg: ChatMessageDto) => {
      if (!stopped) setMessages(prev => [...prev, msg])
    })

    conn.onreconnected(() => {
      if (stopped) return
      const rejoin = mode === 'conversation'
        ? conn.invoke('JoinConversation', groupKey)
        : conn.invoke('JoinChat', groupKey)
      rejoin.catch(() => {})
      setConnected(true)
    })
    conn.onreconnecting(() => { if (!stopped) setConnected(false) })

    const start = async () => {
      try {
        await conn.start()
        if (stopped) return

        if (mode === 'conversation') {
          await conn.invoke('JoinConversation', groupKey)
        } else {
          await conn.invoke('JoinChat', groupKey)
        }
        if (stopped) return

        const history = mode === 'conversation'
          ? await chatApi.getConversationHistory(groupKey)
          : await chatApi.getHistory(groupKey)
        if (stopped) return

        setMessages(history)
        setConnected(true)
        connRef.current = conn
      } catch (e) {
        // Ignore errors from React Strict Mode double-mount teardown
        if (stopped) return
        const msg = e instanceof Error ? e.message : ''
        // "stopped during negotiation" = cleanup ran mid-connect; will retry on remount
        if (msg.includes('stopped during negotiation')) return
        setError(msg || 'Chat unavailable')
      }
    }

    start()
    return () => {
      stopped = true
      connRef.current = null
      conn.stop().catch(() => {})
    }
  }, [groupKey, mode])

  const sendMessage = useCallback(async (body: string) => {
    const trimmed = body.trim()
    if (!connRef.current || !trimmed || trimmed.length > 2000) return

    try {
      if (mode === 'conversation') {
        await connRef.current.invoke('SendConversationMessage', groupKey, trimmed)
      } else {
        await connRef.current.invoke('SendMessage', groupKey, trimmed)
      }
    } catch (e) {
      console.error('Failed to send message:', e)
      setError('Failed to send message. Please try again.')
    }
  }, [groupKey, mode])

  return { messages, connected, error, sendMessage }
}
