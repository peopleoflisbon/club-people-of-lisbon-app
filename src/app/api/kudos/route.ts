import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { recipientId } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (recipientId === session.user.id) return NextResponse.json({ error: 'Cannot give yourself kudos' }, { status: 400 });

  const { error } = await (supabase as any).from('kudos').insert({
    recipient_id: recipientId,
    giver_id: session.user.id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { count } = await (supabase as any).from('kudos').select('*', { count: 'exact', head: true }).eq('recipient_id', recipientId);
  return NextResponse.json({ success: true, total: count });
}
