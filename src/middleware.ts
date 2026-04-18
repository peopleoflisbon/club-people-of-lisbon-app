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

  if (session) {
    // Fetch role from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const role = (profile as any)?.role;

    // map_user trying to access anything other than /map → redirect to /map
    if (role === 'map_user' && !path.startsWith('/map') && !isPublic && !path.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/map', req.url));
    }

    // Logged in member at root → home
    if (path === '/' && role !== 'map_user') {
      return NextResponse.redirect(new URL('/home', req.url));
    }

    // map_user at root → map
    if (path === '/' && role === 'map_user') {
      return NextResponse.redirect(new URL('/map', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-).*)'],
};
