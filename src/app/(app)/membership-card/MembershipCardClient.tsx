'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

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
}

const NATIONALITY_FLAGS: Record<string, string> = {
  'Irish': '🇮🇪', 'British': '🇬🇧', 'American': '🇺🇸', 'Portuguese': '🇵🇹',
  'French': '🇫🇷', 'Spanish': '🇪🇸', 'Italian': '🇮🇹', 'German': '🇩🇪',
  'Brazilian': '🇧🇷', 'Australian': '🇦🇺', 'Canadian': '🇨🇦', 'Dutch': '🇳🇱',
  'Latvian': '🇱🇻', 'Swedish': '🇸🇪', 'Belgian': '🇧🇪', 'Norwegian': '🇳🇴',
};

export default function MembershipCardClient({ profile, memberNumber, joinYear }: Props) {
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const flag = profile?.nationality ? (NATIONALITY_FLAGS[profile.nationality] || '🌍') : '';

  async function saveCard() {
    // Open card in new tab for saving
    const canvas = document.createElement('canvas');
    canvas.width = 1012;
    canvas.height = 638;
    const ctx = canvas.getContext('2d')!;

    // Background - dark red chevron feel
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
    for (let i = -20; i < 30; i++) {
      const x = i * 40;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 200, 319);
      ctx.lineTo(x, 638);
      ctx.stroke();
    }

    // POL logo area
    ctx.fillStyle = '#F4141E';
    ctx.fillRect(60, 60, 80, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px serif';
    ctx.textAlign = 'center';
    ctx.fillText('P', 100, 115);

    // Club name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.letterSpacing = '3px';
    ctx.fillText('CLUB PEOPLE OF LISBON', 160, 95);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px sans-serif';
    ctx.fillText('Private Members Club · Lisbon', 160, 118);

    // Member name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(profile?.full_name?.toUpperCase() || 'MEMBER', 60, 420);

    if (profile?.job_title) {
      ctx.fillStyle = '#F4141E';
      ctx.font = '16px sans-serif';
      ctx.fillText(profile.job_title, 60, 448);
    }

    // Member number
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '22px monospace';
    ctx.fillText(memberNumber, 60, 510);

    // Member since
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '12px sans-serif';
    ctx.fillText(`MEMBER SINCE ${joinYear}`, 60, 560);

    // Valid
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('VALID · LISBON', 952, 560);

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
          style={{ perspective: '1200px', cursor: 'pointer' }}
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
              transition: 'transform 0.7s cubic-bezier(0.34, 1.26, 0.64, 1)',
              WebkitTransition: '-webkit-transform 0.7s cubic-bezier(0.34, 1.26, 0.64, 1)',
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
              background: 'linear-gradient(135deg, #1a0000 0%, #5a0000 40%, #8B0000 70%, #1a0000 100%)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            }}>
              {/* Chevron SVG overlay */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 600 378" preserveAspectRatio="xMidYMid slice">
                {Array.from({ length: 20 }, (_, i) => (
                  <path key={i} d={`M${i * 35 - 100} 0 L${i * 35} 189 L${i * 35 - 100} 378`} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
                ))}
              </svg>

              {/* Gloss overlay */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)', borderRadius: '16px 16px 0 0' }} />

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1, padding: '6%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/pol-logo.png" alt="People Of Lisbon" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', flexShrink: 0 }} />
                    <div>
                      <div style={{ color: '#fff', fontWeight: 800, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>Club People Of Lisbon</div>
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
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #1a0000 0%, #4a0000 50%, #1a0000 100%)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
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
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px', fontWeight: 700, letterSpacing: '1px' }}>CLUB PEOPLE OF LISBON</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-stone-400 text-xs mb-6">Tap card to flip</p>

        <button
          onClick={saveCard}
          className="w-full py-4 bg-ink text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Save Card to Camera Roll
        </button>

        <p className="text-center text-stone-400 text-xs mt-4 leading-relaxed">
          Show this card at partner venues around Lisbon for member discounts.
        </p>
      </div>
    </div>
  );
}
