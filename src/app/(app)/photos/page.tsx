export const dynamic = 'force-dynamic';

import { createServerClient } from '@/lib/supabase-server';
import RitaPhotosClient from '@/components/photos/RitaPhotosClient';

export const metadata = { title: "Rita's Photos · People Of Lisbon" };

export default async function RitaPhotosPage() {
  const supabase = createServerClient();

  const { data: photos } = await (supabase as any)
    .from('rita_photos')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  return <RitaPhotosClient photos={photos || []} />;
}
