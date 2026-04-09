import { createServerClient } from '@/lib/supabase-server';
import MembersClient from '@/components/members/MembersClient';

export const metadata = { title: 'Members · People Of Lisbon' };

export default async function MembersPage() {
  const supabase = createServerClient();

  const { data: members } = await (supabase as any)
    .from('profiles')
    .select('id, full_name, headline, neighborhood, avatar_url, short_bio, joined_at')
    .eq('is_active', true)
    .order('joined_at', { ascending: false });

  return <MembersClient initialMembers={members || []} />;
}
