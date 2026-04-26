export const dynamic = 'force-dynamic';
import { createServerClient } from '@/lib/supabase-server';
import AdminMemberEventsClient from './AdminMemberEventsClient';

export const metadata = { title: 'Member Events · Admin · People Of Lisbon' };

export default async function AdminMemberEventsPage() {
  const supabase = createServerClient();
  const { data: events } = await (supabase as any)
    .from('member_events')
    .select('*')
    .order('event_date', { ascending: true });

  return <AdminMemberEventsClient events={events || []} />;
}
