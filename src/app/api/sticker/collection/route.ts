import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LANDMARKS, landmarkToSticker, memberToSticker, recToSticker } from '@/lib/stickers';

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

    const [{ data: members }, { data: recs }, { data: collected }, { data: packetRow }] = await Promise.all([
      admin.from('profiles').select('id, full_name, avatar_url, job_title, headline, neighborhood')
        .eq('is_active', true).not('full_name', 'is', null).neq('full_name', '').order('joined_at', { ascending: true }),
      admin.from('recommendations').select('id, name, category, neighbourhood, image_url')
        .eq('is_active', true).order('created_at', { ascending: true }),
      admin.from('user_sticker_collection').select('*').eq('user_id', userId).order('collected_at', { ascending: true }),
      admin.from('user_sticker_packets').select('last_opened_date').eq('user_id', userId).maybeSingle(),
    ]);

    const collectedMap = new Map(
      (collected || []).map((c: any) => [`${c.sticker_type}:${c.source_id}`, c])
    );

    // Build complete album
    const allMembers = (members || []).map((m: any, i: number) => {
      const def = memberToSticker(m, i);
      const col = collectedMap.get(`member:${m.id}`);
      return { ...def, collected: !!col, collected_at: col?.collected_at || null };
    });

    const allLandmarks = LANDMARKS.map((lm, i) => {
      const def = landmarkToSticker(lm, i);
      const col = collectedMap.get(`landmark:${lm.id}`);
      return { ...def, collected: !!col, collected_at: col?.collected_at || null };
    });

    const allRecs = (recs || []).map((r: any, i: number) => {
      const def = recToSticker(r, i);
      const col = collectedMap.get(`recommendation:${r.id}`);
      return { ...def, collected: !!col, collected_at: col?.collected_at || null };
    });

    const totalCollected = (collected || []).length;
    const totalPossible = allMembers.length + allLandmarks.length + allRecs.length;
    const packetAvailable = !packetRow || packetRow.last_opened_date !== todayLisbon;

    return NextResponse.json({
      members: allMembers,
      landmarks: allLandmarks,
      recommendations: allRecs,
      totalCollected,
      totalPossible,
      packetAvailable,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
