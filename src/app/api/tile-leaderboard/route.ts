import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const { data } = await (supabase as any)
    .from('tile_scores')
    .select('user_id, score, profiles(full_name, avatar_url)')
    .order('score', { ascending: false })
    .limit(10);

  const entries = (data || []).map((row: any) => ({
    user_id: row.user_id,
    score: row.score,
    profile: row.profiles,
  }));

  return NextResponse.json({ entries });
}
