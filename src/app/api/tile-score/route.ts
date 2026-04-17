import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tiles } = await request.json();
    if (!tiles || tiles < 1) return NextResponse.json({ score: 0 });

    const admin = adminClient();

    // Get existing score
    const { data: existing } = await admin
      .from('tile_scores')
      .select('score')
      .eq('user_id', session.user.id)
      .single();

    const newScore = (existing?.score || 0) + tiles;

    // Upsert using admin client to avoid RLS issues
    const { error } = await admin
      .from('tile_scores')
      .upsert({ user_id: session.user.id, score: newScore, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

    if (error) {
      console.error('Tile score upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ score: newScore });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ score: 0 });

    const admin = adminClient();
    const { data } = await admin
      .from('tile_scores')
      .select('score')
      .eq('user_id', session.user.id)
      .single();

    return NextResponse.json({ score: data?.score || 0 });
  } catch {
    return NextResponse.json({ score: 0 });
  }
}
