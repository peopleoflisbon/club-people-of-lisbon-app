import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email?.trim() || !password) {
    return NextResponse.json({ error: 'Email and password required.' }, { status: 400 });
  }

  // Admin client — bypasses RLS and email confirmation
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Cookie-aware client for setting the session on the browser
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );

  // ── Step 1: Try signing in (existing user) ──
  const res = NextResponse.next();
  const supabaseWithCookies = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: signInData, error: signInError } = await supabaseWithCookies.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (!signInError && signInData?.session) {
    // Signed in — check role
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', signInData.user.id)
      .single();

    const role = (profile as any)?.role || 'map_user';
    const response = NextResponse.json({ ok: true, role });
    // Copy cookies from supabaseWithCookies response
    res.cookies.getAll().forEach(cookie => {
      response.cookies.set(cookie);
    });
    return response;
  }

  // ── Step 2: Wrong password for existing user ──
  if (signInError?.message?.toLowerCase().includes('invalid login')) {
    return NextResponse.json({ error: 'Incorrect password. Try again.' }, { status: 401 });
  }

  // ── Step 3: Create new account via admin (no email confirmation needed) ──
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true, // skip confirmation email
  });

  if (createError) {
    if (createError.message?.includes('already been registered') || createError.message?.includes('already exists')) {
      return NextResponse.json({ error: 'Incorrect password. Try again.' }, { status: 401 });
    }
    if (createError.message?.includes('rate') || createError.message?.includes('security')) {
      return NextResponse.json({ error: 'Please wait a moment and try again.' }, { status: 429 });
    }
    return NextResponse.json({ error: createError.message || 'Could not create account.' }, { status: 400 });
  }

  // ── Step 4: Create profile with map_user role ──
  await admin.from('profiles').upsert({
    id: newUser.user.id,
    full_name: email.split('@')[0],
    role: 'map_user',
    is_active: true,
    joined_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  // ── Step 5: Sign them in now ──
  const signInRes = NextResponse.json({ ok: true, role: 'map_user' });
  const { data: finalSignIn, error: finalError } = await supabaseWithCookies.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (finalError || !finalSignIn?.session) {
    return NextResponse.json({ error: 'Account created — please try signing in again.' }, { status: 200 });
  }

  // Copy session cookies to response
  res.cookies.getAll().forEach(cookie => {
    signInRes.cookies.set(cookie);
  });

  return signInRes;
}
