import { NextResponse, type NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

/**
 * Routes that require an authenticated Supabase session.
 * Any path equal to or nested under these will redirect to /login when
 * no session cookie is present.
 *
 * NOTE: /campaigns/[id] is intentionally NOT protected — guests can browse
 * campaign detail pages, but the Apply button itself gates the action.
 */
const PROTECTED_ROUTES = ['/studio', '/creator', '/admin'];

/**
 * Next.js 16 root proxy (formerly `middleware`).
 *
 * 1. Refreshes the Supabase auth session cookie via `updateSession`.
 * 2. Redirects unauthenticated users away from PROTECTED_ROUTES.
 *
 * If Supabase env vars are not configured, the auth check is skipped so
 * the demo keeps working without a backend.
 */
export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  const hasSupabaseEnv =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!hasSupabaseEnv) return response;

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );
  if (!isProtected) return response;

  // @supabase/ssr writes cookies named `sb-<project-ref>-auth-token` (and
  // chunked `…auth-token.0`, `…auth-token.1`). Presence of any signals
  // an active session.
  const hasSession = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes('auth-token'));
  if (hasSession) return response;

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones that should never trigger
     * auth refresh:
     * - _next/static  (static files)
     * - _next/image   (image optimization)
     * - favicon.ico
     * - public assets (svg/png/jpg/jpeg/gif/webp/ico/woff2)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
