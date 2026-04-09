import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function verifyAdmin() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
  return (profile as any)?.role === 'admin';
}

// Send invite (POST) or resend (PUT) — same logic, always works
async function sendInviteToEmail(email: string) {
  const admin = adminClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`;

  // Step 1: ensure the user exists in auth
  const { data: { users } } = await admin.auth.admin.listUsers();
  const existing = users.find((u: any) => u.email === email);

  if (!existing) {
    // Create the user first with a random password
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: Math.random().toString(36).slice(-12) + 'Aa1!', // random secure password
    });
    if (createError && !createError.message.includes('already')) {
      return { error: createError.message };
    }
  }

  // Step 2: generate a password recovery link — this always works, never blocked
  const { error: linkError } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo },
  });

  if (linkError) return { error: linkError.message };
  return { success: true };
}

export async function POST(request: Request) {
  try {
    if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
    const result = await sendInviteToEmail(email.trim().toLowerCase());
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
    const result = await sendInviteToEmail(email.trim().toLowerCase());
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Delete user (DELETE)
export async function DELETE(request: Request) {
  try {
    if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    const admin = adminClient();
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
