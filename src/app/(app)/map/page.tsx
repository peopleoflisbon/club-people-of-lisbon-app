export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase-server';
import LisbonMap from '@/components/map/LisbonMap';

export const metadata = { title: 'Map · People Of Lisbon' };

export default async function MapPage() {
  // Use service role to bypass RLS — pins are visible to all authenticated users
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

  // Check if current user is a map_user (to conditionally show Join the Club)
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isMapUser = session?.user?.user_metadata?.role === 'map_user';

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <LisbonMap pins={pins || []} isMapUser={isMapUser} />
    </div>
  );
}
