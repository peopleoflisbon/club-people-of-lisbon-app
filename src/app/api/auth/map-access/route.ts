import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: 'Email and password required.' }, { status: 400 });
    }

    // Admin client — bypasses RLS, creates confirmed users
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Regular client — for signing in (sets session cookie)
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // ── Try sign in first (returning user) ──
    const { data: signInData, error: signInError } = await anon.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (!signInError && signInData?.session) {
      // Get their role
      const { data: profile } = await admin
        .from('profiles')
        .select('role')
        .eq('id', signInData.user.id)
        .single();

      const role = (profile as any)?.role || 'map_user';

      // Return session tokens for client to set
      return NextResponse.json({
        ok: true,
        role,
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
      });
    }

    // Wrong password for existing user
    if (signInError?.message?.toLowerCase().includes('invalid login')) {
      return NextResponse.json({ error: 'Incorrect password. Try again.' }, { status: 401 });
    }

    // ── New user — create with admin (no email confirmation) ──
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
    });

    if (createError) {
      if (createError.message?.includes('already')) {
        return NextResponse.json({ error: 'Incorrect password. Try again.' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Could not create account. Please try again.' }, { status: 400 });
    }

    // Create their profile
    await admin.from('profiles').upsert({
      id: newUser.user.id,
      full_name: email.trim().split('@')[0],
      role: 'map_user',
      is_active: true,
      joined_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    // Sign them in
    const { data: newSession, error: newSignInError } = await anon.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (newSignInError || !newSession?.session) {
      return NextResponse.json({ error: 'Account created — please try again.' }, { status: 200 });
    }

    return NextResponse.json({
      ok: true,
      role: 'map_user',
      access_token: newSession.session.access_token,
      refresh_token: newSession.session.refresh_token,
    });

  } catch (err: any) {
    console.error('map-access error:', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
