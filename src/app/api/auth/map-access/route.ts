import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: 'Please enter your email and a password.' }, { status: 400 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // ── Step 1: Try to create the user (new users) ──
    // If they already exist this will fail, and we fall through to sign-in
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true, // no confirmation email needed
    });

    if (!createError && created?.user) {
      // New user created — make their profile
      await admin.from('profiles').insert({
        id: created.user.id,
        full_name: email.trim().split('@')[0],
        role: 'map_user',
        is_active: true,
        joined_at: new Date().toISOString(),
      });
    }

    // ── Step 2: Sign in (works for both new and existing users) ──
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: session, error: signInError } = await anon.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError || !session?.session) {
      return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
    }

    // Get their role
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const role = (profile as any)?.role || 'map_user';

    return NextResponse.json({
      ok: true,
      role,
      access_token: session.session.access_token,
      refresh_token: session.session.refresh_token,
    });

  } catch (err: any) {
    console.error('map-access error:', err?.message);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
