import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // If this is an invite or recovery, send to password setup
  if (type === 'invite' || type === 'recovery') {
    return NextResponse.redirect(new URL('/auth/set-password', request.url));
  }

  return NextResponse.redirect(new URL('/home', request.url));
}
