import { createServerClient } from '@/lib/supabase-server';
import AdminUpdatesClient from '@/components/admin/AdminUpdatesClient';

export const metadata = { title: 'Updates · Admin · People Of Lisbon' };

export default async function AdminUpdatesPage() {
  const supabase = createServerClient();
  const { data: updates } = await (supabase as any)
    .from('updates')
    .select('*')
    .order('published_at', { ascending: false });

  return <AdminUpdatesClient updates={updates || []} />;
}
