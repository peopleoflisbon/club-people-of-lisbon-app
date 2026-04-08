import { createServerClient } from '@/lib/supabase';
import Link from 'next/link';

export const metadata = { title: 'Admin · People Of Lisbon' };

async function count(supabase: ReturnType<typeof createServerClient>, table: string, filter?: { col: string; val: string }) {
  let q = supabase.from(table).select('*', { count: 'exact', head: true });
  if (filter) q = (q as any).eq(filter.col, filter.val);
  const { count: c } = await q;
  return c || 0;
}

export default async function AdminDashboard() {
  const supabase = createServerClient();

  const [members, pendingInvites, upcomingEvents, mapPins, photos, goodNews] = await Promise.all([
    count(supabase, 'profiles', { col: 'is_active', val: 'true' }),
    count(supabase, 'invitations', { col: 'status', val: 'pending' }),
    count(supabase, 'events', { col: 'status', val: 'upcoming' }),
    count(supabase, 'map_pins', { col: 'is_published', val: 'true' }),
    count(supabase, 'rita_photos', { col: 'is_published', val: 'true' }),
    count(supabase, 'good_news_posts', { col: 'is_published', val: 'true' }),
  ]);

  const stats = [
    { label: 'Members', value: members, href: '/admin/members', dot: '#F4141E' },
    { label: 'Pending Invites', value: pendingInvites, href: '/admin/members', dot: '#f59e0b' },
    { label: 'Events', value: upcomingEvents, href: '/admin/events', dot: '#10b981' },
    { label: 'Map Pins', value: mapPins, href: '/admin/pins', dot: '#3b82f6' },
    { label: "Photos", value: photos, href: '/admin/photos', dot: '#8b5cf6' },
    { label: 'Good News', value: goodNews, href: '/admin/good-news', dot: '#f43f5e' },
  ];

  const quickLinks = [
    { href: '/admin/members', label: 'Invite a Member', desc: 'Send invitation link', emoji: '✉️' },
    { href: '/admin/events', label: 'Create Event', desc: 'Add a gathering', emoji: '📅' },
    { href: '/admin/updates', label: 'Post Update', desc: 'Write from Stephen', emoji: '✍️' },
    { href: '/admin/photos', label: 'Add Photo', desc: "Add to Rita's gallery", emoji: '📷' },
    { href: '/admin/pins', label: 'Add Map Pin', desc: 'New video location', emoji: '📍' },
    { href: '/admin/good-news', label: 'Moderate Posts', desc: 'Review Good News', emoji: '🎉' },
    { href: '/admin/sponsors', label: 'Add Sponsor', desc: 'New partner', emoji: '⭐' },
    { href: '/admin/settings', label: 'Login Background', desc: 'Change sign-in image', emoji: '🖼️' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">Welcome to the People Of Lisbon admin panel.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-10">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="pol-card p-4 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="w-2 h-2 rounded-full mb-3" style={{ background: s.dot }} />
            <p className="font-display text-3xl text-ink">{s.value}</p>
            <p className="text-stone-500 text-xs mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="font-semibold text-stone-500 text-xs uppercase tracking-wider mb-3">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="pol-card p-4 flex items-center gap-3 hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="w-9 h-9 rounded-xl bg-stone-50 flex items-center justify-center flex-shrink-0 text-lg">
              {link.emoji}
            </div>
            <div>
              <p className="font-semibold text-sm text-ink">{link.label}</p>
              <p className="text-xs text-stone-400">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
