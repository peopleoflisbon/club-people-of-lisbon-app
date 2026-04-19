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

    const { data: signIn, error: signInError } = await anon.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (!signInError && signIn?.session) {
      const { data: profile } = await admin
        .from('profiles').select('role').eq('id', signIn.user.id).single();
      const role = (profile as any)?.role || 'member';
      return NextResponse.json({
        ok: true, role,
        access_token: signIn.session.access_token,
        refresh_token: signIn.session.refresh_token,
      });
    }

    const { data: signUp, error: signUpError } = await anon.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { role: 'map_user' } },
    });

    if (signUpError) {
      if (signUpError.message?.toLowerCase().includes('already')) {
        return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
      }
      return NextResponse.json({ error: signUpError.message || 'Could not create account.' }, { status: 400 });
    }

    if (!signUp?.session) {
      return NextResponse.json({ error: 'Please check your email to confirm your account.' }, { status: 200 });
    }

    await admin.from('profiles').update({ role: 'map_user' }).eq('id', signUp.user!.id);

    return NextResponse.json({
      ok: true,
      role: 'map_user',
      access_token: signUp.session.access_token,
      refresh_token: signUp.session.refresh_token,
    });

  } catch (err: any) {
    console.error('map-access error:', err?.message);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
