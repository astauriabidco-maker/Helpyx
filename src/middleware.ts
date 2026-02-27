import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and auth routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isPreview = process.env.VERCEL_ENV === "preview";

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    // En mode preview, permettre l'accès sans auth
    if (isPreview) {
      return NextResponse.next();
    }

    // Routes protégées
    const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

    if (!token && isProtectedRoute) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Redirections basées sur le rôle
    if (pathname === '/dashboard' && token?.role) {
      switch (token.role) {
        case 'ADMIN':
          return NextResponse.redirect(new URL('/admin', request.url));
        case 'AGENT':
          return NextResponse.redirect(new URL('/dashboard/agent', request.url));
        case 'CLIENT':
          return NextResponse.redirect(new URL('/dashboard/client', request.url));
        default:
          return NextResponse.redirect(new URL('/dashboard/client', request.url));
      }
    }

  } catch (error) {
    // En cas d'erreur, rediriger vers la page de connexion pour les routes protégées
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};