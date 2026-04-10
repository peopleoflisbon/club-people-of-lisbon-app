import { createServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import MembershipCardClient from './MembershipCardClient';

export const metadata = { title: 'Membership Card · People Of Lisbon' };

export default async function MembershipCardPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id, full_name, avatar_url, job_title, neighborhood, joined_at, nationality')
    .eq('id', session.user.id)
    .single();

  // Generate a unique member number from the UUID
  const memberNumber = profile?.id
    ? parseInt(profile.id.replace(/-/g, '').slice(0, 8), 16).toString().slice(0, 8).padStart(8, '0')
    : '00000000';

  const formattedNumber = memberNumber.match(/.{1,4}/g)?.join(' ') || memberNumber;
  const joinYear = profile?.joined_at ? new Date(profile.joined_at).getFullYear() : new Date().getFullYear();

  return (
    <MembershipCardClient
      profile={profile}
      memberNumber={formattedNumber}
      joinYear={joinYear}
    />
  );
}
