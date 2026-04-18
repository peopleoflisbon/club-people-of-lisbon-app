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
    .select('id, full_name, avatar_url, job_title, neighborhood, joined_at, nationality, membership_number')
    .eq('id', session.user.id)
    .single();

  const { data: offers } = await (supabase as any)
    .from('membership_offers')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  let memberNumber: string;
  if (profile?.membership_number) {
    memberNumber = String(profile.membership_number).padStart(4, '0');
  } else {
    const derived = parseInt(profile?.id?.replace(/-/g, '').slice(0, 6) || '0', 16) % 9000 + 1000;
    memberNumber = String(derived);
  }

  const fullNumber = `2020 ${memberNumber.match(/.{1,4}/g)?.join(' ') || memberNumber}`;
  const joinYear = profile?.joined_at ? new Date(profile.joined_at).getFullYear() : 2020;

  return (
    <MembershipCardClient
      profile={profile}
      memberNumber={fullNumber}
      joinYear={joinYear}
      offers={offers || []}
    />
  );
}
