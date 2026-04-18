'use client';

import Link from 'next/link';
import Image from 'next/image';
import Avatar from '@/components/ui/Avatar';
import LisbonWeather from '@/components/home/LisbonWeather';
import PortuguesePhrase from '@/components/home/PortuguesePhrase';
import LatestPodcast from '@/components/home/LatestPodcast';
import LatestEpisode from '@/components/home/LatestEpisode';
import { formatDate, formatDateTime } from '@/lib/utils';
import ScrollPage from '@/components/ui/ScrollPage';

// ── Section theme tokens ──────────────────────────────────
const LIGHT  = { bg: '#F5F1EA', text: '#1C1C1C', muted: '#8A7C6E', border: '#EDE7DC' };
const BLUE   = { bg: '#EAF2F8', text: '#1C1C1C', muted: '#5A7A8E', border: '#C5DFF0' };
const DARK   = { bg: '#111111', text: '#FFFFFF',  muted: '#888888', border: '#2A2A2A' };
const ACCENT = { bg: '#1A1A1A', text: '#FFFFFF',  muted: '#666666', border: '#2A2A2A' };

// ── Tiny helpers ──────────────────────────────────────────
const Eyebrow = ({ label, color = LIGHT.muted }: { label: string; color?: string }) => (
  <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color, marginBottom: '8px' }}>
    {label}
  </p>
);

const SectionHead = ({ eyebrow, title, href, linkLabel, dark = false }:
  { eyebrow: string; title: string; href?: string; linkLabel?: string; dark?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '16px' }}>
    <div>
      <Eyebrow label={eyebrow} color={dark ? '#666' : LIGHT.muted} />
      <h2 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, color: dark ? '#fff' : '#1C1C1C', margin: 0 }}>
        {title}
      </h2>
    </div>
    {href && (
      <Link href={href} style={{ fontSize: '12px', fontWeight: 600, color: dark ? '#E6B75C' : '#2F6DA5', textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: '12px' }}>
        {linkLabel || 'See all →'}
      </Link>
    )}
  </div>
);

