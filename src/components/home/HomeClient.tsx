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

// ─── Design tokens ────────────────────────────────────────
const BG    = '#F5F1EA';
const CARD  = '#FFFFFF';
const RED   = '#C8102E';
const GOLD  = '#E6B75C';
const INK   = '#1C1C1C';
const MUTED = '#8A7C6E';
const BORDER = '1px solid #EDE7DC';
const SHADOW = '0 2px 12px rgba(0,0,0,0.07)';
const RADIUS = '14px';
const FF = "'SF UI Display', -apple-system, BlinkMacSystemFont, sans-serif";

// ─── Card wrapper ─────────────────────────────────────────
const card: React.CSSProperties = {
  background: CARD,
  borderRadius: RADIUS,
  boxShadow: SHADOW,
  overflow: 'hidden',
  border: 'none',
};

// ─── Eyebrow label ────────────────────────────────────────
const Eye = ({ t, color = MUTED }: { t: string; color?: string }) => (
  <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em',
    textTransform: 'uppercase', color, margin: '0 0 6px', fontFamily: FF }}>{t}</p>
);

// ─── Section row header ───────────────────────────────────
const Head = ({ eye, title, href }: { eye: string; title: string; href?: string }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
    <div>
      <Eye t={eye} color={RED} />
      <h2 style={{ fontSize: 26, fontWeight: 900, color: INK, margin: 0, letterSpacing: '-0.025em', lineHeight: 1.1, fontFamily: FF }}>{title}</h2>
    </div>
    {href && (
      <Link href={href} style={{ fontSize: 12, fontWeight: 700, color: RED, textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: 12, paddingBottom: 2, fontFamily: FF }}>
        See all →
      </Link>
    )}
  </div>
);

