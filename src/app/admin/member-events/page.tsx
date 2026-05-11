export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import AdminMemberEventsClient from './AdminMemberEventsClient';

export const metadata = { title: 'Member Events · Admin · People Of Lisbon' };

export default async function AdminMemberEventsPage() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: events } = await admin
    .from('member_events')
    .select('*')
    .order('event_date', { ascending: true });

  return <AdminMemberEventsClient events={events || []} />;
}