const ChevronRight = ({ color = '#2F6DA5' }: { color?: string }) => (
  <svg style={{ width: 18, height: 18, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

// ── Module link card ──────────────────────────────────────
function ModuleCard({ href, eyebrow, title, subtitle, accentColor = '#2F6DA5' }:
  { href: string; eyebrow: string; title: string; subtitle: string; accentColor?: string }) {
  return (
    <Link href={href} style={{ display: 'block', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #EDE7DC', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textDecoration: 'none', overflow: 'hidden' }}>
      <div style={{ borderLeft: `3px solid ${accentColor}`, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: accentColor, marginBottom: '3px' }}>{eyebrow}</p>
          <p style={{ fontSize: '17px', fontWeight: 600, color: '#1C1C1C', margin: '0 0 2px' }}>{title}</p>
          <p style={{ fontSize: '12px', color: '#A89A8C', margin: 0 }}>{subtitle}</p>
        </div>
        <ChevronRight color={accentColor} />
      </div>
    </Link>
  );
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

  return (
    <ScrollPage>
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>

      {/* ══════════════════════════════════════════════
          HERO — clean white, spacious
      ══════════════════════════════════════════════ */}
      <div style={{ background: '#FFFFFF', padding: '36px 20px 28px', borderBottom: '1px solid #EDE7DC' }}>
        <Eyebrow label="Club People Of Lisbon" color="#2F6DA5" />
        <h1 style={{ fontSize: 'clamp(28px, 6vw, 38px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, color: '#1C1C1C', margin: '0 0 10px' }}>
          Good to see you,<br />{firstName}.
        </h1>
        <p style={{ fontSize: '14px', color: '#A89A8C', margin: 0 }}>
          Lisbon's most interesting people, all in one place.
        </p>
      </div>

      {/* ══════════════════════════════════════════════
          WEATHER — light editorial strip
      ══════════════════════════════════════════════ */}
      <div style={{ background: LIGHT.bg, padding: '16px 20px 0' }}>
        <LisbonWeather />
      </div>

      {/* ══════════════════════════════════════════════
          LATEST EPISODE — DARK FEATURE section
      ══════════════════════════════════════════════ */}
      {latestEpisodeUrl && (
        <div style={{ background: DARK.bg, padding: '28px 20px' }}>
          <SectionHead eyebrow="Latest episode" title="Watch Now" dark />
          <div style={{ borderRadius: '10px', overflow: 'hidden' }}>
            <LatestEpisode url={latestEpisodeUrl} />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          LATEST FROM STEPHEN — light editorial card
      ══════════════════════════════════════════════ */}
      {latestUpdate && (
        <div style={{ background: LIGHT.bg, padding: '28px 20px' }}>
          <SectionHead eyebrow="From the founder" title="Latest from Stephen" href="/updates" linkLabel="All updates →" />
          <Link href="/updates" style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid #EDE7DC', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ borderLeft: '4px solid #E6B75C', padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                    <Avatar src={stephenProfile?.avatar_url || ''} name={stephenProfile?.full_name || 'Stephen'} size="sm" />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1C1C1C', margin: 0 }}>{stephenProfile?.full_name || "Stephen O'Regan"}</p>
                    <p style={{ fontSize: '11px', color: '#A89A8C', margin: 0 }}>{formatDate(latestUpdate.published_at)}</p>
                  </div>
                </div>
                <p style={{ fontSize: '18px', fontWeight: 600, color: '#1C1C1C', lineHeight: 1.3, margin: 0 }}>{latestUpdate.title}</p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#2F6DA5', marginTop: '10px', marginBottom: 0 }}>Read more →</p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          EVENTS — light editorial
      ══════════════════════════════════════════════ */}
      {upcomingEvents.length > 0 && (
        <div style={{ background: LIGHT.bg, padding: '0 20px 28px' }}>
          <SectionHead eyebrow="What's on" title="Upcoming Events" href="/events" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcomingEvents.map((event: any) => (
              <Link key={event.id} href={`/events/${event.id}`} style={{ display: 'block', textDecoration: 'none', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #EDE7DC', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {event.image_url && (
                  <div style={{ position: 'relative', height: '140px', background: '#E0D9CE' }}>
                    <Image src={event.image_url} alt={event.title} fill style={{ objectFit: 'cover' }} unoptimized />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 16px' }}>
                  <div style={{ flexShrink: 0, textAlign: 'center', minWidth: '44px' }}>
                    <div style={{ background: '#2F6DA5', borderRadius: '7px', padding: '6px 4px' }}>
                      <p style={{ color: 'white', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1, margin: '0 0 2px' }}>
                        {new Date(event.starts_at).toLocaleDateString('en', { month: 'short' })}
                      </p>
                      <p style={{ color: 'white', fontSize: '20px', fontWeight: 700, lineHeight: 1, margin: 0 }}>
                        {new Date(event.starts_at).getDate()}
                      </p>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#1C1C1C', margin: '0 0 3px', lineHeight: 1.3 }}>{event.title}</p>
                    {event.location_name && <p style={{ fontSize: '12px', color: '#A89A8C', margin: '0 0 1px' }}>{event.location_name}</p>}
                    <p style={{ fontSize: '12px', color: '#A89A8C', margin: 0 }}>{formatDateTime(event.starts_at)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          NEW MEMBER — SOFT BLUE section
      ══════════════════════════════════════════════ */}
      {newestMember && (
        <div style={{ background: BLUE.bg, padding: '28px 20px', borderTop: '1px solid #C5DFF0', borderBottom: '1px solid #C5DFF0' }}>
          <SectionHead eyebrow="New to the club" title="Say Hello" href="/members" linkLabel="All members →" />
          <Link href={`/members/${newestMember.id}`} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #C5DFF0', padding: '16px', textDecoration: 'none', boxShadow: '0 2px 8px rgba(47,109,165,0.08)' }}>
            <div style={{ flexShrink: 0 }}>
              <Avatar src={newestMember.avatar_url} name={newestMember.full_name} size="xl" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#1C1C1C', margin: '0 0 3px', lineHeight: 1.2 }}>{newestMember.full_name}</p>
              {newestMember.headline && <p style={{ fontSize: '13px', color: '#6B5E52', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{newestMember.headline}</p>}
              {newestMember.neighborhood && (
                <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#2F6DA5', background: '#EAF2F8', padding: '3px 8px', borderRadius: '4px' }}>
                  {newestMember.neighborhood}
                </span>
              )}
            </div>
            <ChevronRight />
          </Link>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          PODCAST — DARK section
      ══════════════════════════════════════════════ */}
      <div style={{ background: DARK.bg, padding: '28px 20px' }}>
        <SectionHead eyebrow="Listen" title="Latest Podcast" dark />
        <LatestPodcast />
      </div>

      {/* ══════════════════════════════════════════════
          PORTUGUESE PHRASE — blue accent
      ══════════════════════════════════════════════ */}
      <div style={{ background: BLUE.bg, padding: '20px', borderTop: '1px solid #C5DFF0', borderBottom: '1px solid #C5DFF0' }}>
        <PortuguesePhrase />
      </div>

      {/* ══════════════════════════════════════════════
          MODULE CARDS — light editorial grid
      ══════════════════════════════════════════════ */}
      <div style={{ background: LIGHT.bg, padding: '28px 20px' }}>
        <Eyebrow label="Explore the club" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <ModuleCard href="/recommendations" eyebrow="Curated by POL" title="Recommendations" subtitle="Restaurants, cafés & experiences" />
          <ModuleCard href="/leaderboard" eyebrow="Club" title="Leaderboard" subtitle="Totally pointless, just for fun" />
          <ModuleCard href="/board" eyebrow="Community" title="Message Board" subtitle="Post a thought or happening" />
          <ModuleCard href="/membership-card" eyebrow="Members only" title="Membership Card" subtitle="Your Club People Of Lisbon card" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          RITA'S PHOTOS — light, full-bleed
      ══════════════════════════════════════════════ */}
      {latestPhoto && (
        <div style={{ background: LIGHT.bg, padding: '0 20px 28px' }}>
          <SectionHead eyebrow="Photography" title="Rita's Latest Photos" href="/photos" />
          <Link href="/photos" style={{ display: 'block', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', textDecoration: 'none' }}>
            <div style={{ position: 'relative', aspectRatio: '4/3', background: '#E0D9CE' }}>
              <Image src={latestPhoto.image_url} alt={latestPhoto.title || "Rita's photo"} fill style={{ objectFit: 'cover' }} unoptimized />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)' }} />
              {latestPhoto.title && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.2 }}>{latestPhoto.title}</p>
                </div>
              )}
            </div>
          </Link>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          BREAK TILES — ACCENT dark section
      ══════════════════════════════════════════════ */}
      <Link href="/break-tiles" style={{ display: 'block', textDecoration: 'none', position: 'relative', overflow: 'hidden' }}>
        <div style={{ backgroundImage: "url('/tile-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div style={{ background: 'rgba(17,17,17,0.82)', padding: '24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Eyebrow label="Game" color="#E6B75C" />
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 3px' }}>Break The Tiles</p>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Smash Portuguese azulejos · stress reliever</p>
            </div>
            <ChevronRight color="#E6B75C" />
          </div>
        </div>
      </Link>

      {/* Tile Smashers leaderboard link */}
      <Link href="/tile-leaderboard" style={{ display: 'block', textDecoration: 'none', background: ACCENT.bg }}>
        <div style={{ borderLeft: '3px solid #E6B75C', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#E6B75C', margin: '0 0 2px' }}>Leaderboard</p>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Tile Smashers</p>
          </div>
          <ChevronRight color="#E6B75C" />
        </div>
      </Link>

      {/* Bottom spacer */}
      <div style={{ height: '24px', background: LIGHT.bg }} />
    </div>
    </ScrollPage>
  );
}
