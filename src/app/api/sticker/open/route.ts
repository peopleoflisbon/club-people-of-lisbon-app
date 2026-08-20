import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
        .eq('sticker_type', 'rita')
        .eq('source_id', packetRow.last_sticker_source_id)
        .single();
      return NextResponse.json({
        alreadyOpened: true,
        todaySticker: todaySticker ? {
          type: 'rita', source_id: todaySticker.source_id,
          name: todaySticker.name, subtitle: todaySticker.subtitle,
          description: todaySticker.description, image_url: todaySticker.image_url,
          number: todaySticker.sticker_number, collected_at: todaySticker.collected_at,
        } : null,
      });
    }

    const [{ data: allStickers }, { data: collected }] = await Promise.all([
      admin.from('custom_stickers').select('*').eq('type', 'rita').eq('is_active', true).order('sort_order', { ascending: true }),
      admin.from('user_sticker_collection').select('source_id').eq('user_id', userId),
    ]);

    const collectedIds = new Set((collected || []).map((c: any) => c.source_id));
    const pool = (allStickers || []).filter((s: any) => !collectedIds.has(s.id));

    if (pool.length === 0) return NextResponse.json({ complete: true });

    const pick = pool[Math.floor(Math.random() * pool.length)];

    const { error: insertError } = await admin.from('user_sticker_collection').insert({
      user_id: userId, sticker_type: 'rita', source_id: pick.id,
      sticker_number: pick.sort_order, name: pick.name,
      subtitle: pick.subtitle || '', description: pick.description || '',
      image_url: pick.image_url || null,
    });

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

    await admin.from('user_sticker_packets').upsert({
      user_id: userId, last_opened_date: todayLisbon,
      last_sticker_type: 'rita', last_sticker_source_id: pick.id,
    }, { onConflict: 'user_id' });

    return NextResponse.json({
      alreadyOpened: false,
      sticker: { type: 'rita', source_id: pick.id, name: pick.name, subtitle: pick.subtitle || '', description: pick.description || '', youtube_url: pick.youtube_url || null, image_url: pick.image_url || null, number: pick.sort_order },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
