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

    // Today's date in Lisbon timezone
    const todayLisbon = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Lisbon' });

    // Check if already opened today
    const { data: packetRow } = await admin
      .from('user_sticker_packets')
      .select('last_opened_date, last_sticker_type, last_sticker_source_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (packetRow?.last_opened_date === todayLisbon) {
      // Already opened — return what they got today
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

    // Build the full pool of possible stickers
    const [{ data: members }, { data: recs }, { data: collected }] = await Promise.all([
      admin.from('profiles')
        .select('id, full_name, avatar_url, job_title, headline, neighborhood')
        .eq('is_active', true)
        .not('full_name', 'is', null).neq('full_name', '')
        .order('joined_at', { ascending: true }),
      admin.from('recommendations')
        .select('id, name, category, neighbourhood, image_url')
        .eq('is_active', true)
        .order('created_at', { ascending: true }),
      admin.from('user_sticker_collection')
        .select('sticker_type, source_id')
        .eq('user_id', userId),
    ]);

    const collectedSet = new Set(
      (collected || []).map((c: any) => `${c.sticker_type}:${c.source_id}`)
    );

    // Build full pool and filter out already collected
    const pool: any[] = [];

    (members || []).forEach((m: any, i: number) => {
      const s = memberToSticker(m, i);
      if (!collectedSet.has(`member:${m.id}`)) pool.push(s);
    });

    LANDMARKS.forEach((lm, i) => {
      const s = landmarkToSticker(lm, i);
      if (!collectedSet.has(`landmark:${lm.id}`)) pool.push(s);
    });

    (recs || []).forEach((r: any, i: number) => {
      const s = recToSticker(r, i);
      if (!collectedSet.has(`recommendation:${r.id}`)) pool.push(s);
    });

    if (pool.length === 0) {
      return NextResponse.json({ complete: true, message: 'Collection complete! You have every sticker.' });
    }

    // Pick a random uncollected sticker
    const pick = pool[Math.floor(Math.random() * pool.length)];

    // Save to collection
    await admin.from('user_sticker_collection').insert({
      user_id: userId,
      sticker_type: pick.type,
      source_id: pick.source_id,
      sticker_number: pick.number,
      name: pick.name,
      subtitle: pick.subtitle,
      image_url: pick.image_url,
    });

    // Update packet record
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
