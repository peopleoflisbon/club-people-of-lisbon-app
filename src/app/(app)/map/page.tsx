export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase-server';
import LisbonMap from '@/components/map/LisbonMap';

export const metadata = { title: 'Map · People Of Lisbon' };

export default async function MapPage() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: pins } = await admin
    .from('map_pins')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: true });

  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  let isMapUser = false;
  if (session?.user?.id) {
    const { data: profile } = await admin.from('profiles').select('role').eq('id', session.user.id).single();
    isMapUser = (profile as any)?.role === 'map_user';
  }

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <LisbonMap pins={pins || []} isMapUser={isMapUser} />
    </div>
  );
}
