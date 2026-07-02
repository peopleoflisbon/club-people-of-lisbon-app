import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { customToSticker, memberToSticker, recToSticker } from '@/lib/stickers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const todayLisbon = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Lisbon' });

    const { data: packetRow } = await admin
      .from('user_sticker_packets')
      .select('last_opened_date, last_sticker_type, last_sticker_source_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (packetRow?.last_opened_date === todayLisbon) {
      const { data: todaySticker } = await admin
        .from('user_sticker_collection')
        .select('*')
        .eq('user_id', userId)
        .eq('sticker_type', packetRow.last_sticker_type)
        .eq('source_id', packetRow.last_sticker_source_id)
        .single();
      return NextResponse.json({
        alreadyOpened: true,
        todaySticker: todaySticker ? {
          type: todaySticker.sticker_type,
          source_id: todaySticker.source_id,
          name: todaySticker.name,
          subtitle: todaySticker.subtitle,
          image_url: todaySticker.image_url,
          number: todaySticker.sticker_number,
          collected_at: todaySticker.collected_at,
        } : null,
      });
    }

    const [{ data: members }, { data: recs }, { data: customStickers }, { data: collected }, { data: overrides }] = await Promise.all([
      admin.from('profiles')
        .select('id, full_name, avatar_url, job_title, headline, neighborhood')
        .eq('is_active', true).not('full_name', 'is', null).neq('full_name', '')
        .order('joined_at', { ascending: true }),
      admin.from('recommendations')
        .select('id, name, category, neighbourhood, image_url')
        .eq('is_active', true).order('created_at', { ascending: true }),
      admin.from('custom_stickers')
        .select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      admin.from('user_sticker_collection')
        .select('sticker_type, source_id').eq('user_id', userId),
      admin.from('sticker_overrides').select('*'),
    ]);

    const overrideMap = new Map(
      (overrides || []).map((o: any) => [`${o.sticker_type}:${o.source_id}`, o])
    );
    function applyOverride(s: any): any {
      const o = overrideMap.get(`${s.type}:${s.source_id}`);
      if (!o) return s;
      return {
        ...s,
        name: o.custom_name ?? s.name,
        subtitle: (o.custom_subtitle !== null && o.custom_subtitle !== undefined) ? o.custom_subtitle : s.subtitle,
        description: (o.custom_description !== null && o.custom_description !== undefined) ? o.custom_description : s.description,
      };
    }

    const collectedSet = new Set(
      (collected || []).map((c: any) => `${c.sticker_type}:${c.source_id}`)
    );

    const landmarks = (customStickers || []).filter((s: any) => s.type === 'landmark');
    const ritaSeries = (customStickers || []).filter((s: any) => s.type === 'rita');

    const pool: any[] = [];
    (members || []).forEach((m: any, i: number) => {
      if (!collectedSet.has(`member:${m.id}`)) pool.push(applyOverride(memberToSticker(m, i)));
    });
    landmarks.forEach((lm: any, i: number) => {
      if (!collectedSet.has(`landmark:${lm.id}`)) pool.push(applyOverride(customToSticker(lm, 201, i)));
    });
    (recs || []).forEach((r: any, i: number) => {
      if (!collectedSet.has(`recommendation:${r.id}`)) pool.push(applyOverride(recToSticker(r, i)));
    });
    ritaSeries.forEach((r: any, i: number) => {
      if (!collectedSet.has(`rita:${r.id}`)) pool.push(applyOverride(customToSticker(r, 451, i)));
    });

    if (pool.length === 0) {
      return NextResponse.json({ complete: true });
    }

    const pick = pool[Math.floor(Math.random() * pool.length)];

    await admin.from('user_sticker_collection').insert({
      user_id: userId,
      sticker_type: pick.type,
      source_id: pick.source_id,
      sticker_number: pick.number,
      name: pick.name,
      subtitle: pick.subtitle,
      description: pick.description || '',
      image_url: pick.image_url,
    });

    await admin.from('user_sticker_packets').upsert({
      user_id: userId,
      last_opened_date: todayLisbon,
      last_sticker_type: pick.type,
      last_sticker_source_id: pick.source_id,
    }, { onConflict: 'user_id' });

    return NextResponse.json({ alreadyOpened: false, sticker: pick });

  } catch (err: any) {
    console.error('Sticker open error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
