'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Avatar from '@/components/ui/Avatar';
import BrandLogo from '@/components/ui/BrandLogo';
import { cn } from '@/lib/utils';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  neighborhood: string;
  role: string;
}

// Main mobile bottom nav — Home, Messages, Events, Members, Map
const NAV_ITEMS = [
  {
    href: '/home', label: 'Home', mobileLabel: 'Home',
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: '/messages', label: 'Messages', mobileLabel: 'Chat',
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    href: '/events', label: 'Events', mobileLabel: 'Events',
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    href: '/members', label: 'Members', mobileLabel: 'Members',
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    href: '/map', label: 'Map', mobileLabel: 'Map',
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
];

// Desktop sidebar secondary nav — ordered as requested
const SECONDARY_NAV = [
  { href: '/updates', label: 'Latest from Stephen' },
  { href: '/board', label: 'Message Board' },
  { href: '/membership-card', label: 'Membership Card' },
  { href: '/sponsors', label: 'Sponsors' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/photos', label: "Rita's Photos" },
  { href: '/break-tiles', label: 'Break The Tiles' },
];

interface AppShellProps {
  children: React.ReactNode;
  profile: Profile;
  brandLogoUrl?: string;
}

export default function AppShell({ children, profile, brandLogoUrl }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [hasUnread, setHasUnread] = useState(false);

  // Clear unread when visiting messages, set when new messages arrive
  useEffect(() => {
    if (pathname.startsWith('/messages')) {
      localStorage.setItem('pol_messages_last_read', new Date().toISOString());
      setHasUnread(false);
      return;
    }

    async function checkUnread() {
      const lastRead = localStorage.getItem('pol_messages_last_read') || '1970-01-01';
      // Get conversations user is part of
      const { data: convs } = await (supabase as any)
        .from('conversations')
        .select('id')
        .or(`participant_a.eq.${profile.id},participant_b.eq.${profile.id}`);

      if (!convs?.length) return;
      const convIds = convs.map((c: any) => c.id);

      // Check for messages from others after last read
      const { data: newMsgs } = await (supabase as any)
        .from('messages')
        .select('id')
        .in('conversation_id', convIds)
        .neq('sender_id', profile.id)
        .gt('created_at', lastRead)
        .limit(1);

      setHasUnread(!!(newMsgs?.length));
    }

    checkUnread();

    const channel = supabase
      .channel('unread-check')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        if (!pathname.startsWith('/messages')) checkUnread();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [pathname, profile.id]); // eslint-disable-line

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex overflow-hidden" style={{ height: '100dvh', background: '#F5F1EA' }}>

      {/* ── Desktop Sidebar — LP editorial warm ── */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 h-full flex-shrink-0 overflow-hidden"
        style={{ background: '#FFFFFF', borderRight: '1px solid #E0D9CE' }}>
        <div className="flex flex-col h-full">

          {/* Logo */}
          <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid #EDE7DC' }}>
            <Link href="/home" className="flex items-center gap-3">
              <BrandLogo src={brandLogoUrl} size={40} />
              <div>
                <p className="font-display text-2xl leading-none" style={{ color: '#1C1C1C', letterSpacing: '0.03em' }}>People Of Lisbon</p>
                <p className="text-xs mt-1 leading-snug" style={{ color: '#A89A8C', fontWeight: 500 }}>Lisbon's most interesting people</p>
              </div>
            </Link>
          </div>

          {/* Primary nav */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className={cn('flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-all duration-200 rounded-lg',
                      active
                        ? 'text-white'
                        : 'hover:bg-stone-50'
                    )}
                    style={active ? { background: '#2F6DA5', color: 'white' } : { color: '#4E4239' }}>
                    <span className="w-5 h-5 flex-shrink-0">{item.icon(active)}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Secondary nav */}
            <div className="mt-5 pt-4 space-y-0.5" style={{ borderTop: '1px solid #EDE7DC' }}>
              <p className="px-3 pb-1 text-2xs font-bold tracking-widest uppercase" style={{ color: '#C8BEB2' }}>More</p>
              {SECONDARY_NAV.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className={cn('flex items-center gap-3 px-3 py-2 text-sm transition-all duration-200 rounded-lg',
                      active ? 'font-semibold' : 'font-medium hover:bg-stone-50'
                    )}
                    style={active ? { color: '#2F6DA5', background: '#EEF4FA' } : { color: '#6B5E52' }}>
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Admin */}
            {profile.role === 'admin' && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid #EDE7DC' }}>
                <Link href="/admin"
                  className={cn('flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200',
                    pathname.startsWith('/admin') ? 'text-white' : 'hover:bg-stone-50'
                  )}
                  style={pathname.startsWith('/admin') ? { background: '#E6B75C', color: '#1C1C1C' } : { color: '#6B5E52' }}>
                  Admin
                </Link>
              </div>
            )}
          </nav>

          {/* Profile footer */}
          <div className="p-3" style={{ borderTop: '1px solid #EDE7DC' }}>
            <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-stone-50 transition-colors">
              <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#1C1C1C' }}>{profile.full_name || 'My Profile'}</p>
                <p className="text-xs truncate" style={{ color: '#A89A8C' }}>{profile.neighborhood || 'Edit profile'}</p>
              </div>
            </Link>
            <button onClick={handleSignOut}
              className="w-full mt-1 px-3 py-2 text-xs font-medium text-left rounded-lg transition-colors hover:bg-stone-50"
              style={{ color: '#C8BEB2' }}>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ height: '100%' }}>

        {/* Mobile header — warm white editorial */}
        <header className="lg:hidden flex items-center justify-between px-4 flex-shrink-0"
          style={{
            paddingTop: 'max(env(safe-area-inset-top), 12px)',
            paddingBottom: '12px',
            background: '#FFFFFF',
            borderBottom: '1px solid #EDE7DC',
          }}>
          <Link href="/home">
            <BrandLogo src={brandLogoUrl} size={36} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {profile.role === 'admin' && (
              <Link href="/admin"
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: '#E6B75C', color: '#1C1C1C' }}>
                Admin
              </Link>
            )}
            <Link href="/profile">
              <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {children}
        </div>

        {/* Mobile bottom tab bar — warm white, blue active */}
        <nav className="lg:hidden flex items-stretch flex-shrink-0"
          style={{
            background: '#FFFFFF',
            borderTop: '1px solid #EDE7DC',
            paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
          }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const showBadge = item.href === '/messages' && hasUnread && !active;
            return (
              <Link key={item.href} href={item.href}
                className={cn('bottom-nav-item', active && 'active')}
                style={{ paddingTop: '8px', paddingBottom: '4px', minHeight: '52px' }}>
                <span className="w-6 h-6 relative">
                  {item.icon(active)}
                  {showBadge && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                      style={{ background: '#2F6DA5' }} />
                  )}
                </span>
                <span className="text-2xs font-semibold">{item.mobileLabel}</span>
              </Link>
            );
          })}
          {/* Sign out on mobile — compact */}
          <button onClick={handleSignOut}
            className="flex flex-col items-center justify-center flex-1 text-stone-400 hover:text-stone-600 transition-colors"
            style={{ paddingTop: '8px', paddingBottom: '4px', minHeight: '52px', fontSize: '18px' }}>
            <span>⬡</span>
            <span className="text-2xs font-semibold mt-0.5">Out</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
