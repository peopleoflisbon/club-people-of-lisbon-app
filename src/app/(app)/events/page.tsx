import { createServerClient } from '@/lib/supabase-server';
import EventsClient from '@/components/events/EventsClient';

export const metadata = { title: 'Events · People Of Lisbon' };

export default async function EventsPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || '';

  // BUG FIX: removed !inner join and embedded count — both caused bugs.
  // !inner filtered out all events the user hadn't RSVP'd to.
  // event_rsvps(count) returned [{count:N}] not N, so length was always 1.
  const [{ data: events }, { data: rsvpCounts }, { data: userRsvps }] = await Promise.all([
    supabase.from('events').select('*').neq('status', 'cancelled').order('starts_at', { ascending: true }),
    supabase.from('event_rsvps').select('event_id').eq('status', 'attending'),
    supabase.from('event_rsvps').select('event_id, status').eq('user_id', userId),
  ]);

  const countMap = new Map<string, number>();
  (rsvpCounts || []).forEach((r) => {
    countMap.set(r.event_id, (countMap.get(r.event_id) || 0) + 1);
  });

  const rsvpMap = new Map((userRsvps || []).map((r) => [r.event_id, r.status]));

  const enriched = (events || []).map((e) => ({
    ...e,
    user_rsvp: rsvpMap.get(e.id) || null,
    rsvp_count: countMap.get(e.id) || 0,
  }));

  return <EventsClient events={enriched} userId={userId} />;
}
