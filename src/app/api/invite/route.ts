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

async function generateInviteLink(email: string): Promise<{ link?: string; error?: string }> {
  const admin = adminClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`;

  // Check if user already exists
  const { data: { users } } = await admin.auth.admin.listUsers();
  const existing = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

  if (!existing) {
    // Create user as FULLY CONFIRMED with a random temp password
    // email_confirm: true means they are active immediately — no pending state
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password: crypto.randomUUID() + 'Aa1!', // strong random password they'll replace
      email_confirm: true, // CRITICAL: makes user fully active, not pending
    });

    if (createError) {
      return { error: createError.message };
    }
  }

  // Generate a recovery link — works for fully confirmed users, lets them set password
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo },
  });

  if (error) return { error: error.message };

  const link = (data as any)?.properties?.action_link;
  if (!link) return { error: 'Could not generate link' };

  return { link };
}

// Generate invite link (POST)
export async function POST(request: Request) {
  try {
    if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const result = await generateInviteLink(email.trim().toLowerCase());
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true, link: result.link });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Regenerate invite link (PUT)
export async function PUT(request: Request) {
  try {
    if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const result = await generateInviteLink(email.trim().toLowerCase());
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true, link: result.link });
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
    const { error } = await adminClient().auth.admin.deleteUser(userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
