import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/member-login',
  '/auth/invite',
  '/auth/callback',
  '/auth/confirm',
  '/auth/set-password',
  '/api/auth/map-access',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();
  const path = req.nextUrl.pathname;

  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));

  // Not logged in → gateway
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Logged in + root → home
  if (session && path === '/') {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-).*)'],
};
