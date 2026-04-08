import { createServerClient } from '@/lib/supabase-server';
import AdminPinsClient from '@/components/admin/AdminPinsClient';

export const metadata = { title: 'Map Pins · Admin · People Of Lisbon' };

export default async function AdminPinsPage() {
  const supabase = createServerClient();
  const { data: pins } = await supabase
    .from('map_pins')
    .select('*')
    .order('created_at', { ascending: false });

  return <AdminPinsClient pins={pins || []} />;
}
