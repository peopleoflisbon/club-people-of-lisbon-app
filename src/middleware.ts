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

// Routes map_users are allowed to access
const MAP_USER_ALLOWED = ['/map', '/api/'];

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

  // Logged in at root → check role
  if (session && (path === '/' || path === '/home' || path === '/members')) {
    // Fetch profile role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const role = (profile as any)?.role;

    if (role === 'map_user') {
      // map_users always go to map
      if (path !== '/map') {
        return NextResponse.redirect(new URL('/map', req.url));
      }
    } else {
      // Members go to home
      if (path === '/') {
        return NextResponse.redirect(new URL('/home', req.url));
      }
    }
  }

  // map_users trying to access member-only pages → redirect to map
  if (session && !isPublic) {
    const memberOnlyPaths = ['/home', '/messages', '/events', '/members', '/profile',
      '/photos', '/updates', '/board', '/leaderboard', '/membership-card',
      '/sponsors', '/good-news', '/break-tiles', '/tram-game', '/tile-leaderboard',
      '/recommendations', '/admin'];

    const isMemberOnly = memberOnlyPaths.some(p => path.startsWith(p));

    if (isMemberOnly) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if ((profile as any)?.role === 'map_user') {
        return NextResponse.redirect(new URL('/map', req.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-).*)'],
};
