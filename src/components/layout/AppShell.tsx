'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Profile } from '@/types';
import { cn } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import BrandLogo from '@/components/ui/BrandLogo';

const NAV_ITEMS = [
  {
    href: '/home',
    label: 'Home',
    mobileLabel: 'Home',
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: '/members',
    label: 'Members',
    mobileLabel: 'Members',
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    href: '/events',
    label: 'Events',
    mobileLabel: 'Events',
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    href: '/map',
    label: 'Map',
    mobileLabel: 'Map',
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    href: '/messages',
    label: 'Messages',
    mobileLabel: 'Chat',
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    href: '/good-news',
    label: 'Good News',
    mobileLabel: 'News',
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
];

const SECONDARY_NAV = [
  { href: '/updates', label: 'Updates from Stephen' },
  { href: '/photos', label: "Rita's Photos" },
  { href: '/sponsors', label: 'Sponsors' },
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

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex h-screen bg-parchment overflow-hidden">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-ink h-full flex-shrink-0">
        <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <BrandLogo src={brandLogoUrl} size={40} className="shadow-md shadow-brand/30" />
            <div>
              <p className="font-display text-white text-base leading-tight font-black">People Of Lisbon</p>
              <p className="text-stone-500 text-xs mt-0.5 font-semibold leading-tight">Lisbon's most interesting people,<br />all in one place.</p>
            </div>
          </div>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 text-sm font-bold transition-all duration-200',
                    active
                      ? 'bg-brand text-white shadow-sm shadow-brand/20'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  )}
                >
                  <span className="w-5 h-5 flex-shrink-0">{item.icon(active)}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Secondary nav */}
          <div className="mt-4 pt-4 border-t border-stone-800 space-y-0.5">
            {SECONDARY_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm font-semibold transition-all duration-200',
                    active ? 'text-white bg-stone-800' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800/50'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Admin link */}
          {profile.role === 'admin' && (
            <div className="mt-4 pt-4 border-t border-stone-800">
              <Link
                href="/admin"
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm font-bold transition-all duration-200',
                  pathname.startsWith('/admin')
                    ? 'bg-brand text-white'
                    : 'text-stone-500 hover:text-white hover:bg-stone-800'
                )}
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin
              </Link>
            </div>
          )}
        </nav>

        {/* Profile footer */}
        <div className="p-3 border-t border-stone-800">
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 hover:bg-stone-800 transition-colors">
            <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-black truncate">{profile.full_name || 'My Profile'}</p>
              <p className="text-stone-500 text-xs truncate">{profile.neighborhood || 'Edit profile'}</p>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full mt-1 px-3 py-2 text-stone-500 hover:text-stone-300 hover:bg-stone-800/50 text-xs font-semibold text-left transition-colors"
          >
            Sign out
          </button>
        </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 pt-safe-top pb-3 bg-ink border-b border-stone-900">
          <BrandLogo src={brandLogoUrl} size={36} className="shadow-md shadow-brand/30" />
          <Link href="/profile">
            <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
          </Link>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          {children}
        </div>

        {/* Mobile bottom tab bar */}
        <nav className="lg:hidden flex items-stretch bg-white border-t border-stone-100 safe-bottom">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} className={cn('bottom-nav-item', active && 'active')}>
                <span className="w-5 h-5">{item.icon(active)}</span>
                <span className="text-2xs font-semibold">{item.mobileLabel}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
