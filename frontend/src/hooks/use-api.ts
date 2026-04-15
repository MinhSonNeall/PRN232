'use client'

import { useState, useCallback } from 'react'
import { ApiError } from '@/lib/api/api-client'

interface UseApiState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({ data: null, isLoading: false, error: null })

  const execute = useCallback(async (fn: () => Promise<T>) => {
    setState({ data: null, isLoading: true, error: null })
    try {
      const data = await fn()
      setState({ data, isLoading: false, error: null })
      return data
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'An unexpected error occurred'
      setState({ data: null, isLoading: false, error: message })
      return null
    }
  }, [])

  return { ...state, execute }
}
