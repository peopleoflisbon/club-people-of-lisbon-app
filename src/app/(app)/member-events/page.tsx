export const dynamic = 'force-dynamic';

import { createServerClient } from '@/lib/supabase-server';
import MemberEventsClient from '@/components/member-events/MemberEventsClient';

export const metadata = { title: 'Member Events · People Of Lisbon' };

export default async function MemberEventsPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || '';

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', userId)
    .single();

  const { data: events } = await (supabase as any)
    .from('member_events')
    .select('*')
    .order('event_date', { ascending: true });

  return (
    <MemberEventsClient
      events={events || []}
      userId={userId}
      userName={profile?.full_name || ''}
      userAvatar={profile?.avatar_url || ''}
    />
  );
}
