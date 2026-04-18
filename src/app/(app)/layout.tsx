import { createServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/auth/login');

  const [{ data: profileRaw }, { data: settings }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', session.user.id).single(),
    supabase.from('app_settings').select('key, value').in('key', [
      'brand_square_image_url',
      'login_background_image_url',
    ]),
  ]);

  const profile = profileRaw as any;

  // map_users don't need is_active check — they're public users
  if (!profile?.is_active && profile?.role !== 'map_user') redirect('/auth/login');

  const settingsMap: Record<string, string> = {};
  (settings || []).forEach((s: { key: string; value: string }) => {
    settingsMap[s.key] = s.value;
  });

  const brandLogoUrl = settingsMap['brand_square_image_url'] || '/pol-logo.png';

  return (
    <AppShell profile={profile} brandLogoUrl={brandLogoUrl}>
      {children}
    </AppShell>
  );
}
