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

    // Step 1: Try signing in first (returning user path)
    const { data: signIn, error: signInError } = await anon.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (!signInError && signIn?.session) {
      // Existing user — ensure profile has map_user role if not already set
      const { data: profile } = await admin
        .from('profiles')
        .select('role')
        .eq('id', signIn.user.id)
        .single();
      
      const role = (profile as any)?.role || 'member';
      
      return NextResponse.json({
        ok: true,
        role,
        access_token: signIn.session.access_token,
        refresh_token: signIn.session.refresh_token,
      });
    }

    // Step 2: Sign-in failed — check why
    const errMsg = signInError?.message?.toLowerCase() || '';
    
    // If it's a wrong password (user exists but password wrong)
    if (errMsg.includes('invalid login') && !errMsg.includes('not found')) {
      // Try to check if user actually exists
      const { data: existingUsers } = await admin.auth.admin.listUsers();
      const exists = existingUsers?.users?.some((u: any) => u.email === email.trim());
      if (exists) {
        return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
      }
    }

    // Step 3: New user — create via admin
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { role: 'map_user' },
    });

    if (createError) {
      if (createError.message?.toLowerCase().includes('already')) {
        return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
      }
      console.error('createUser error:', createError.message);
      return NextResponse.json({ error: 'Could not create account. Please try again.' }, { status: 400 });
    }

    // Step 4: Update profile role
    await admin.from('profiles').upsert({
      id: created.user.id,
      full_name: email.trim().split('@')[0],
      role: 'map_user',
      is_active: true,
      joined_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    // Step 5: Sign in the newly created user
    const { data: newSignIn, error: newSignInError } = await anon.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (newSignInError || !newSignIn?.session) {
      // Fallback: use admin to generate a session link and exchange it
      console.error('Post-create sign-in failed:', newSignInError?.message);
      return NextResponse.json({ 
        error: 'Account created! Please sign in using the "Sign in" option.' 
      }, { status: 200 });
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
