import { createClient } from '@supabase/supabase-js';
import AdminMembersClient from '@/components/admin/AdminMembersClient';

export const metadata = { title: 'Members · Admin · People Of Lisbon' };

export default async function AdminMembersPage() {
  // Use service role to bypass RLS — admin needs to see all members including inactive
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const [{ data: members }, { data: invitations }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, headline, neighborhood, role, is_active, joined_at, avatar_url, open_to_feature')
      .neq('role', 'map_user')   // never show public map users in members list
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
