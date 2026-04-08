import { createServerClient } from '@/lib/supabase';
import LisbonMap from '@/components/map/LisbonMap';

export const metadata = { title: 'Map · People Of Lisbon' };

export default async function MapPage() {
  const supabase = createServerClient();

  const { data: pins } = await supabase
    .from('map_pins')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: true });

  return (
    // flex-1 fills the content area; map itself fills the rest
    <div className="flex-1 flex flex-col min-h-0">
      <LisbonMap pins={pins || []} />
    </div>
  );
}
