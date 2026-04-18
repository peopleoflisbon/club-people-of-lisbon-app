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

    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Step 1: Try to CREATE the account first (works for new users)
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { role: 'map_user' },
    });

    if (!createError && created?.user) {
      // New user created — make their profile
      await admin.from('profiles').upsert({
        id: created.user.id,
        full_name: email.trim().split('@')[0],
        role: 'map_user',
        is_active: true,
        joined_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }
    // If createError — user already exists, that's fine, continue to sign in

    // Step 2: Sign in (works for both new and existing users)
    const { data: session, error: signInError } = await anon.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError || !session?.session) {
      // Only way sign-in fails now is genuinely wrong password
      return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
    }

    // Make sure metadata has role
    await admin.auth.admin.updateUserById(session.user.id, {
      user_metadata: { role: 'map_user' },
    });

    return NextResponse.json({
      ok: true,
      role: 'map_user',
      access_token: session.session.access_token,
      refresh_token: session.session.refresh_token,
    });

  } catch (err: any) {
    console.error('map-access error:', err?.message);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
