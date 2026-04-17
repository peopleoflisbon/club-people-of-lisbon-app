'use client';

import Link from 'next/link';
import Image from 'next/image';
import Avatar from '@/components/ui/Avatar';
import BrandLogo from '@/components/ui/BrandLogo';
import LisbonWeather from '@/components/home/LisbonWeather';
import PortuguesePhrase from '@/components/home/PortuguesePhrase';
import LatestPodcast from '@/components/home/LatestPodcast';
import TileLeaderboard from '@/components/home/TileLeaderboard';
import LatestEpisode from '@/components/home/LatestEpisode';
import { formatDate, formatDateTime } from '@/lib/utils';
import ScrollPage from '@/components/ui/ScrollPage';

const GREEN_CHEVRON = "url('/green-chevron-bg.svg')";
const RED_CHEVRON = "url('/sidebar-bg.png')";

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "It's a beautiful morning";
  if (h < 17) return "It's a beautiful afternoon";
  if (h < 21) return "It's a beautiful evening";
  return "Hope you had a great day";
}

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

export default function HomeClient({ profile, recentMembers, upcomingEvents, latestPhoto, latestUpdate, stephenProfile, brandLogoUrl, latestEpisodeUrl }: Props) {
  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const newestMember = recentMembers[0] || null;
  const timeGreeting = getTimeGreeting();

  return (
    <ScrollPage>
    <div className="max-w-4xl mx-auto">

      {/* Hero */}
      <div className="px-5 lg:px-8 py-8 lg:py-10" style={{ backgroundImage: RED_CHEVRON, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-white text-2xl lg:text-3xl leading-tight">Good to see you, {firstName}.</p>
              <p className="text-stone-400 text-sm mt-1">{timeGreeting} ☀️</p>
            </div>
            <BrandLogo src={brandLogoUrl} size={52} radius={0} className="shadow-lg shadow-brand/30 flex-shrink-0" />
          </div>
          <div className="mt-5 h-0.5 bg-gradient-to-r from-brand via-white/20 to-transparent" />
          {/* Tagline */}
          <p className="font-display text-white/70 text-lg lg:text-xl mt-3 leading-snug">Lisbon's most interesting people, all in one place.</p>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-5 space-y-6">

        {/* 1. WEATHER */}
        <LisbonWeather />

        {/* 3. LATEST FROM STEPHEN */}
        {latestUpdate && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl text-ink">Latest from Stephen</h2>
              <Link href="/updates" className="text-sm font-semibold text-brand hover:underline">See all →</Link>
            </div>
            <Link href="/updates" className="block group hover:-translate-y-0.5 transition-transform duration-200"
              style={{ backgroundImage: GREEN_CHEVRON, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
              <div className="relative z-10 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar src={stephenProfile?.avatar_url || ''} name={stephenProfile?.full_name || 'Stephen'} size="md" className="flex-shrink-0 ring-2 ring-white/20" />
                  <div>
                    <p className="text-white text-base font-semibold">{stephenProfile?.full_name || "Stephen O'Regan"}</p>
                    <p className="text-stone-400 text-sm">{formatDate(latestUpdate.published_at)}</p>
                  </div>
                </div>
                <p className="font-display text-white text-xl leading-tight group-hover:underline">{latestUpdate.title}</p>
              </div>
            </Link>
          </section>
        )}

        {/* 4. EVENTS */}
        {upcomingEvents.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl text-ink">Upcoming Events</h2>
              <Link href="/events" className="text-sm font-semibold text-brand hover:underline">See all →</Link>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event: any) => (
                <Link key={event.id} href={`/events/${event.id}`} className="block bg-white border border-stone-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                  {event.image_url && (
                    <div className="relative h-32 bg-stone-100">
                      <Image src={event.image_url} alt={event.title} fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <div className="flex items-start gap-4 p-4">
                    <div className="flex-shrink-0 w-12 text-center">
                      <div className="bg-brand py-2">
                        <p className="text-white text-xs font-bold uppercase leading-none">{new Date(event.starts_at).toLocaleDateString('en', { month: 'short' })}</p>
                        <p className="text-white font-display text-xl leading-none mt-0.5">{new Date(event.starts_at).getDate()}</p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base text-ink leading-tight">{event.title}</p>
                      {event.location_name && <p className="text-sm text-stone-400 mt-1">{event.location_name}</p>}
                      <p className="text-sm text-stone-400 mt-0.5">{formatDateTime(event.starts_at)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 5. NEW MEMBER */}
        {newestMember && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl text-ink">New Member</h2>
              <Link href="/members" className="text-sm font-semibold text-brand hover:underline">All members →</Link>
            </div>
            <Link href={`/members/${newestMember.id}`} className="flex items-center gap-4 bg-white border border-stone-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <Avatar src={newestMember.avatar_url} name={newestMember.full_name} size="xl" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider mb-0.5">Say Hello to...</p>
                <p className="font-display text-xl text-ink leading-tight">{newestMember.full_name}</p>
                {newestMember.headline && <p className="text-stone-500 text-sm mt-0.5 line-clamp-1">{newestMember.headline}</p>}
                {newestMember.neighborhood && <p className="text-sm text-brand font-medium mt-1">{newestMember.neighborhood}</p>}
              </div>
            </Link>
          </section>
        )}

        {/* 6. LATEST EPISODE */}
        {latestEpisodeUrl && <LatestEpisode url={latestEpisodeUrl} />}

        {/* 7. PODCAST — under new member */}
        <LatestPodcast />

        {/* 7. PORTUGUESE PHRASE */}
        <PortuguesePhrase />

        {/* Good News hidden for now — keeping for future */}

        {/* 8. LEADERBOARD */}
        <Link href="/leaderboard" className="block relative overflow-hidden" style={{ backgroundImage: RED_CHEVRON, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
          <div className="relative z-10 flex items-center justify-between px-5 py-5">
            <div>
              <p className="font-display text-white text-2xl leading-tight">Leaderboard</p>
              <p className="text-white/70 text-xs mt-1 italic">the totally pointless one, just for fun</p>
            </div>
            <svg className="w-5 h-5 text-white/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </Link>

        {/* 9. MEMBERSHIP CARD */}
        <Link href="/membership-card" className="block relative overflow-hidden" style={{ backgroundImage: RED_CHEVRON, backgroundSize: 'cover', backgroundPosition: 'center top' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }} />
          <div className="relative z-10 flex items-center justify-between px-5 py-5">
            <div>
              <p className="font-display text-white text-2xl leading-tight">Membership Card</p>
              <p className="text-white/70 text-xs mt-1">Your Club People Of Lisbon card</p>
            </div>
            <svg className="w-5 h-5 text-white/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </Link>

        {/* 10. RITA'S PHOTOS */}
        {latestPhoto && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl text-ink">Rita's Latest Photos</h2>
              <Link href="/photos" className="text-sm font-semibold text-brand hover:underline">See all →</Link>
            </div>
            <Link href="/photos" className="block group">
              <div className="relative overflow-hidden aspect-[4/3] bg-stone-100">
                <Image src={latestPhoto.image_url} alt={latestPhoto.title || "Rita's photo"} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-500" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                {latestPhoto.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-display text-white text-xl leading-tight">{latestPhoto.title}</p>
                  </div>
                )}
              </div>
            </Link>
          </section>
        )}

        {/* 11. BREAK THE TILES */}
        <Link href="/break-tiles" className="block relative overflow-hidden" style={{ backgroundImage: "url('/tile-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div className="relative z-10 flex items-center justify-between px-5 py-5">
            <div>
              <p className="font-display text-white text-2xl leading-tight">Break The Tiles</p>
              <p className="text-white/70 text-xs mt-1">Tap to smash · stress reliever</p>
            </div>
            <svg className="w-5 h-5 text-white/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </Link>

        {/* 12. TILE SMASHERS LEADERBOARD LINK */}
        <Link href="/tile-leaderboard" className="block relative overflow-hidden" style={{ background: '#1a1410' }}>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="font-display text-white text-lg leading-tight">Tile Smashers Leaderboard</p>
              <p className="text-stone-500 text-xs mt-0.5">See who's smashing the most tiles</p>
            </div>
            <svg className="w-5 h-5 text-stone-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </Link>

      </div>
    </div>
    </ScrollPage>
  );
}
