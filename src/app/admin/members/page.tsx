import { createServerClient } from '@/lib/supabase-server';
import AdminMembersClient from '@/components/admin/AdminMembersClient';

export const metadata = { title: 'Members · Admin · People Of Lisbon' };

export default async function AdminMembersPage() {
  const supabase = createServerClient();

  const [{ data: members }, { data: invitations }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, headline, neighborhood, role, is_active, joined_at, avatar_url')
      .order('joined_at', { ascending: false }),
    supabase
      .from('invitations')
      .select('*')
      .order('created_at', { ascending: false }),
  ]);

  return (
    <AdminMembersClient
      members={members || []}
      invitations={invitations || []}
    />
  );
}
