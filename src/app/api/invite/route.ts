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

// Generate a sign-up link — returns the link to the admin to send manually
export async function POST(request: Request) {
  try {
    if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const admin = adminClient();
    const cleanEmail = email.trim().toLowerCase();
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`;

    // Ensure user exists
    const { data: { users } } = await admin.auth.admin.listUsers();
    const existing = users.find((u: any) => u.email === cleanEmail);

    if (!existing) {
      const { error: createError } = await admin.auth.admin.createUser({
        email: cleanEmail,
        email_confirm: true,
        password: Math.random().toString(36).slice(-12) + 'Aa1!',
      });
      if (createError && !createError.message.includes('already')) {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }
      // Wait for user to be fully created before generating link
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Generate the link — this is what we give to the admin to send manually
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: cleanEmail,
      options: { redirectTo },
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const link = (data as any)?.properties?.action_link;
    if (!link) return NextResponse.json({ error: 'Could not generate link' }, { status: 500 });

    return NextResponse.json({ success: true, link });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Delete user
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
