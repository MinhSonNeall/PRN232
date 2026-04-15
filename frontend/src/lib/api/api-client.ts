const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5236'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// Check JWT token expiry and redirect to login if expired
function checkTokenExpiry(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp * 1000 < Date.now()) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hmss_token')
        localStorage.removeItem('hmss_user')
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      }
      return false
    }
    return true
  } catch {
    return false
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('hmss_token') : null

  if (token && !checkTokenExpiry(token)) {
    throw new ApiError(401, 'Token expired')
  }

  const headers: Record<string, string> = {}

  // Only set Content-Type for non-FormData bodies
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new ApiError(res.status, errorText || `HTTP ${res.status}`)
  }

  // Handle empty responses (204 No Content)
  const contentType = res.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T
  }

  return res.json() as Promise<T>
}
