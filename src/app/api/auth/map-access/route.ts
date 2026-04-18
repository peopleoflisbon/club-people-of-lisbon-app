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

    // Try sign in first (returning user)
    const { data: signIn, error: signInError } = await anon.auth.signInWithPassword({
      email: email.trim(), password,
    });

    if (!signInError && signIn?.session) {
      // Make sure their metadata has role=map_user
      await admin.auth.admin.updateUserById(signIn.user.id, {
        user_metadata: { role: 'map_user' }
      });
      // Refresh session to get updated metadata
      const { data: refreshed } = await admin.auth.admin.getUserById(signIn.user.id);
      return NextResponse.json({
        ok: true,
        role: 'map_user',
        access_token: signIn.session.access_token,
        refresh_token: signIn.session.refresh_token,
      });
    }

    // Wrong password for existing user
    if (signInError?.message?.toLowerCase().includes('invalid login')) {
      return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
    }

    // New user — create with role in metadata
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { role: 'map_user' }, // role stored IN the token
    });

    if (createError) {
      if (createError.message?.includes('already')) {
        return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Could not create account. Please try again.' }, { status: 400 });
    }

    // Create profile too (belt and braces)
    await admin.from('profiles').upsert({
      id: created.user.id,
      full_name: email.trim().split('@')[0],
      role: 'map_user',
      is_active: true,
      joined_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    // Sign them in
    const { data: newSession, error: newSignInError } = await anon.auth.signInWithPassword({
      email: email.trim(), password,
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
    console.error('map-access error:', err?.message);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
