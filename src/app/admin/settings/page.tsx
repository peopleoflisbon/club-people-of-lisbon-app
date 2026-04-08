import { createServerClient } from '@/lib/supabase';
import AdminSettingsClient from '@/components/admin/AdminSettingsClient';

export const metadata = { title: 'Settings · Admin · People Of Lisbon' };

export default async function AdminSettingsPage() {
  const supabase = createServerClient();
  const { data: settings } = await supabase
    .from('app_settings')
    .select('key, value');

  const settingsMap: Record<string, string> = {};
  (settings || []).forEach((s: { key: string; value: string }) => {
    settingsMap[s.key] = s.value;
  });

  return <AdminSettingsClient settings={settingsMap} />;
}
