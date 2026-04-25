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
  '/auth/join',
  '/api/auth/map-access',
  '/map',
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
    // Read role from user metadata — no DB query needed, always reliable
    const role = session.user.user_metadata?.role;

    if (role === 'map_user') {
      // map_user can ONLY access /map — everything else → redirect to /map
      if (!path.startsWith('/map') && !path.startsWith('/api/') && !isPublic) {
        return NextResponse.redirect(new URL('/map', req.url));
      }
    } else {
      // Regular member at root → home
      if (path === '/') {
        return NextResponse.redirect(new URL('/home', req.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-).*)'],
};
