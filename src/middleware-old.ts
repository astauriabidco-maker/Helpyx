import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files, API routes, and auth routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Get user from localStorage (this won't work in middleware, but we can check cookies)
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value
  const userRole = request.cookies.get('userRole')?.value

  // Redirect unauthenticated users trying to access protected routes
  if (!isAuthenticated && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Handle dashboard redirects based on role
  if (pathname === '/dashboard' && isAuthenticated && userRole) {
    switch (userRole) {
      case 'ADMIN':
        return NextResponse.redirect(new URL('/admin', request.url))
      case 'AGENT':
        return NextResponse.redirect(new URL('/dashboard/agent', request.url))
      case 'CLIENT':
        return NextResponse.redirect(new URL('/dashboard/client', request.url))
      default:
        return NextResponse.redirect(new URL('/dashboard/client', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}