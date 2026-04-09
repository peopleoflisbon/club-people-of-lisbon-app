import { createServerClient } from '@/lib/supabase-server';
import AdminEventsClient from '@/components/admin/AdminEventsClient';

export const metadata = { title: 'Events · Admin · People Of Lisbon' };

export default async function AdminEventsPage() {
  const supabase = createServerClient();

  const { data: events } = await (supabase as any)
    .from('events')
    .select('*')
    .order('starts_at', { ascending: false });

  return <AdminEventsClient events={events || []} />;
}
