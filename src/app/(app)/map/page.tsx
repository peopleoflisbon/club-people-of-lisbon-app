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

  const [{ data: rawPins }, { data: categories }, { data: pinCategories }] = await Promise.all([
    admin.from('map_pins').select('*').eq('is_published', true).order('created_at', { ascending: true }),
    admin.from('categories').select('*').eq('is_active', true).order('sort_order'),
    admin.from('map_pin_categories').select('pin_id, category_id'),
  ]);

  // Merge category_ids into each pin
  const pins = (rawPins || []).map((pin: any) => ({
    ...pin,
    filmed_address: pin.filmed_address || '',
    google_maps_url: pin.google_maps_url || '',
    category_ids: (pinCategories || [])
      .filter((pc: any) => pc.pin_id === pin.id)
      .map((pc: any) => pc.category_id),
  }));

  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  let isMapUser = true; // default: no session = guest = map-only view
  if (session?.user?.id) {
    const { data: profile } = await admin
      .from('profiles').select('role').eq('id', session.user.id).single();
    const role = (profile as any)?.role;
    isMapUser = role !== 'member' && role !== 'admin';
  }

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <LisbonMap pins={pins} isMapUser={isMapUser} categories={categories || []} />
    </div>
  );
}
