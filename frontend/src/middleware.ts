import { NextRequest, NextResponse } from 'next/server'

const ROLE_ROUTES: Record<string, string> = {
  '/tenant': 'Tenant',
  '/owner': 'Owner',
  '/admin': 'SystemAdmin',
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Find matching protected route
  const protectedEntry = Object.entries(ROLE_ROUTES).find(([route]) => pathname.startsWith(route))
  if (!protectedEntry) return NextResponse.next()

  const [, requiredRole] = protectedEntry

  // Read token from cookie (set on login) or skip (client handles localStorage)
  // Since we use localStorage (client-side), middleware can only do basic checks
  // Full auth check is done client-side; middleware redirects based on cookie
  const token = req.cookies.get('hmss_token')?.value
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const role: string = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || ''
    if (payload.exp * 1000 < Date.now()) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    // Case-insensitive role comparison for .NET backend compatibility
    if (role.toLowerCase() !== requiredRole.toLowerCase()) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/tenant/:path*', '/owner/:path*', '/admin/:path*'],
}
