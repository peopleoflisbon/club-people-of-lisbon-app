import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') || '/home';

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Invite or password reset → set password first
  if (type === 'invite' || type === 'recovery') {
    return NextResponse.redirect(new URL('/auth/set-password', request.url));
  }

  // For magic links with hash tokens, redirect to a client page that handles them
  return NextResponse.redirect(new URL('/auth/confirm', request.url));
}
