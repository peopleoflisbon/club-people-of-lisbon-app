import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/invite',
  '/auth/callback',
  '/auth/confirm',
  '/auth/set-password',
  '/join',
  '/explore',
  '/auth/join',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Always redirect root to home
  if (session && (pathname === '/' || pathname === '')) {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-|pol-logo.png|apple-touch-icon|favicon-).*)'],
};
