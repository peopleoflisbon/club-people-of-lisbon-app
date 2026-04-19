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

    // Step 1: Try sign in first (returning user)
    const { data: signIn, error: signInError } = await anon.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (!signInError && signIn?.session) {
      const { data: profile } = await admin
        .from('profiles').select('role').eq('id', signIn.user.id).single();
      const role = (profile as any)?.role || 'map_user';
      return NextResponse.json({
        ok: true, role,
        access_token: signIn.session.access_token,
        refresh_token: signIn.session.refresh_token,
      });
    }

    // Wrong password for existing user
    if (signInError?.message?.toLowerCase().includes('invalid login')) {
      // Check if user actually exists
      const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
      const exists = users?.some((u: any) => u.email?.toLowerCase() === email.trim().toLowerCase());
      if (exists) {
        return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
      }
    }

    // Step 2: New user — create account
    // Trigger will auto-create profile with map_user role from metadata
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { role: 'map_user' },
    });

    if (createError) {
      console.error('createUser error:', createError.message);
      return NextResponse.json({ error: 'Could not create account. Please try again.' }, { status: 400 });
    }

    // Step 3: Sign in the new user
    const { data: newSignIn, error: newSignInError } = await anon.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (newSignInError || !newSignIn?.session) {
      console.error('post-create signin error:', newSignInError?.message);
      return NextResponse.json({ error: 'Account created. Please use "Sign in" to continue.' }, { status: 200 });
    }

    return NextResponse.json({
      ok: true,
      role: 'map_user',
      access_token: newSignIn.session.access_token,
      refresh_token: newSignIn.session.refresh_token,
    });

  } catch (err: any) {
    console.error('map-access error:', err?.message);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
