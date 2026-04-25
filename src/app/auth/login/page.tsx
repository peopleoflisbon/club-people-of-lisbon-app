'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const FALLBACK_BG = 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=85';
const POL_RED = '#C8102E';

// Inline logo — never fails, zero network requests
function LogoImg({ size }: { size: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <rect width="100" height="100" rx="12" fill="#C8102E" />
        <text x="50" y="38" textAnchor="middle" fill="white" fontSize="20" fontWeight="900" fontFamily="Arial, sans-serif">PEOPLE</text>
        <text x="50" y="58" textAnchor="middle" fill="white" fontSize="20" fontWeight="900" fontFamily="Arial, sans-serif">OF</text>
        <text x="50" y="78" textAnchor="middle" fill="white" fontSize="20" fontWeight="900" fontFamily="Arial, sans-serif">LISBON</text>
      </svg>
    );
  }
  return <img src="/pol-logo.png" alt="People Of Lisbon" width={size} height={size}
    style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
    onError={() => setFailed(true)} />;
}

type Screen = 'splash' | 'choice' | 'form' | 'forgot';

export default function GatewayPage() {
  const router = useRouter();
  const supabase = createClient();

  const [bgImage, setBgImage]         = useState(FALLBACK_BG);
  const [logoUrl, setLogoUrl]         = useState('/pol-logo.png');
  const [featuredPerson, setFeaturedPerson] = useState('');
  const [bgLoaded, setBgLoaded]       = useState(false);
  const [screen, setScreen]         = useState<Screen>('splash');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    supabase.from('app_settings').select('key, value').then(({ data }) => {
      (data || []).forEach((row: any) => {
        if (row.key === 'login_background_image_url' && row.value) setBgImage(row.value);
        if ((row.key === 'brand_square_image_url' || row.key === 'logo_url') && row.value) setLogoUrl(row.value);
        if (row.key === 'splash_featured_person' && row.value) setFeaturedPerson(row.value);
      });
    });
  }, []); // eslint-disable-line

  // ── Auth logic — completely unchanged ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || password.length < 6) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/map-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error || 'Something went wrong.'); setLoading(false); return; }
      await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
      if (data.role === 'map_user') { router.push('/map'); } else { router.push('/home'); }
      router.refresh();
    } catch { setError('Connection error. Please try again.'); setLoading(false); }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/confirm` });
    setForgotSent(true); setLoading(false);
  }

  const ff = "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif";

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', overflow: 'hidden', fontFamily: ff }}>

      {/* ── Background — dynamic via app_settings ── */}
      <img src={bgImage} alt="" onLoad={() => setBgLoaded(true)} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', objectPosition: 'center top',
        opacity: bgLoaded ? 1 : 0, transition: 'opacity 0.7s ease',
      }} />

      {/* ── Cinematic overlay — lighter than before ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: screen === 'splash'
          ? 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.0) 28%, rgba(0,0,0,0.42) 58%, rgba(0,0,0,0.88) 100%)'
          : 'rgba(0,0,0,0.70)',
        transition: 'background 0.35s ease',
      }} />

      {/* ════════════════════════════════════════
          SCREEN 1 — SPLASH
      ════════════════════════════════════════ */}
      {screen === 'splash' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          alignItems: 'center',
        }}>
          {/* Inner container — max width for desktop */}
          <div style={{ width: '100%', maxWidth: 560, padding: '0 32px calc(env(safe-area-inset-bottom) + 48px)' }}>

            {/* Logo with inline SVG fallback */}
            <div style={{ position: 'absolute', top: 'max(env(safe-area-inset-top), 24px)', left: 32 }}>
              <LogoImg size={46} /></div>

            {/* Featured person — top right, editable in admin */}
            {featuredPerson && (
              <div style={{ position: 'absolute', top: 'max(env(safe-area-inset-top), 24px)', right: 32, textAlign: 'right' }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', margin: '0 0 2px' }}>Featured</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', margin: 0, maxWidth: 160, lineHeight: 1.3, textAlign: 'right' }}>{featuredPerson}</p>
              </div>
            )}

            {/* Main headline — new copy */}
            <h1 style={{ margin: '0 0 32px', lineHeight: 0.95, letterSpacing: '-0.03em' }}>
              <span style={{ display: 'block', fontSize: 'clamp(46px, 11vw, 66px)', fontWeight: 900, color: 'white' }}>
                Lisbon's most
              </span>
              <span style={{ display: 'block', fontSize: 'clamp(46px, 11vw, 66px)', fontWeight: 900 }}>
                <span style={{ background: POL_RED, color: 'white', padding: '0 8px 5px', display: 'inline-block' }}>interesting</span>
              </span>
              <span style={{ display: 'block', fontSize: 'clamp(46px, 11vw, 66px)', fontWeight: 900, color: 'white' }}>
                people, all in
              </span>
              <span style={{ display: 'block', fontSize: 'clamp(46px, 11vw, 66px)', fontWeight: 900, color: 'white' }}>
                one place.
              </span>
            </h1>

            <button onClick={() => setScreen('choice')} style={{
              width: '100%', padding: '18px 24px',
              background: POL_RED, color: 'white', border: 'none', borderRadius: 2,
              fontSize: 15, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase',
              cursor: 'pointer', boxShadow: '0 6px 32px rgba(200,16,46,0.5)',
            }}>
              Enter →
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          SCREEN 2 — CHOICE
      ════════════════════════════════════════ */}
      {screen === 'choice' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          alignItems: 'center', overflowY: 'auto',
        }}>
          <div style={{ width: '100%', maxWidth: 500, padding: '72px 24px calc(env(safe-area-inset-bottom) + 24px)' }}>

            {/* Logo + back */}
            <div style={{ position: 'fixed', top: 'max(env(safe-area-inset-top), 20px)', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 28px', zIndex: 20 }}>
              <LogoImg size={40} />
              <button onClick={() => setScreen('splash')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                ← Back
              </button>
            </div>

            {/* PATH 1 — Explore Lisbon */}
            <div style={{
              borderTop: `4px solid ${POL_RED}`,
              background: 'rgba(255,255,255,0.07)',
              padding: '20px 20px',
              marginBottom: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'white' }}>
                  Explore Lisbon
                </p>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 2, padding: '2px 6px' }}>Free</span>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>
                Discover Lisbon like never before — through 200+ real video stories of the city's most fascinating people. Step into their world, and explore the city through our interactive map.
              </p>
              <a href="/map" style={{
                display: 'block', width: '100%', padding: '15px',
                background: POL_RED, color: 'white', textDecoration: 'none', textAlign: 'center',
                border: 'none', borderRadius: 2,
                fontSize: 13, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase',
                cursor: 'pointer', boxShadow: '0 4px 20px rgba(200,16,46,0.4)',
                boxSizing: 'border-box',
              }}>
                Enter the Map →
              </a>
            </div>

            {/* PATH 2 — Join the Club */}
            <div style={{
              borderTop: '4px solid #E6B75C',
              background: 'rgba(230,183,92,0.08)',
              padding: '20px 20px',
              marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#E6B75C' }}>
                  Join the Club
                </p>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>€10 / month</span>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>
                Join 100+ members in Lisbon's most unique club. We do gatherings. We build community. You get a membership card, exclusive discounts, recommendations. And access to the People Of Lisbon network.
              </p>
              <a href="/auth/join" style={{
                display: 'block', width: '100%', padding: '15px',
                background: '#E6B75C', color: '#1C1C1C', textDecoration: 'none', textAlign: 'center',
                borderRadius: 2, fontSize: 13, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase',
                boxSizing: 'border-box',
              }}>
                Join the Club →
              </a>
            </div>

            {/* Bottom — member sign-in */}
            <div style={{ textAlign: 'center', padding: '4px 0' }}>
              <p style={{ margin: '0 0 10px', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Already a member?</p>
              <a href="/auth/member-login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 15, fontWeight: 900, color: 'white', textDecoration: 'none',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '13px 28px', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 4,
              }}>
                Member Sign In →
              </a>
            </div>

          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          SCREEN 3 — MAP FORM (auth logic unchanged)
      ════════════════════════════════════════ */}
      {(screen === 'form' || screen === 'forgot') && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'flex-end', justifyContent: 'center', zIndex: 20,
        }}>
          <div style={{
            width: '100%', maxWidth: 520,
            background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(24px)',
            borderRadius: '20px 20px 0 0',
            padding: '20px 32px calc(env(safe-area-inset-bottom) + 32px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 22px' }} />

            {screen === 'form' ? (<>
              <button onClick={() => setScreen('choice')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 16 }}>← Back</button>
              <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>Explore the map</h2>
              <p style={{ margin: '0 0 24px', fontSize: 13, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>No spam. Just good people.</p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Email</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
                    style={{ width: '100%', padding: '13px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, color: 'white', fontSize: 15, fontFamily: ff, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Password</label>
                  <input type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
                    style={{ width: '100%', padding: '13px 44px 13px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, color: 'white', fontSize: 15, fontFamily: ff, outline: 'none', boxSizing: 'border-box' }} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, bottom: 13, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 0, fontSize: 16 }}>
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
                <button type="button" onClick={() => setScreen('forgot')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer', textAlign: 'right', padding: 0 }}>
                  Forgot password?
                </button>
                {error && <p style={{ fontSize: 13, color: '#f87171', margin: 0 }}>{error}</p>}
                <button type="submit" disabled={loading || !email.trim() || password.length < 6} style={{
                  padding: '16px', background: loading ? 'rgba(200,16,46,0.5)' : POL_RED,
                  color: 'white', border: 'none', borderRadius: 3, marginTop: 4,
                  fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                  {loading ? 'Entering…' : 'Enter the Map →'}
                </button>
              </form>
            </>) : (<>
              <button onClick={() => setScreen('form')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 20 }}>← Back</button>
              <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>Reset password</h2>
              <p style={{ margin: '0 0 22px', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Enter your email and we'll send a reset link.</p>
              {forgotSent ? (
                <p style={{ fontSize: 14, color: '#4ade80', fontWeight: 600 }}>✓ Reset link sent — check your inbox.</p>
              ) : (
                <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required
                    style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, color: 'white', fontSize: 15, fontFamily: ff, outline: 'none' }} />
                  <button type="submit" disabled={loading} style={{ padding: '15px', background: POL_RED, color: 'white', border: 'none', borderRadius: 3, fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    {loading ? 'Sending…' : 'Send reset link'}
                  </button>
                </form>
              )}
            </>)}
          </div>
        </div>
      )}
    </div>
  );
}
