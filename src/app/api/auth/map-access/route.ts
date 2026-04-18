import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRouteClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const supabase = createRouteClient();

  // First try to sign in — user may already exist
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (!signInError && signInData.session) {
    // Existing user — check role
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', signInData.user.id)
      .single();

    const role = (profile as any)?.role || 'map_user';
    return NextResponse.json({ ok: true, role });
  }

  // Sign-in failed — try to create new account
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: undefined }
  });

  if (signUpError || !signUpData.user) {
    // Wrong password for existing user
    if (signInError?.message?.includes('Invalid login')) {
      return NextResponse.json({ error: 'Incorrect password. Try again.' }, { status: 401 });
    }
    return NextResponse.json({ error: signUpError?.message || 'Could not create account' }, { status: 400 });
  }

  // Create profile with map_user role
  await admin.from('profiles').upsert({
    id: signUpData.user.id,
    full_name: email.split('@')[0],
    role: 'map_user',
    is_active: true,
    joined_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  // Now sign them in properly
  const { error: finalSignInError } = await supabase.auth.signInWithPassword({ email, password });
  if (finalSignInError) {
    return NextResponse.json({ error: 'Account created — please sign in.' }, { status: 200 });
  }

  return NextResponse.json({ ok: true, role: 'map_user' });
}
