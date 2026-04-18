'use client';

import Link from 'next/link';
import Image from 'next/image';
import Avatar from '@/components/ui/Avatar';
import BrandLogo from '@/components/ui/BrandLogo';
import LisbonWeather from '@/components/home/LisbonWeather';
import PortuguesePhrase from '@/components/home/PortuguesePhrase';
import LatestPodcast from '@/components/home/LatestPodcast';
import LatestEpisode from '@/components/home/LatestEpisode';
import { formatDate, formatDateTime } from '@/lib/utils';
import ScrollPage from '@/components/ui/ScrollPage';

// LP-style chevron — a simple right arrow for module cards
const ChevronRight = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

interface Props {
  profile: { full_name: string; avatar_url: string; neighborhood: string } | null;
  recentMembers: { id: string; full_name: string; avatar_url: string; headline: string; neighborhood: string; joined_at: string }[];
  upcomingEvents: { id: string; title: string; starts_at: string; location_name: string; status: string; image_url?: string }[];
  latestPhoto: { id: string; image_url: string; title: string; caption: string } | null;
  latestUpdate: { id: string; title: string; published_at: string } | null;
  stephenProfile: { full_name: string; avatar_url: string } | null;
  brandLogoUrl?: string;
  latestEpisodeUrl?: string;
}

// LP-style module card — warm card with blue accent
function ModuleCard({ href, eyebrow, title, subtitle }: { href: string; eyebrow: string; title: string; subtitle: string }) {
  return (
    <Link href={href} className="block group"
      style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid #EDE7DC', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden', transition: 'box-shadow 0.2s, transform 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
      <div style={{ borderLeft: '3px solid #2F6DA5', padding: '16px 20px' }} className="flex items-center justify-between">
        <div>
          <p className="pol-eyebrow mb-1">{eyebrow}</p>
          <p className="font-display text-2xl" style={{ color: '#1C1C1C', letterSpacing: '0.03em' }}>{title}</p>
          <p className="text-xs mt-1" style={{ color: '#A89A8C' }}>{subtitle}</p>
        </div>
        <span style={{ color: '#2F6DA5' }}><ChevronRight /></span>
      </div>
    </Link>
  );
}