// ─── Chevron icon ─────────────────────────────────────────
const Chev = ({ color = RED }: { color?: string }) => (
  <svg style={{ width: 18, height: 18, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

// ─── Module row card ──────────────────────────────────────
const Mod = ({ href, eye, title, sub, accent = RED }: {
  href: string; eye: string; title: string; sub: string; accent?: string;
}) => (
  <Link href={href} style={{ display: 'block', ...card, textDecoration: 'none' }}>
    <div style={{ borderLeft: `4px solid ${accent}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <Eye t={eye} color={accent} />
        <p style={{ fontSize: 22, fontWeight: 900, color: INK, margin: '0 0 2px', fontFamily: FF, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{title}</p>
        <p style={{ fontSize: 13, color: MUTED, margin: 0, lineHeight: 1.4 }}>{sub}</p>
      </div>
      <Chev color={accent} />
    </div>
  </Link>
);

// ─── Soft image gradient overlay ─────────────────────────
const ImgOverlay = () => (
  <div style={{ position: 'absolute', inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 45%, transparent 100%)' }} />
);

// ─── Text shadow for image text ───────────────────────────
const imgText: React.CSSProperties = {
  textShadow: '0 1px 3px rgba(0,0,0,0.45)',
};

interface Props {
  profile: { full_name: string; avatar_url: string; neighborhood: string } | null;
  recentMembers: { id: string; full_name: string; avatar_url: string; headline: string; neighborhood: string; joined_at: string }[];
  upcomingEvents: { id: string; title: string; starts_at: string; location_name: string; status: string; image_url?: string }[];
  latestPhoto: { id: string; image_url: string; title: string; caption: string } | null;
  latestUpdate: { id: string; title: string; published_at: string } | null;
  stephenProfile: { full_name: string; avatar_url: string } | null;
  brandLogoUrl?: string;
  latestEpisodeUrl?: string;
  latestRec?: { id: string; name: string; category: string; neighbourhood: string; image_url?: string } | null;
  nextMemberEvent?: { id: string; name: string; event_date: string; event_time: string; location: string; submitted_by: string } | null;
  latestOffer?: { id: string; title: string; partner_name: string; partner_url: string; discount: string } | null;
}

export default function HomeClient({ profile, recentMembers, upcomingEvents, latestUpdate, latestPhoto, stephenProfile, latestEpisodeUrl, latestRec, nextMemberEvent, latestOffer }: Props) {
  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const newestMember = recentMembers[0] || null;
  const gap = 18;
  const pad = '0 16px';

  return (
    <ScrollPage>
      <div style={{ maxWidth: 680, margin: '0 auto', background: BG, paddingBottom: 32 }}>

        {/* ─── HERO ─────────────────────────────────────── */}
        <div style={{ background: CARD, padding: '32px 20px 24px', borderBottom: `3px solid ${RED}`, marginBottom: gap }}>
          <Eye t="Club People Of Lisbon" color={RED} />
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 38px)', fontWeight: 900, color: INK,
            letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 8px', fontFamily: FF }}>
            Welcome back, {firstName}.
          </h1>
          <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.6, fontFamily: FF }}>
            Lisbon's most interesting people, all in one place.
          </p>
        </div>

        {/* ─── 1. WEATHER ───────────────────────────────── */}
        <div style={{ padding: pad, marginBottom: gap }}>
          <LisbonWeather />
        </div>

        {/* ─── 2. LATEST FROM STEPHEN ───────────────────── */}
        {latestUpdate && (
          <div style={{ padding: pad, marginBottom: gap }}>
            <Head eye="From the founder" title="Latest from Stephen" href="/updates" />
            <Link href="/updates" style={{ display: 'block', ...card, textDecoration: 'none' }}>
              <div style={{ borderLeft: `4px solid ${RED}`, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `2px solid ${RED}` }}>
                    <Avatar src={stephenProfile?.avatar_url || ''} name={stephenProfile?.full_name || 'Stephen'} size="sm" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: 0 }}>
                      {stephenProfile?.full_name || "Stephen O'Regan"}
                    </p>
                    <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{formatDate(latestUpdate.published_at)}</p>
                  </div>
                </div>
                <p style={{ fontSize: 17, fontWeight: 700, color: INK, margin: '0 0 10px', lineHeight: 1.35, fontFamily: FF }}>
                  {latestUpdate.title}
                </p>
                <p style={{ fontSize: 12, fontWeight: 700, color: RED, margin: 0, fontFamily: FF }}>Read more →</p>
              </div>
            </Link>
          </div>
        )}

        {/* ─── 3. EVENTS ────────────────────────────────── */}
        {upcomingEvents.length > 0 && (
          <div style={{ padding: pad, marginBottom: gap }}>
            <Head eye="What's on" title="Club Gatherings" href="/events" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingEvents.map((event: any) => (
                <Link key={event.id} href={`/events/${event.id}`}
                  style={{ display: 'block', ...card, textDecoration: 'none' }}>
                  {event.image_url ? (
                    <div style={{ position: 'relative', height: 150, overflow: 'hidden' }}>
                      <img src={event.image_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <ImgOverlay />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 16px' }}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2, ...imgText }}>
                          {event.title}
                        </p>
                      </div>
                      <div style={{ position: 'absolute', top: 12, left: 12, background: RED, borderRadius: 8, padding: '5px 8px', textAlign: 'center', minWidth: 44 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', textTransform: 'uppercase', margin: '0 0 1px', lineHeight: 1 }}>
                          {new Date(event.starts_at).toLocaleDateString('en', { month: 'short' })}
                        </p>
                        <p style={{ fontSize: 19, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1 }}>
                          {new Date(event.starts_at).getDate()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
                      <div style={{ background: RED, borderRadius: 8, padding: '6px 8px', textAlign: 'center', minWidth: 44, flexShrink: 0 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', textTransform: 'uppercase', margin: '0 0 1px', lineHeight: 1 }}>
                          {new Date(event.starts_at).toLocaleDateString('en', { month: 'short' })}
                        </p>
                        <p style={{ fontSize: 19, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1 }}>
                          {new Date(event.starts_at).getDate()}
                        </p>
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: INK, margin: 0, lineHeight: 1.3, flex: 1 }}>{event.title}</p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ─── 3b. NEXT MEMBER EVENT ──────────────────────── */}
        {nextMemberEvent && (
          <div style={{ padding: pad, marginBottom: gap }}>
            <Head eye="From the club" title="Member Events" href="/member-events" />
            <Link href="/member-events" style={{ display: 'block', ...card, textDecoration: 'none' }}>
              <div style={{ borderLeft: `4px solid ${RED}`, padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 4px', fontFamily: FF }}>{nextMemberEvent.name}</p>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: RED, margin: 0 }}>{nextMemberEvent.event_date}</p>
                    {nextMemberEvent.event_time && <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{nextMemberEvent.event_time}</p>}
                  </div>
                </div>
                {nextMemberEvent.location && <p style={{ fontSize: 12, color: MUTED, margin: '2px 0 0' }}>📍 {nextMemberEvent.location}</p>}
                <p style={{ fontSize: 12, color: MUTED, margin: '6px 0 0' }}>By <strong style={{ color: INK }}>{nextMemberEvent.submitted_by}</strong></p>
              </div>
            </Link>
          </div>
        )}

        {/* ─── 4. NEW MEMBER ────────────────────────────── */}
        {newestMember && (
          <div style={{ padding: pad, marginBottom: gap }}>
            <Head eye="New to the club" title="Say Hello" href="/members" />
            <Link href={`/members/${newestMember.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: 14, ...card, padding: '16px 18px', textDecoration: 'none' }}>
              <Avatar src={newestMember.avatar_url} name={newestMember.full_name} size="xl" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: INK, margin: '0 0 3px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                  {newestMember.full_name}
                </p>
                {newestMember.headline && (
                  <p style={{ fontSize: 13, color: MUTED, margin: '0 0 7px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {newestMember.headline}
                  </p>
                )}
                {newestMember.neighborhood && (
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: RED,
                    background: '#EAF2F8', padding: '3px 8px', borderRadius: 5, display: 'inline-block' }}>
                    {newestMember.neighborhood}
                  </span>
                )}
              </div>
              <Chev />
            </Link>
          </div>
        )}

        {/* ─── 5. LATEST EPISODE ────────────────────────── */}
        {latestEpisodeUrl && (
          <div style={{ padding: pad, marginBottom: gap }}>
            <Head eye="People Of Lisbon" title="Latest Episode" />
            <div style={{ ...card }}>
              <LatestEpisode url={latestEpisodeUrl} />
            </div>
          </div>
        )}

        {/* ─── 6. PODCAST ───────────────────────────────── */}
        <div style={{ padding: pad, marginBottom: gap }}>
          <Head eye="Listen" title="Latest Podcast" />
          <div style={{ ...card, overflow: 'visible' }}>
            <LatestPodcast />
          </div>
        </div>

        {/* ─── 7. PORTUGUESE PHRASE ─────────────────────── */}
        <div style={{ padding: pad, marginBottom: gap }}>
          <PortuguesePhrase />
        </div>

        {/* ─── 8. MODULES ───────────────────────────────── */}
        <div style={{ padding: pad, marginBottom: gap }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Recommendations — with image preview */}
            <Link href="/recommendations" style={{ display: 'block', ...card, textDecoration: 'none' }}>
              {latestRec?.image_url ? (
                <div style={{ position: 'relative', height: 150, overflow: 'hidden' }}>
                  <img src={latestRec.image_url} alt={latestRec.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <ImgOverlay />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 16px' }}>
                    <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 3px', lineHeight: 1.1, letterSpacing: '-0.02em', ...imgText }}>{latestRec.name}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: 0, ...imgText }}>
                      {latestRec.category}{latestRec.neighbourhood ? ` · ${latestRec.neighbourhood}` : ''}
                    </p>
                  </div>
                  <div style={{ position: 'absolute', top: 12, left: 12, background: RED, borderRadius: 8, padding: '5px 10px' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', textTransform: 'uppercase', margin: 0, letterSpacing: '0.08em' }}>Our Recommendations</p>
                  </div>
                </div>
              ) : (
                <div style={{ borderLeft: `4px solid ${RED}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <Eye t="Curated by POL" color={RED} />
                    <p style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 2px', fontFamily: FF }}>Our Recommendations</p>
                    {latestRec ? (
                      <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>
                        Latest: <span style={{ fontWeight: 600, color: INK }}>{latestRec.name}</span>
                        {latestRec.neighbourhood ? ` · ${latestRec.neighbourhood}` : ''}
                      </p>
                    ) : (
                      <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>Restaurants, cafés & experiences</p>
                    )}
                  </div>
                  <Chev />
                </div>
              )}
            </Link>
            <Mod href="/member-events" eye="Community"    title="Member Events"            sub="Events posted by club members" />
            <Mod href="/membership-card" eye="Members only"  title="Membership Card + Offers" sub="Your card and member discounts" />

            {/* Latest offer */}
            {latestOffer && (
              <div style={{ background: '#fff', borderRadius: RADIUS, border: '1px solid #EDE7DC', borderLeft: `4px solid ${RED}`, padding: '16px 18px', marginTop: 2 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {latestOffer.partner_name && <p style={{ fontSize: 11, fontWeight: 700, color: RED, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 3px', fontFamily: FF }}>{latestOffer.partner_name}</p>}
                    <p style={{ fontSize: 22, fontWeight: 900, color: INK, margin: 0, fontFamily: FF, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{latestOffer.title}</p>
                  </div>
                  {latestOffer.discount && (
                    <span style={{ flexShrink: 0, background: '#FDECEA', border: `1.5px solid ${RED}`, color: RED, borderRadius: 8, padding: '5px 12px', fontSize: 13, fontWeight: 800, fontFamily: FF }}>{latestOffer.discount}</span>
                  )}
                </div>
                <Link href="/membership-card" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: INK, color: '#fff', borderRadius: 6, padding: '9px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none', fontFamily: FF, letterSpacing: '0.03em', marginTop: 4 }}>
                  More Offers →
                </Link>
              </div>
            )}

            {/* ─── MAP FEATURE BLOCK ──────────────────────── */}
            <Link href="/map" style={{ display: 'block', textDecoration: 'none', borderRadius: RADIUS, overflow: 'hidden' }}>
              <div style={{ background: INK, borderLeft: `5px solid ${RED}`, padding: '22px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <Eye t="Explore Lisbon" color={RED} />
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.02em', lineHeight: 1.1, fontFamily: FF, textTransform: 'none' }}>
                    Through The People
                  </h3>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 16px', fontFamily: FF }}>
                    200+ stories and videos across the city.
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: RED, color: '#fff', padding: '9px 16px', borderRadius: 4, fontSize: 11, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: FF }}>
                    Open the Map →
                  </div>
                </div>
                <div style={{ flexShrink: 0, opacity: 0.15 }}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3" fill="#1C1C1C"/>
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* ─── 9. RITA'S PHOTOS ─────────────────────────── */}
        {latestPhoto && (
          <div style={{ padding: pad, marginBottom: gap }}>
            <Head eye="Photography" title="Rita's Latest Photos" href="/photos" />
            <Link href="/photos" style={{ display: 'block', ...card, textDecoration: 'none' }}>
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img src={latestPhoto.image_url} alt={latestPhoto.title || "Rita's photo"}
                  style={{ width: '100%', display: 'block', maxHeight: 520, objectFit: 'contain', background: '#111' }} />
                <ImgOverlay />
                {latestPhoto.title && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 18px' }}>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2, ...imgText }}>
                      {latestPhoto.title}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          </div>
        )}

        {/* ─── 10. BREAK TILES ──────────────────────────── */}
        <div style={{ padding: pad, marginBottom: 8 }}>
          <Link href="/break-tiles" style={{ display: 'block', ...card, textDecoration: 'none', overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ backgroundImage: "url('/tile-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', minHeight: 110 }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,28,28,0.72)' }} />
                <div style={{ position: 'relative', padding: '22px 20px', display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
                  <div>
                    <Eye t="Game" color={RED} />
                    <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 3px', letterSpacing: '-0.02em', lineHeight: 1.1, ...imgText }}>Break The Tiles</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: 0 }}>Smash Portuguese azulejos</p>
                  </div>
                  <Chev color={RED} />
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div style={{ padding: pad, marginBottom: 32 }}>
          <Mod href="/tile-leaderboard" eye="Leaderboard" title="Tile Smashers" sub="See who's smashing the most tiles" />
        </div>

      </div>
    </ScrollPage>
  );
}
