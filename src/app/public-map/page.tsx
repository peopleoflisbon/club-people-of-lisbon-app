export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import LisbonMap from '@/components/map/LisbonMap';

export default async function PublicMapPage() {
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
  const pins = (rawPins || []).map((pin: any) => ({
    ...pin,
    filmed_address: pin.filmed_address || '',
    google_maps_url: pin.google_maps_url || '',
    category_ids: (pinCategories || [])
      .filter((pc: any) => pc.pin_id === pin.id)
      .map((pc: any) => pc.category_id),
  }));
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <LisbonMap pins={pins} isMapUser={true} categories={categories || []} showExploreText={true} />
    </div>
  );
}
