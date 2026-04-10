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
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 py-2 bg-white border-b border-stone-100 flex-shrink-0">
        <p className="text-stone-500 text-sm font-medium">🗺️ Have fun exploring People Of Lisbon locations</p>
      </div>
      <LisbonMap pins={pins || []} />
    </div>
  );
}
