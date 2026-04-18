import { createServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import RecommendationsClient from './RecommendationsClient';

export const metadata = { title: 'Recommendations · People Of Lisbon' };
export const dynamic = 'force-dynamic';

export default async function RecommendationsPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: recs } = await admin
    .from('recommendations')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return <RecommendationsClient recs={recs || []} />;
}
