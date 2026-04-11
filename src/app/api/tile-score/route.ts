import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { tiles } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Upsert — add tiles to existing score
  const { data: existing } = await (supabase as any)
    .from('tile_scores')
    .select('score')
    .eq('user_id', session.user.id)
    .single();

  const newScore = (existing?.score || 0) + tiles;

  await (supabase as any)
    .from('tile_scores')
    .upsert({ user_id: session.user.id, score: newScore }, { onConflict: 'user_id' });

  return NextResponse.json({ score: newScore });
}

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ score: 0 });

  const { data } = await (supabase as any)
    .from('tile_scores')
    .select('score')
    .eq('user_id', session.user.id)
    .single();

  return NextResponse.json({ score: data?.score || 0 });
}
