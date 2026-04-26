'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  partner_name: string;
  partner_url?: string;
  partner_phone?: string;
  partner_email?: string;
  how_to_redeem: string;
}

interface Props {
  profile: {
    id: string;
    full_name: string;
    avatar_url: string;
    job_title: string;
    neighborhood: string;
    nationality: string;
  } | null;
  memberNumber: string;
  joinYear: number;
  offers?: Offer[];
}

const NATIONALITY_FLAGS: Record<string, string> = {
  'Irish': '🇮🇪', 'British': '🇬🇧', 'American': '🇺🇸', 'Portuguese': '🇵🇹',
  'French': '🇫🇷', 'Spanish': '🇪🇸', 'Italian': '🇮🇹', 'German': '🇩🇪',
  'Brazilian': '🇧🇷', 'Australian': '🇦🇺', 'Canadian': '🇨🇦', 'Dutch': '🇳🇱',
  'Latvian': '🇱🇻', 'Swedish': '🇸🇪', 'Belgian': '🇧🇪', 'Norwegian': '🇳🇴',
};

export default function MembershipCardClient({ profile, memberNumber, joinYear, offers = [] }: Props) {
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const flag = profile?.nationality ? (NATIONALITY_FLAGS[profile.nationality] || '🌍') : '';

  async function saveCard() {
    const canvas = document.createElement('canvas');
    canvas.width = 1012;
    canvas.height = 638;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 1012, 638);
    grad.addColorStop(0, '#1a0000');
    grad.addColorStop(0.4, '#4a0000');
    grad.addColorStop(0.7, '#8B0000');
    grad.addColorStop(1, '#1a0000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1012, 638);

    // Chevron pattern
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 2;
    for (let i = -20; i < 35; i++) {
      const x = i * 45;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 225, 319);
      ctx.lineTo(x, 638);
      ctx.stroke();
    }

    // Try to load POL logo
    const logoImg = new window.Image();
    logoImg.crossOrigin = 'anonymous';
    await new Promise<void>((resolve) => {
      logoImg.onload = () => resolve();
      logoImg.onerror = () => resolve();
      logoImg.src = '/pol-logo.png';
    });

    // POL logo top right
    if (logoImg.complete && logoImg.naturalWidth > 0) {
      ctx.drawImage(logoImg, 1012 - 100, 40, 60, 60);
    }

    // Club name top left
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Club People Of Lisbon', 50, 80);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'italic 11px sans-serif';
    ctx.fillText('Not a tourist. A person of Lisbon.', 50, 100);

    // Member name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText((profile?.full_name || 'MEMBER').toUpperCase(), 50, 420);

    if (profile?.job_title) {
      ctx.fillStyle = '#F4141E';
      ctx.font = '16px sans-serif';
      ctx.fillText(profile.job_title, 50, 448);
    }

    // Member number
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '22px monospace';
    ctx.fillText(memberNumber, 50, 510);

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px sans-serif';
    ctx.fillText('MEMBER NO.', 50, 492);
    ctx.fillText(`MEMBER SINCE ${joinYear}`, 50, 570);

    ctx.textAlign = 'right';
    ctx.fillText('VALID · LISBON', 962, 570);

    // Download
    const link = document.createElement('a');
    link.download = 'POL-membership-card.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain">
      <div className="max-w-lg mx-auto px-4 py-6 lg:px-8">
        {/* Back */}
        <Link href="/profile" className="inline-flex items-center gap-2 text-stone-500 text-sm hover:text-ink transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </Link>

        <h1 className="font-display text-3xl text-ink mb-1">Membership Card</h1>
        <p className="text-stone-400 text-sm mb-8">Tap to flip · Save to use around Lisbon</p>

        {/* Card */}
        <div
          style={{ perspective: '1200px', cursor: 'pointer', WebkitPerspective: '1200px' }}
          onClick={() => setFlipped(f => !f)}
          className="mb-6"
        >
          <div
            ref={cardRef}
            style={{
              width: '100%',
              aspectRatio: '1.586',
              position: 'relative',
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
              transition: 'transform 0.6s ease',
              WebkitTransition: '-webkit-transform 0.6s ease',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              WebkitTransform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* FRONT */}
            <div style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundImage: 'url(/card-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              zIndex: flipped ? 0 : 1,
            }}>
              {/* Dark overlay so text stays readable */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.65) 100%)' }} />

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1, padding: '6%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/pol-logo.png" alt="People Of Lisbon" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', flexShrink: 0 }} />
                    <div>
                      <div style={{ color: '#fff', fontWeight: 800, fontSize: '11px', letterSpacing: '1.5px' }}>Club People Of Lisbon</div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', letterSpacing: '0.5px', marginTop: '2px', fontStyle: 'italic' }}>Not a tourist. A person of Lisbon.</div>
                    </div>
                  </div>
                  {/* Chip */}
                  <div style={{ width: '38px', height: '28px', background: 'linear-gradient(135deg, #d4a843, #f0d060, #c8922a)', borderRadius: '5px', opacity: 0.9 }} />
                </div>

                {/* Member info */}
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>Member</div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(14px, 3.5vw, 22px)', letterSpacing: '1px', textTransform: 'uppercase', lineHeight: 1.1 }}>
                    {profile?.full_name || 'Your Name'}
                    {flag && <span style={{ marginLeft: '8px', fontSize: 'clamp(12px, 2.5vw, 18px)' }}>{flag}</span>}
                  </div>
                  {profile?.job_title && (
                    <div style={{ color: '#F4141E', fontSize: '10px', fontWeight: 600, marginTop: '3px', letterSpacing: '0.5px' }}>{profile.job_title}</div>
                  )}
                </div>

                {/* Bottom row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '7px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>Member No.</div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace', fontSize: 'clamp(11px, 2.5vw, 16px)', letterSpacing: '3px' }}>{memberNumber}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '7px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>Since</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600 }}>{joinYear}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* BACK */}
            <div style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              WebkitTransform: 'rotateY(180deg)',
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #1a0000 0%, #4a0000 50%, #1a0000 100%)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              zIndex: flipped ? 1 : 0,
            }}>
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 600 378" preserveAspectRatio="xMidYMid slice">
                {Array.from({ length: 20 }, (_, i) => (
                  <path key={i} d={`M${i * 35 - 100} 0 L${i * 35} 189 L${i * 35 - 100} 378`} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
                ))}
              </svg>

              {/* Magnetic stripe */}
              <div style={{ position: 'absolute', top: '18%', left: 0, right: 0, height: '18%', background: 'rgba(0,0,0,0.8)' }} />

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1, padding: '6%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '10px 14px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>Member Benefits</div>
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '9px', lineHeight: 1.7 }}>
                    ✦ Exclusive member events &amp; gatherings in Lisbon<br />
                    ✦ Discounts at partner venues across the city<br />
                    ✦ Access to the People Of Lisbon community<br />
                    ✦ Introduction to featured People Of Lisbon
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '8px', letterSpacing: '1px' }}>peopleoflisbon.com</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/pol-logo.png" alt="POL" style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '6px' }} />
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px', fontWeight: 700, letterSpacing: '0.5px' }}>Club People Of Lisbon</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-stone-400 text-xs mb-6">Tap card to flip</p>

        <p className="text-center text-stone-400 text-xs mt-2 leading-relaxed">
          Show this card at partner venues around Lisbon for member discounts.
        </p>

        {/* ── Member Offers ── */}
        {offers.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1" style={{ background: '#EDE7DC' }} />
              <p className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: '#A89A8C' }}>
                Member Offers
              </p>
              <div className="h-px flex-1" style={{ background: '#EDE7DC' }} />
            </div>
            <div className="space-y-3">
              {offers.map((offer) => (
                <div key={offer.id} className="rounded-xl overflow-hidden"
                  style={{ background: '#FFFFFF', border: '1px solid #EDE7DC', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  {/* Gold accent bar */}
                  <div className="h-1" style={{ background: 'linear-gradient(to right, #E6B75C, #C49A3A)' }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: '#2F6DA5' }}>
                          {offer.partner_name}
                        </p>
                        <p className="text-base font-semibold" style={{ color: '#1C1C1C' }}>{offer.title}</p>
                      </div>
                      {offer.discount && (
                        <div className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold"
                          style={{ background: '#FFF8EE', color: '#C49A3A', border: '1px solid #E6B75C' }}>
                          {offer.discount}
                        </div>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: '#6B5E52' }}>{offer.description}</p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 flex-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#A89A8C' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <p className="text-xs italic" style={{ color: '#A89A8C' }}>{offer.how_to_redeem}</p>
                      </div>
                      {offer.partner_url && (
                        <a href={offer.partner_url} target="_blank" rel="noopener noreferrer"
                          className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg"
                          style={{ background: '#EEF4FA', color: '#2F6DA5' }}>
                          Visit →
                        </a>
                      )}
                      {offer.partner_phone && (
                        <a href={`tel:${offer.partner_phone}`}
                          className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg"
                          style={{ background: '#F0EBE2', color: '#6B5E52' }}>
                          📞 Call
                        </a>
                      )}
                      {offer.partner_email && (
                        <a href={`mailto:${offer.partner_email}`}
                          className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg"
                          style={{ background: '#F0EBE2', color: '#6B5E52' }}>
                          ✉️ Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-xs mt-4" style={{ color: '#C8BEB2' }}>
              Offers are updated regularly. Check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
