import { createServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import BrandLogo from '@/components/ui/BrandLogo';

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', emoji: '▦' },
  { href: '/admin/members', label: 'Members & Invites', emoji: '👥' },
  { href: '/admin/events', label: 'Events', emoji: '📅' },
  { href: '/admin/photos', label: "Rita's Photos", emoji: '📷' },
  { href: '/admin/pins', label: 'Map Pins', emoji: '📍' },
  { href: '/admin/sponsors', label: 'Sponsors', emoji: '⭐' },
  { href: '/admin/updates', label: 'Updates from Stephen', emoji: '✍️' },
  { href: '/admin/good-news', label: 'Good News', emoji: '🎉' },
  { href: '/admin/settings', label: 'Settings', emoji: '⚙️' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', session.user.id).single(),
    supabase.from('app_settings').select('key, value').eq('key', 'brand_square_image_url').single(),
  ]);

  if (profile?.role !== 'admin') redirect('/home');

  const brandLogoUrl = (settings as any)?.value || '/pol-logo.png';

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-ink border-b border-stone-800 px-4 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <BrandLogo src={brandLogoUrl} size={32} className="shadow-md shadow-brand/30" />
          <div>
            <p className="text-white font-display text-sm">People Of Lisbon</p>
            <p className="text-stone-500 text-xs">Admin Panel</p>
          </div>
        </div>
        <Link href="/home" className="text-stone-400 hover:text-white text-xs font-medium transition-colors">
          ← Back to App
        </Link>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-56 min-h-screen bg-white border-r border-stone-200 p-3 space-y-0.5 hidden md:block flex-shrink-0 sticky top-[53px] self-start h-[calc(100vh-53px)] overflow-y-auto">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:text-ink hover:bg-stone-100 transition-all"
            >
              <span className="text-base leading-none w-5 flex-shrink-0">{item.emoji}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile nav strip */}
        <div className="md:hidden w-full px-4 pt-3 pb-1 flex gap-2 overflow-x-auto no-scrollbar border-b border-stone-100 bg-white sticky top-[53px] z-10">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 bg-white border border-stone-200 hover:border-brand hover:text-brand transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <main className="flex-1 p-4 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
