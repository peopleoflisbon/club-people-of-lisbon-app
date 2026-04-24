'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const FALLBACK_BG = 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=85';
const POL_RED = '#C8102E';

export default function GatewayPage() {
  const router = useRouter();
  const supabase = createClient();

  const [bgImage, setBgImage]   = useState(FALLBACK_BG);
  const [logoUrl, setLogoUrl]   = useState('/pol-logo.png');
  const [bgLoaded, setBgLoaded] = useState(false);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showForm, setShowForm] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    supabase.from('app_settings').select('key, value').then(({ data }) => {
      (data || []).forEach((row: any) => {
        if (row.key === 'login_background_image_url' && row.value) setBgImage(row.value);
        if ((row.key === 'brand_square_image_url' || row.key === 'logo_url') && row.value) setLogoUrl(row.value);
      });
    });
  }, []); // eslint-disable-line

  // ── Submit (unchanged auth logic) ──
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
    <div style={{ position: 'fixed', inset: 0, background: '#111', overflow: 'hidden', fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* ── Background image ── */}
      <img
        src={bgImage}
        alt=""
        onLoad={() => setBgLoaded(true)}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center top',
          opacity: bgLoaded ? 1 : 0, transition: 'opacity 0.6s ease',
        }}
      />

      {/* ── Gradient overlay: dark at top + heavy at bottom ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.95) 100%)',
      }} />

      {/* ── Logo ── */}
      <div style={{ position: 'absolute', top: 'max(env(safe-area-inset-top), 20px)', left: 20, zIndex: 20 }}>
        <img src={logoUrl} alt="People Of Lisbon" style={{ width: 44, height: 44, objectFit: 'contain', display: 'block' }}
          onError={(e) => { (e.target as HTMLImageElement).src = '/pol-logo.png'; }} />
      </div>

      {/* ── Member login link top right ── */}
      <div style={{ position: 'absolute', top: 'max(env(safe-area-inset-top), 20px)', right: 20, zIndex: 20 }}>
        <a href="/auth/member-login" style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'white', textDecoration: 'none', padding: '7px 12px',
          border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 4,
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)',
        }}>
          Members →
        </a>
      </div>

      {/* ── Main content: landing or form ── */}
      {!showForm && !showForgot ? (
        /* ── Landing: editorial magazine cover ── */
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end', zIndex: 10,
          padding: '0 20px calc(env(safe-area-inset-bottom) + 28px)',
        }}>

          {/* ── Top label sticker — positioned in upper area ── */}
          <div style={{
            position: 'absolute', top: 'max(env(safe-area-inset-top), 20px)', left: 20, right: 20,
            display: 'flex', justifyContent: 'center', pointerEvents: 'none',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)',
              padding: '5px 12px', borderRadius: 2,
              transform: 'rotate(-0.8deg)',
            }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#111' }}>
                Lisbon's most interesting people, all in one place.
              </span>
            </div>
          </div>

          {/* ── Map feature sticker ── */}
          <div style={{
            background: 'white', padding: '10px 14px', marginBottom: 14,
            transform: 'rotate(-0.5deg)', alignSelf: 'flex-start',
            boxShadow: '0 3px 12px rgba(0,0,0,0.35)',
            borderLeft: `5px solid ${POL_RED}`,
            maxWidth: 260,
          }}>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: POL_RED, lineHeight: 1.4 }}>Explore the map</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 900, color: '#111', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.1 }}>200+ stories<br />& video</p>
            <p style={{ margin: '4px 0 0', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555' }}>Discover Lisbon through its people</p>
          </div>

          {/* ── Main headline ── */}
          <h1 style={{ margin: '0 0 4px', lineHeight: 0.92, letterSpacing: '-0.03em' }}>
            <span style={{ display: 'block', fontSize: 'clamp(44px, 11vw, 62px)', fontWeight: 900, color: 'white', textTransform: 'uppercase' }}>Real people.</span>
            <span style={{ display: 'inline-block', fontSize: 'clamp(44px, 11vw, 62px)', fontWeight: 900, color: 'white', textTransform: 'uppercase', background: POL_RED, padding: '0 6px', marginBottom: 2 }}>Real stories.</span>
            <span style={{ display: 'block', fontSize: 'clamp(44px, 11vw, 62px)', fontWeight: 900, color: 'white', textTransform: 'uppercase' }}>Real Lisbon.</span>
          </h1>

          {/* ── Club feature sticker ── */}
          <div style={{
            background: '#F5F1E8', padding: '10px 14px', margin: '18px 0 16px',
            transform: 'rotate(0.4deg)', alignSelf: 'flex-end',
            boxShadow: '0 3px 12px rgba(0,0,0,0.3)',
            borderLeft: `5px solid #1C1C1C`,
            maxWidth: 240,
          }}>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#111', lineHeight: 1.4 }}>Join the club</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 900, color: '#111', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.1 }}>100+ Members</p>
            <p style={{ margin: '4px 0 0', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#555' }}>Events · Discounts · Membership card</p>
            <a href="https://www.peopleoflisbon.com" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: 6, fontSize: 9, fontWeight: 800, color: POL_RED, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Want to join? peopleoflisbon.com →
            </a>
          </div>

          {/* ── CTAs ── */}
          <button onClick={() => setShowForm(true)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '17px 24px', marginBottom: 10,
            background: POL_RED, color: 'white', border: 'none', borderRadius: 2,
            fontSize: 14, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(200,16,46,0.5)',
          }}>
            Enter the Map →
          </button>

          <a href="/auth/member-login" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', padding: '14px 24px',
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
            color: 'rgba(255,255,255,0.75)', border: '1.5px solid rgba(255,255,255,0.25)',
            borderRadius: 2, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Member sign in
          </a>
        </div>

      ) : showForgot ? (
        /* ── Forgot password ── */
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 20 }}>
          <div style={{
            width: '100%', maxWidth: 480,
            background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(20px)',
            borderRadius: '16px 16px 0 0', padding: '28px 28px calc(env(safe-area-inset-bottom) + 32px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <button onClick={() => setShowForgot(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 20 }}>← Back</button>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>Reset password</h2>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Enter your email and we'll send you a reset link.</p>
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
          </div>
        </div>

      ) : (
        /* ── Sign in / Sign up form ── */
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 20 }}>
          <div style={{
            width: '100%', maxWidth: 480,
            background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(20px)',
            borderRadius: '16px 16px 0 0', padding: '28px 28px calc(env(safe-area-inset-bottom) + 28px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {/* Drag handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 24px' }} />

            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 16 }}>← Back</button>

            <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>Explore the map</h2>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>No spam. Just good people.</p>

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

              <button type="button" onClick={() => setShowForgot(true)}
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

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>— or —</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <a href="/auth/member-login" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.05em' }}>
                Already a member? Sign in →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
