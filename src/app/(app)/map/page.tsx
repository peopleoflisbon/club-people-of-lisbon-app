export const dynamic = 'force-dynamic';

import { createServerClient } from '@/lib/supabase-server';
import LisbonMap from '@/components/map/LisbonMap';

export const metadata = { title: 'Map · People Of Lisbon' };

export default async function MapPage() {
  const supabase = createServerClient();

  const { data: pins } = await (supabase as any)
    .from('map_pins')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: true });

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <LisbonMap pins={pins || []} />
    </div>
  );
}
