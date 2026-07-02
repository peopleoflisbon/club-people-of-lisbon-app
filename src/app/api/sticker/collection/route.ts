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

    const [{ data: members }, { data: recs }, { data: customStickers }, { data: collected }, { data: packetRow }, { data: overrides }] = await Promise.all([
      admin.from('profiles').select('id, full_name, avatar_url, job_title, headline, neighborhood')
        .eq('is_active', true).not('full_name', 'is', null).neq('full_name', '').order('joined_at', { ascending: true }),
      admin.from('recommendations').select('id, name, category, neighbourhood, image_url')
        .eq('is_active', true).order('created_at', { ascending: true }),
      admin.from('custom_stickers').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      admin.from('user_sticker_collection').select('*').eq('user_id', userId).order('collected_at', { ascending: true }),
      admin.from('user_sticker_packets').select('last_opened_date').eq('user_id', userId).maybeSingle(),
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

    const collectedMap = new Map(
      (collected || []).map((c: any) => [`${c.sticker_type}:${c.source_id}`, c])
    );

    const landmarks = (customStickers || []).filter((s: any) => s.type === 'landmark');
    const ritaSeries = (customStickers || []).filter((s: any) => s.type === 'rita');

    const allMembers = (members || []).map((m: any, i: number) => {
      const def = applyOverride(memberToSticker(m, i));
      const col = collectedMap.get(`member:${m.id}`);
      return { ...def, collected: !!col, collected_at: col?.collected_at || null };
    });

    const allLandmarks = landmarks.map((lm: any, i: number) => {
      const def = applyOverride(customToSticker(lm, 201, i));
      const col = collectedMap.get(`landmark:${lm.id}`);
      return { ...def, collected: !!col, collected_at: col?.collected_at || null };
    });

    const allRecs = (recs || []).map((r: any, i: number) => {
      const def = applyOverride(recToSticker(r, i));
      const col = collectedMap.get(`recommendation:${r.id}`);
      return { ...def, collected: !!col, collected_at: col?.collected_at || null };
    });

    const allRita = ritaSeries.map((r: any, i: number) => {
      const def = applyOverride(customToSticker(r, 451, i));
      const col = collectedMap.get(`rita:${r.id}`);
      return { ...def, collected: !!col, collected_at: col?.collected_at || null };
    });

    const totalCollected = (collected || []).length;
    const totalPossible = allMembers.length + allLandmarks.length + allRecs.length + allRita.length;
    const packetAvailable = !packetRow || packetRow.last_opened_date !== todayLisbon;

    return NextResponse.json({
      members: allMembers,
      landmarks: allLandmarks,
      recommendations: allRecs,
      rita: allRita,
      totalCollected,
      totalPossible,
      packetAvailable,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
