import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Protected routes - hanya untuk user yang sudah login
  const protectedRoutes = ['/dashboard'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Auth routes - hanya untuk user yang belum login
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.includes(pathname);

  // Redirect logic
  if (isProtectedRoute && !user) {
    // User belum login tapi coba akses protected route -> redirect ke login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    // User sudah login tapi coba akses auth route -> redirect ke dashboard
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Public routes atau sudah sesuai aturan -> allow access
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
};
