import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const supabase = createRouteClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.redirect(new URL('/auth/login', req.url));

  const formData = await req.formData();
  const eventId = formData.get('event_id') as string;
  const currentStatus = formData.get('current_status') as string;

  if (currentStatus === 'attending') {
    // Cancel RSVP
    await (supabase as any)
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', session.user.id);
  } else {
    // Create or update RSVP
    await (supabase as any)
      .from('event_rsvps')
      .upsert({
        event_id: eventId,
        user_id: session.user.id,
        status: 'attending',
      }, { onConflict: 'event_id,user_id' });
  }

  // Redirect back to the event page
  return NextResponse.redirect(new URL(`/events/${eventId}`, req.url));
}
