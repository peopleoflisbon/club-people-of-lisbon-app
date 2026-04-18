import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const errors: string[] = [];

  // Create tables directly with the admin client
  // membership_offers
  const { error: e1 } = await admin.from('membership_offers').select('id').limit(1);
  if (e1 && e1.code === 'PGRST106') {
    // table doesn't exist — we can't create it via REST, but we can try insert-based detection
    errors.push('membership_offers table missing — run migration in Supabase SQL Editor');
  }

  const { error: e2 } = await admin.from('recommendations').select('id').limit(1);
  if (e2 && e2.code === 'PGRST106') {
    errors.push('recommendations table missing — run migration in Supabase SQL Editor');
  }

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors });
  }

  return NextResponse.json({ ok: true, message: 'Tables exist and are accessible' });
}