export default function HomeClient({ profile, recentMembers, upcomingEvents, latestPhoto, latestUpdate, stephenProfile, brandLogoUrl, latestEpisodeUrl }: Props) {
  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const newestMember = recentMembers[0] || null;

  return (
    <ScrollPage>
    <div className="max-w-4xl mx-auto">

      {/* ── Hero — warm editorial header ── */}
      <div className="px-5 lg:px-8 py-8 lg:py-10" style={{ background: '#FFFFFF', borderBottom: '1px solid #EDE7DC' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="pol-eyebrow mb-2">Club People Of Lisbon</p>
            <h1 className="font-display leading-none" style={{ fontSize: 'clamp(2.8rem, 7vw, 4.5rem)', color: '#1C1C1C', letterSpacing: '0.02em' }}>
              Welcome back,<br />{firstName}.
            </h1>
            <p className="text-sm mt-3" style={{ color: '#A89A8C' }}>Lisbon's most interesting people, all in one place.</p>
          </div>
          <BrandLogo src={brandLogoUrl} size={52} radius={0} className="flex-shrink-0 mt-1" />
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6 space-y-6" style={{ background: '#F5F1EA' }}>

        {/* 1. WEATHER */}
        <LisbonWeather />

        {/* 2. LATEST FROM STEPHEN — LP editorial card */}
        {latestUpdate && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl" style={{ color: '#1C1C1C' }}>Latest from Stephen</h2>
              <Link href="/updates" className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2F6DA5' }}>See all →</Link>
            </div>
            <Link href="/updates" className="block group"
              style={{ background: '#FFFFFF', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #EDE7DC' }}>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar src={stephenProfile?.avatar_url || ''} name={stephenProfile?.full_name || 'Stephen'} size="md" className="flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#1C1C1C' }}>{stephenProfile?.full_name || "Stephen O'Regan"}</p>
                    <p className="text-xs" style={{ color: '#A89A8C' }}>{formatDate(latestUpdate.published_at)}</p>
                  </div>
                </div>
                <div style={{ borderLeft: '3px solid #E6B75C', paddingLeft: '14px' }}>
                  <p className="font-display text-2xl group-hover:underline" style={{ color: '#1C1C1C', letterSpacing: '0.03em' }}>{latestUpdate.title}</p>
                </div>
                <p className="text-xs font-bold mt-3 uppercase tracking-wider" style={{ color: '#2F6DA5' }}>Read more →</p>
              </div>
            </Link>
          </section>
        )}

        {/* 3. EVENTS — LP full-bleed cards */}
        {upcomingEvents.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl" style={{ color: '#1C1C1C' }}>Upcoming Events</h2>
              <Link href="/events" className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2F6DA5' }}>See all →</Link>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event: any) => (
                <Link key={event.id} href={`/events/${event.id}`} className="block group"
                  style={{ background: '#FFFFFF', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #EDE7DC' }}>
                  {event.image_url && (
                    <div className="relative h-40 bg-stone-100">
                      <Image src={event.image_url} alt={event.title} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-500" unoptimized />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
                    </div>
                  )}
                  <div className="flex items-start gap-4 p-4">
                    <div className="flex-shrink-0 text-center" style={{ minWidth: '48px' }}>
                      <div style={{ background: '#2F6DA5', borderRadius: '6px', padding: '6px 4px' }}>
                        <p className="text-white text-xs font-bold uppercase leading-none">{new Date(event.starts_at).toLocaleDateString('en', { month: 'short' })}</p>
                        <p className="text-white font-display text-xl leading-none mt-0.5">{new Date(event.starts_at).getDate()}</p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base leading-tight" style={{ color: '#1C1C1C' }}>{event.title}</p>
                      {event.location_name && <p className="text-sm mt-1" style={{ color: '#A89A8C' }}>{event.location_name}</p>}
                      <p className="text-xs mt-0.5" style={{ color: '#A89A8C' }}>{formatDateTime(event.starts_at)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 4. NEW MEMBER */}
        {newestMember && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl" style={{ color: '#1C1C1C' }}>New Member</h2>
              <Link href="/members" className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2F6DA5' }}>All members →</Link>
            </div>
            <Link href={`/members/${newestMember.id}`} className="block group"
              style={{ background: '#FFFFFF', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #EDE7DC' }}>
              <div className="flex items-center gap-4 p-4">
                <Avatar src={newestMember.avatar_url} name={newestMember.full_name} size="xl" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="pol-eyebrow mb-1">Say Hello to</p>
                  <p className="font-display text-2xl leading-tight" style={{ color: '#1C1C1C' }}>{newestMember.full_name}</p>
                  {newestMember.headline && <p className="text-sm mt-0.5 line-clamp-1" style={{ color: '#6B5E52' }}>{newestMember.headline}</p>}
                  {newestMember.neighborhood && (
                    <span className="inline-flex mt-2 text-xs font-bold px-2 py-1 rounded" style={{ background: '#EEF4FA', color: '#2F6DA5' }}>
                      {newestMember.neighborhood}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* 5. LATEST EPISODE */}
        {latestEpisodeUrl && <LatestEpisode url={latestEpisodeUrl} />}

        {/* 6. PODCAST */}
        <LatestPodcast />

        {/* 7. PORTUGUESE PHRASE */}
        <PortuguesePhrase />

        {/* 8. MODULE GRID — LP editorial cards */}
        <div className="space-y-3">
          <ModuleCard href="/leaderboard" eyebrow="Club" title="Leaderboard" subtitle="The totally pointless one, just for fun" />
          <ModuleCard href="/recommendations" eyebrow="Curated by POL" title="Our Recommendations" subtitle="Restaurants, cafés and experiences we love" />
          <ModuleCard href="/board" eyebrow="Community" title="Message Board" subtitle="Post a thought, event or happening" />
          <ModuleCard href="/membership-card" eyebrow="Members only" title="Membership Card" subtitle="Your Club People Of Lisbon card" />
        </div>

        {/* 9. RITA'S PHOTOS — LP full-bleed */}
        {latestPhoto && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl" style={{ color: '#1C1C1C' }}>Rita's Latest Photos</h2>
              <Link href="/photos" className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2F6DA5' }}>See all →</Link>
            </div>
            <Link href="/photos" className="block group"
              style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="relative overflow-hidden aspect-[4/3] bg-stone-100">
                <Image src={latestPhoto.image_url} alt={latestPhoto.title || "Rita's photo"} fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500" unoptimized />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
                {latestPhoto.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-display text-white text-2xl leading-tight">{latestPhoto.title}</p>
                  </div>
                )}
              </div>
            </Link>
          </section>
        )}

        {/* 10. BREAK THE TILES — LP style with azulejo image */}
        <Link href="/break-tiles" className="block group"
          style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'relative' }}>
          <div style={{ backgroundImage: "url('/tile-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div style={{ background: 'rgba(245,241,234,0.88)', padding: '20px' }} className="flex items-center justify-between">
              <div>
                <p className="pol-eyebrow mb-1">Game</p>
                <p className="font-display text-2xl" style={{ color: '#1C1C1C' }}>Break The Tiles</p>
                <p className="text-xs mt-1" style={{ color: '#6B5E52' }}>Tap to smash Portuguese azulejos</p>
              </div>
              <span style={{ color: '#2F6DA5' }}><ChevronRight /></span>
            </div>
          </div>
        </Link>

        {/* 11. TILE SMASHERS LINK */}
        <Link href="/tile-leaderboard" className="block group"
          style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid #EDE7DC', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ borderLeft: '3px solid #E6B75C', padding: '14px 20px' }} className="flex items-center justify-between">
            <div>
              <p className="pol-eyebrow mb-1" style={{ color: '#C49A3A' }}>Leaderboard</p>
              <p className="font-display text-xl" style={{ color: '#1C1C1C' }}>Tile Smashers</p>
              <p className="text-xs mt-0.5" style={{ color: '#A89A8C' }}>See who's smashing the most tiles</p>
            </div>
            <span style={{ color: '#E6B75C' }}><ChevronRight /></span>
          </div>
        </Link>

      </div>
    </div>
    </ScrollPage>
  );
}
