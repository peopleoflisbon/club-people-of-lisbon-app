import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', emoji: '⊞' },
  { href: '/admin/members', label: 'Members & Invites', emoji: '👥' },
  { href: '/admin/events', label: 'Events', emoji: '📅' },
  { href: '/admin/photos', label: "Rita's Photos", emoji: '📷' },
  { href: '/admin/pins', label: 'Map Pins', emoji: '📍' },
  { href: '/admin/categories', label: 'Categories', emoji: '🏷️' },
  { href: '/admin/sponsors', label: 'Sponsors', emoji: '⭐' },
  { href: '/admin/newsletter', label: 'Newsletter Generator', emoji: '📰' },
  { href: '/admin/updates', label: 'Updates from Stephen', emoji: '✍️' },
  { href: '/admin/good-news', label: 'Good News', emoji: '🎉' },
  { href: '/admin/board', label: 'Message Board', emoji: '📋' },
  { href: '/admin/member-events', label: 'Member Events', emoji: '🎉' },
  { href: '/admin/recommendations', label: 'Recommendations', emoji: '💡' },
  { href: '/admin/offers', label: 'Offers', emoji: '🎁' },
  { href: '/admin/settings', label: 'Settings', emoji: '⚙️' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: profile } = await admin.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
  if ((profile as any)?.role !== 'admin') redirect('/home');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F1EA' }}>
      <aside style={{ width: 240, flexShrink: 0, background: 'white', borderRight: '1px solid #EDE7DC', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '24px 20px 16px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A89A8C', margin: '0 0 16px' }}>Admin</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {ADMIN_NAV.map(item => (
              <Link key={item.href} href={item.href}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#1C1C1C', textDecoration: 'none' }}
                className="hover:bg-stone-100">
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
