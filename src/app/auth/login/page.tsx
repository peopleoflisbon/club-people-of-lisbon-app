'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const FALLBACK_BG = 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=85';
const POL_RED = '#C8102E';

type Screen = 'splash' | 'choice' | 'form' | 'forgot';

export default function GatewayPage() {
  const router = useRouter();
  const supabase = createClient();

  const [bgImage, setBgImage]   = useState(FALLBACK_BG);
  const [logoUrl, setLogoUrl]   = useState('/pol-logo.png');
  const [bgLoaded, setBgLoaded] = useState(false);
  const [screen, setScreen]     = useState<Screen>('splash');

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    supabase.from('app_settings').select('key, value').then(({ data }) => {
      (data || []).forEach((row: any) => {
        if (row.key === 'login_background_image_url' && row.value) setBgImage(row.value);
        if ((row.key === 'brand_square_image_url' || row.key === 'logo_url') && row.value) setLogoUrl(row.value);
      });
    });
  }, []); // eslint-disable-line

  // ── Auth logic — completely unchanged ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || password.length < 6) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/map-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
      await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
      if (data.role === 'map_user') { router.push('/map'); } else { router.push('/home'); }
      router.refresh();
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/confirm`,
    });
    setForgotSent(true);
    setLoading(false);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#111', overflow: 'hidden',
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* ── Background image — dynamic, changeable via app_settings ── */}
      <img src={bgImage} alt="" onLoad={() => setBgLoaded(true)} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', objectPosition: 'center top',
        opacity: bgLoaded ? 1 : 0, transition: 'opacity 0.6s ease',
      }} />

      {/* ── Overlay ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: screen === 'splash'
          ? 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.97) 100%)'
          : 'rgba(0,0,0,0.91)',
        transition: 'background 0.3s ease',
      }} />

      {/* ══════════════════════════════════
          SCREEN 1 — SPLASH / COVER
      ══════════════════════════════════ */}
      {screen === 'splash' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '0 28px calc(env(safe-area-inset-bottom) + 44px)',
        }}>
          {/* Logo */}
          <div style={{ position: 'absolute', top: 'max(env(safe-area-inset-top), 24px)', left: 24 }}>
            <img src={logoUrl} alt="People Of Lisbon"
              style={{ width: 46, height: 46, objectFit: 'contain', display: 'block' }}
              onError={(e) => { (e.target as HTMLImageElement).src = '/pol-logo.png'; }} />
          </div>

          {/* Supporting line */}
          <p style={{
            margin: '0 0 20px', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
          }}>
            Lisbon's most interesting people, all in one place.
          </p>

          {/* Main headline */}
          <h1 style={{ margin: '0 0 36px', lineHeight: 0.92, letterSpacing: '-0.03em' }}>
            <span style={{ display: 'block', fontSize: 'clamp(50px, 13vw, 70px)', fontWeight: 900, color: 'white', textTransform: 'uppercase' }}>
              Real people.
            </span>
            <span style={{ display: 'block', fontSize: 'clamp(50px, 13vw, 70px)', fontWeight: 900, textTransform: 'uppercase', margin: '6px 0' }}>
              <span style={{ background: POL_RED, color: 'white', padding: '0 8px 4px', display: 'inline-block' }}>Real stories.</span>
            </span>
            <span style={{ display: 'block', fontSize: 'clamp(50px, 13vw, 70px)', fontWeight: 900, color: 'white', textTransform: 'uppercase' }}>
              Real Lisbon.
            </span>
          </h1>

          {/* Single CTA */}
          <button onClick={() => setScreen('choice')} style={{
            width: '100%', padding: '18px 24px',
            background: POL_RED, color: 'white', border: 'none', borderRadius: 2,
            fontSize: 15, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase',
            cursor: 'pointer', boxShadow: '0 4px 28px rgba(200,16,46,0.55)',
          }}>
            Enter →
          </button>
        </div>
      )}

      {/* ══════════════════════════════════
          SCREEN 2 — CHOICE
      ══════════════════════════════════ */}
      {screen === 'choice' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '0 24px calc(env(safe-area-inset-bottom) + 32px)',
        }}>
          {/* Logo */}
          <div style={{ position: 'absolute', top: 'max(env(safe-area-inset-top), 24px)', left: 24 }}>
            <img src={logoUrl} alt="People Of Lisbon"
              style={{ width: 40, height: 40, objectFit: 'contain', display: 'block' }}
              onError={(e) => { (e.target as HTMLImageElement).src = '/pol-logo.png'; }} />
          </div>
          <button onClick={() => setScreen('splash')} style={{
            position: 'absolute', top: 'max(env(safe-area-inset-top), 28px)', right: 24,
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
          }}>← Back</button>

          {/* PATH 1 — Map */}
          <div style={{
            padding: '22px 22px',
            borderTop: `3px solid ${POL_RED}`,
            background: 'rgba(255,255,255,0.05)',
            marginBottom: 12,
          }}>
            <p style={{ margin: '0 0 3px', fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: POL_RED }}>
              Explore the map
            </p>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>
              200+ stories and video.<br />Discover Lisbon through its people.
            </p>
            <button onClick={() => setScreen('form')} style={{
              width: '100%', padding: '15px',
              background: POL_RED, color: 'white', border: 'none', borderRadius: 2,
              fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase',
              cursor: 'pointer',
            }}>
              Enter the Map →
            </button>
          </div>

          {/* PATH 2 — Members */}
          <div style={{
            padding: '22px 22px',
            borderTop: '3px solid rgba(255,255,255,0.7)',
            background: 'rgba(255,255,255,0.05)',
            marginBottom: 24,
          }}>
            <p style={{ margin: '0 0 3px', fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'white' }}>
              Members
            </p>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>
              Events, perks, membership card, discounts.
            </p>
            <a href="/auth/member-login" style={{
              display: 'block', width: '100%', padding: '15px',
              border: '2px solid rgba(255,255,255,0.5)', borderRadius: 2,
              color: 'white', textDecoration: 'none', textAlign: 'center',
              fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase',
              boxSizing: 'border-box',
            }}>
              Member Sign In →
            </a>
          </div>

          {/* Footer */}
          <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            Want to join the club?{' '}
            <a href="https://www.peopleoflisbon.com" target="_blank" rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 700, textDecoration: 'none' }}>
              peopleoflisbon.com →
            </a>
          </p>
        </div>
      )}

      {/* ══════════════════════════════════
          SCREEN 3 — MAP ACCESS FORM (unchanged logic)
      ══════════════════════════════════ */}
      {(screen === 'form' || screen === 'forgot') && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'flex-end', justifyContent: 'center', zIndex: 20,
        }}>
          <div style={{
            width: '100%', maxWidth: 480,
            background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(20px)',
            borderRadius: '16px 16px 0 0',
            padding: '20px 28px calc(env(safe-area-inset-bottom) + 28px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 20px' }} />

            {screen === 'form' ? (
              <>
                <button onClick={() => setScreen('choice')}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 14 }}>
                  ← Back
                </button>
                <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>Explore the map</h2>
                <p style={{ margin: '0 0 22px', fontSize: 13, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>No spam. Just good people.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Email</label>
                    <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
                      style={{ width: '100%', padding: '13px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, color: 'white', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Password</label>
                    <input type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
                      style={{ width: '100%', padding: '13px 44px 13px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, color: 'white', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{ position: 'absolute', right: 12, bottom: 13, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 0, fontSize: 16 }}>
                      {showPw ? '🙈' : '👁'}
                    </button>
                  </div>
                  <button type="button" onClick={() => setScreen('forgot')}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer', textAlign: 'right', padding: 0 }}>
                    Forgot password?
                  </button>
                  {error && <p style={{ fontSize: 13, color: '#f87171', margin: 0 }}>{error}</p>}
                  <button type="submit" disabled={loading || !email.trim() || password.length < 6} style={{
                    padding: '16px', background: loading ? 'rgba(200,16,46,0.5)' : POL_RED,
                    color: 'white', border: 'none', borderRadius: 3,
                    fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                    cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
                  }}>
                    {loading ? 'Entering…' : 'Enter the Map →'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <button onClick={() => setScreen('form')}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 20 }}>
                  ← Back
                </button>
                <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>Reset password</h2>
                <p style={{ margin: '0 0 22px', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Enter your email and we'll send a reset link.</p>
                {forgotSent ? (
                  <p style={{ fontSize: 14, color: '#4ade80', fontWeight: 600 }}>✓ Reset link sent — check your inbox.</p>
                ) : (
                  <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required
                      style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, color: 'white', fontSize: 15, fontFamily: 'inherit', outline: 'none' }} />
                    <button type="submit" disabled={loading} style={{ padding: '15px', background: POL_RED, color: 'white', border: 'none', borderRadius: 3, fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
                      {loading ? 'Sending…' : 'Send reset link'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
