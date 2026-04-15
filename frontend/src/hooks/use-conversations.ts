'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import type { ConversationListItemDto } from '@/types/chat'
import { chatApi } from '@/lib/api/chat'

const HUB_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5236') + '/hub/chat'

/**
 * Fetches and exposes the current user's conversation list.
 * Automatically refreshes when a ConversationListUpdated event is received via SignalR.
 */
export function useConversations() {
  const [conversations, setConversations] = useState<ConversationListItemDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const connRef = useRef<signalR.HubConnection | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await chatApi.getConversations()
      setConversations(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load conversations')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => { load() }, [load])

  // SignalR: listen for ConversationListUpdated to auto-refresh
  useEffect(() => {
    const token = localStorage.getItem('hmss_token')
    if (!token) return

    let stopped = false

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.None)
      .build()

    // Re-fetch conversation list when notified
    conn.on('ConversationListUpdated', () => {
      if (!stopped) load()
    })

    conn.start()
      .then(() => {
        if (!stopped) connRef.current = conn
      })
      .catch((e) => {
        if (stopped) return
        const msg = e instanceof Error ? e.message : ''
        if (msg.includes('stopped during negotiation')) return
      })

    return () => {
      stopped = true
      connRef.current = null
      conn.stop().catch(() => {})
    }
  }, [load])

  return { conversations, isLoading, error, refresh: load }
}
