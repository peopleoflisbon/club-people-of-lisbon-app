import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await admin
      .from('tile_scores')
      .select('user_id, score, profiles(full_name, avatar_url)')
      .order('score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Leaderboard error:', error);
      return NextResponse.json({ entries: [] });
    }

    const entries = (data || []).map((row: any) => ({
      user_id: row.user_id,
      score: row.score,
      profile: row.profiles,
    }));

    return NextResponse.json({ entries });
  } catch (err: any) {
    return NextResponse.json({ entries: [] });
  }
}
