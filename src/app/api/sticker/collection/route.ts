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

    const [{ data: allStickers }, { data: collected }, { data: packetRow }] = await Promise.all([
      admin.from('custom_stickers').select('*').eq('type', 'rita').eq('is_active', true).order('sort_order', { ascending: true }),
      admin.from('user_sticker_collection').select('*').eq('user_id', userId).order('collected_at', { ascending: true }),
      admin.from('user_sticker_packets').select('last_opened_date').eq('user_id', userId).maybeSingle(),
    ]);

    const collectedMap = new Map((collected || []).map((c: any) => [c.source_id, c]));

    const stickers = (allStickers || []).map((s: any) => {
      const col = collectedMap.get(s.id);
      return {
        type: 'rita', source_id: s.id, name: s.name, subtitle: s.subtitle || '',
        description: s.description || '', youtube_url: s.youtube_url || null,
        image_url: s.image_url || null,
        number: s.sort_order, collected: !!col, collected_at: col?.collected_at || null,
      };
    });

    return NextResponse.json({
      stickers,
      totalCollected: (collected || []).length,
      totalPossible: (allStickers || []).length,
      packetAvailable: !packetRow || packetRow.last_opened_date !== todayLisbon,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
