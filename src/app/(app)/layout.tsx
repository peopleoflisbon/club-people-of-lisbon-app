import { createServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import AppShell from '@/components/layout/AppShell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  const pathname = (headersList.get('x-pathname') || headersList.get('x-invoke-path') || '');
  const isMapRoute = pathname === '/map' || pathname.startsWith('/map');

  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Allow unauthenticated visitors on the public map
  if (!session) {
    if (isMapRoute) {
      return (
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      );
    }
    redirect('/auth/login');
  }

  // Read role from profiles table — most reliable source
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: profileRaw } = await admin
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  const profile = profileRaw as any;

  // map_user — full screen, no shell
  if (profile?.role === 'map_user') {
    return (
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    );
  }

  // Full member — needs active account
  if (!profile?.is_active) redirect('/auth/login');

  const { data: settings } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['brand_square_image_url', 'login_background_image_url']);

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
