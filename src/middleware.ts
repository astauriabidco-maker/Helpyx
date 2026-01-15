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

  // Vérifier l'environnement
  const isDevelopment = process.env.NODE_ENV === "development";
  const isPreview = process.env.VERCEL_ENV === "preview";
  
  try {
    // Obtenir le token NextAuth
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    console.log("🔐 MIDDLEWARE DEBUG: token exists:", !!token);
    console.log("🔐 MIDDLEWARE DEBUG: user role:", token?.role);
    console.log("🔐 MIDDLEWARE DEBUG: environment:", { isDevelopment, isPreview });

    // En mode preview, permettre l'accès sans auth
    if (isPreview) {
      console.log("🚀 PREVIEW MODE: Skipping auth check");
      return NextResponse.next();
    }

    // Routes protégées
    const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
    
    if (!token && isProtectedRoute) {
      console.log("❌ MIDDLEWARE: No token, redirecting to signin");
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Redirections basées sur le rôle
    if (pathname === '/dashboard' && token?.role) {
      console.log("🔐 MIDDLEWARE: Redirecting based on role:", token.role);
      
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
    console.error("❌ MIDDLEWARE ERROR:", error);
    
    // En cas d'erreur, rediriger vers la page de connexion
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return NextResponse.next();
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
};