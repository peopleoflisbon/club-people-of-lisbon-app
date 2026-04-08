import { createServerClient } from '@/lib/supabase-server';
import AdminSponsorsClient from '@/components/admin/AdminSponsorsClient';

export const metadata = { title: 'Sponsors · Admin · People Of Lisbon' };

export default async function AdminSponsorsPage() {
  const supabase = createServerClient();
  const { data: sponsors } = await supabase
    .from('sponsors')
    .select('*')
    .order('display_order', { ascending: true });

  return <AdminSponsorsClient sponsors={sponsors || []} />;
}
