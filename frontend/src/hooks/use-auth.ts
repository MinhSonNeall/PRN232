'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AuthUser, SignInResponseDto } from '@/types/auth'

const TOKEN_KEY = 'hmss_token'
const USER_KEY = 'hmss_user'
const AUTH_CHANGE_EVENT = 'hmss-auth-change'

function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

/** Read current auth state from localStorage */
function readAuthUser(): AuthUser | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const userStr = localStorage.getItem(USER_KEY)
    if (token && userStr && isTokenValid(token)) {
      return JSON.parse(userStr)
    }
  } catch { /* ignore */ }
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  return null
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setUser(readAuthUser())
    setIsLoading(false)

    // Sync across components when login/logout happens
    const onAuthChange = () => setUser(readAuthUser())
    window.addEventListener(AUTH_CHANGE_EVENT, onAuthChange)
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, onAuthChange)
  }, [])

  const login = useCallback((data: SignInResponseDto) => {
    const authUser: AuthUser = {
      userId: data.userId,
      fullName: data.fullName,
      email: '',
      role: data.role as AuthUser['role'],
      token: data.token,
    }
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(authUser))
    setUser(authUser)
    // Notify other useAuth instances (e.g. Navbar)
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    document.cookie = 'hmss_token=; path=/; max-age=0'
    setUser(null)
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
    window.location.href = '/login'
  }, [])

  return { user, login, logout, isAuthenticated: !!user, isLoading }
}
