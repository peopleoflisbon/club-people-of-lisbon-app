import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function verifyAdmin() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
  if ((profile as any)?.role !== 'admin') return null;
  return session;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const session = await verifyAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminClient = await getAdminClient();
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`;

    // Try inviteUserByEmail — works for new users
    const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      // No expiresIn set = uses Supabase default (longest available)
    });

    if (inviteError) {
      // User already exists in auth — generate a recovery/magic link so they can set password
      const { error: linkError } = await adminClient.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo },
      });

      if (linkError) {
        return NextResponse.json({ error: linkError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Resend invite — called from admin panel
export async function PUT(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const session = await verifyAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminClient = await getAdminClient();
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`;

    // For resend, always use recovery link — works whether or not they have a password
    const { error } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    });

    if (error) {
      // If user doesn't exist yet, send a fresh invite
      const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
        redirectTo,
      });
      if (inviteError) return NextResponse.json({ error: inviteError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
