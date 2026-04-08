import { createServerClient } from '@/lib/supabase';
import AdminPhotosClient from '@/components/admin/AdminPhotosClient';

export const metadata = { title: "Rita's Photos · Admin · People Of Lisbon" };

export default async function AdminPhotosPage() {
  const supabase = createServerClient();
  const { data: photos } = await supabase
    .from('rita_photos')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  return <AdminPhotosClient photos={photos || []} />;
}
