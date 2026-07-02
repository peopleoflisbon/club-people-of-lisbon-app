import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function verifyAdmin(supabase: any) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
  if (profile?.role !== 'admin') return null;
  return session;
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET — list all custom stickers
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  if (!await verifyAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const admin = adminClient();
  const { data, error } = await admin.from('custom_stickers').select('*').order('type').order('sort_order');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ stickers: data });
}

// POST — create a new sticker
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  if (!await verifyAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const admin = adminClient();
  const { data, error } = await admin.from('custom_stickers').insert({
    type: body.type,
    name: body.name,
    subtitle: body.subtitle || '',
    description: body.description || '',
    image_url: body.image_url || null,
    is_active: body.is_active ?? true,
    sort_order: body.sort_order ?? 0,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ sticker: data });
}

// PATCH — update a sticker
export async function PATCH(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  if (!await verifyAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const admin = adminClient();
  const { data, error } = await admin.from('custom_stickers').update(updates).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ sticker: data });
}

// DELETE — remove a sticker
export async function DELETE(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  if (!await verifyAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const admin = adminClient();
  const { error } = await admin.from('custom_stickers').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
