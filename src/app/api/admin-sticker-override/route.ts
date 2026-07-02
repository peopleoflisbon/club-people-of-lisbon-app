import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function verifyAdmin(supabase: any) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
  return profile?.role === 'admin' ? session : null;
}

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// GET — full list of all stickers + existing overrides (for admin page)
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  if (!await verifyAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = admin();

  const [{ data: members }, { data: recs }, { data: custom }, { data: overrides }] = await Promise.all([
    db.from('profiles').select('id, full_name, avatar_url, job_title, headline, neighborhood')
      .eq('is_active', true).not('full_name', 'is', null).neq('full_name', '').order('full_name', { ascending: true }),
    db.from('recommendations').select('id, name, category, neighbourhood, image_url')
      .eq('is_active', true).order('name', { ascending: true }),
    db.from('custom_stickers').select('*').order('type').order('sort_order'),
    db.from('sticker_overrides').select('*'),
  ]);

  const overrideMap = new Map(
    (overrides || []).map((o: any) => [`${o.sticker_type}:${o.source_id}`, o])
  );

  const applyOverride = (type: string, source_id: string, name: string, subtitle: string) => {
    const o = overrideMap.get(`${type}:${source_id}`);
    return {
      custom_name: o?.custom_name ?? null,
      custom_subtitle: o?.custom_subtitle ?? null,
      display_name: o?.custom_name || name,
      display_subtitle: o?.custom_subtitle !== undefined && o?.custom_subtitle !== null ? o.custom_subtitle : subtitle,
    };
  };

  const memberStickers = (members || []).map((m: any, i: number) => ({
    sticker_type: 'member', source_id: m.id,
    default_name: m.full_name,
    default_subtitle: m.job_title || m.headline || '',
    image_url: m.avatar_url || null,
    number: 1 + i,
    ...applyOverride('member', m.id, m.full_name, m.job_title || m.headline || ''),
  }));

  const recStickers = (recs || []).map((r: any, i: number) => ({
    sticker_type: 'recommendation', source_id: r.id,
    default_name: r.name,
    default_subtitle: [r.category, r.neighbourhood].filter(Boolean).join(' · '),
    image_url: r.image_url || null,
    number: 251 + i,
    ...applyOverride('recommendation', r.id, r.name, [r.category, r.neighbourhood].filter(Boolean).join(' · ')),
  }));

  const customStickers = (custom || []).map((c: any, i: number) => ({
    sticker_type: c.type, source_id: c.id,
    default_name: c.name,
    default_subtitle: c.subtitle || '',
    image_url: c.image_url || null,
    number: c.type === 'landmark' ? 201 + i : 451 + i,
    ...applyOverride(c.type, c.id, c.name, c.subtitle || ''),
  }));

  return NextResponse.json({ members: memberStickers, recommendations: recStickers, custom: customStickers });
}

// PATCH — save/update a sticker text override
export async function PATCH(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  if (!await verifyAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { sticker_type, source_id, custom_name, custom_subtitle } = await req.json();
  if (!sticker_type || !source_id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const db = admin();
  const { error } = await db.from('sticker_overrides').upsert({
    sticker_type, source_id, custom_name, custom_subtitle,
  }, { onConflict: 'sticker_type,source_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
