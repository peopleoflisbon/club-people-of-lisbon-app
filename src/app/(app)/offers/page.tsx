import { createServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import OffersClient from './OffersClient';

export const metadata = { title: 'Member Offers · People Of Lisbon' };
export const dynamic = 'force-dynamic';

export default async function OffersPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', session.user.id)
    .single();

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Approved partner offers
  const { data: offers } = await admin
    .from('membership_offers')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  // Approved member-submitted offers
  const { data: memberOffers } = await admin
    .from('member_offers')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  return (
    <OffersClient
      offers={offers || []}
      memberOffers={memberOffers || []}
      userId={session.user.id}
      userName={profile?.full_name || ''}
    />
  );
}
