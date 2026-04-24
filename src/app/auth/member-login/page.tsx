'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const POL_RED = '#C8102E';
const CREAM   = '#F2EDE4';

export default function MemberLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [logoUrl, setLogoUrl]   = useState('/pol-logo.png');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    supabase.from('app_settings').select('key, value').then(({ data }) => {
      (data || []).forEach((row: any) => {
        if ((row.key === 'brand_square_image_url' || row.key === 'logo_url') && row.value) setLogoUrl(row.value);
      });
    });
  }, []); // eslint-disable-line

  // ── Submit (unchanged auth logic) ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError || !data.session) {
        setError('Incorrect email or password.');
        setLoading(false);
        return;
      }
      setTimeout(() => { router.push('/home'); router.refresh(); }, 1400);
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0 0 12px', background: 'none',
    border: 'none', borderBottom: `2px solid #1C1C1C`,
    color: '#1C1C1C', fontSize: 16, fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 9, fontWeight: 700,
    letterSpacing: '0.18em', textTransform: 'uppercase',
    color: '#1C1C1C', marginBottom: 8,
  };

  return (
    <div style={{ minHeight: '100dvh', background: CREAM, fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <img src={logoUrl} alt="People Of Lisbon" style={{ width: 44, height: 44, objectFit: 'contain', display: 'block' }}
          onError={(e) => { (e.target as HTMLImageElement).src = '/pol-logo.png'; }} />

        {/* MEMBERS ONLY stamp */}
        <div style={{
          border: `2.5px solid #1C1C1C`, borderRadius: 3,
          padding: '5px 9px', textAlign: 'center',
          transform: 'rotate(2deg)',
        }}>
          <p style={{ margin: 0, fontSize: 8, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1C1C1C', lineHeight: 1.3 }}>Members</p>
          <p style={{ margin: 0, fontSize: 8, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: POL_RED, lineHeight: 1.3 }}>Only</p>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, padding: '8px 28px 0', display: 'flex', flexDirection: 'column' }}>

        {!showForgot ? (
          <>
            {/* Headline */}
            <div style={{ marginBottom: 36 }}>
              <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(32px, 8vw, 44px)', fontWeight: 900, color: '#1C1C1C', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 1.0 }}>
                Welcome<br />back.
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <div style={{ height: 3, width: 32, background: POL_RED, borderRadius: 2, marginRight: 10 }} />
                <p style={{ margin: 0, fontSize: 13, color: '#1C1C1C', fontStyle: 'italic', fontWeight: 600, letterSpacing: '0.02em' }}>
                  Good people only.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div>
                <label style={labelStyle}>Email</label>
                <div style={{ position: 'relative' }}>
                  <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
                    style={{ ...inputStyle, paddingRight: 32 }} />
                  <span style={{ position: 'absolute', right: 0, bottom: 14, color: '#999', fontSize: 16 }}>⌾</span>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
                    style={{ ...inputStyle, paddingRight: 32 }} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 0, bottom: 12, background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 0, fontSize: 15 }}>
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: -16 }}>
                <button type="button" onClick={() => setShowForgot(true)}
                  style={{ background: 'none', border: 'none', fontSize: 12, color: '#666', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                  Forgot password?
                </button>
              </div>

              {error && <p style={{ fontSize: 13, color: POL_RED, margin: '-16px 0 0', fontWeight: 600 }}>{error}</p>}

              <button type="submit" disabled={loading} style={{
                padding: '17px', background: POL_RED, color: 'white', border: 'none', borderRadius: 3,
                fontSize: 13, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Signing in…' : 'Sign in →'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#D4C9BC' }} />
              <span style={{ fontSize: 11, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase' }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#D4C9BC' }} />
            </div>

            {/* Explore as guest */}
            <a href="/auth/login" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '15px', border: `2px solid #1C1C1C`, borderRadius: 3,
              color: '#1C1C1C', textDecoration: 'none',
              fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              Explore the map as a guest →
            </a>
          </>
        ) : (
          /* ── Forgot password ── */
          <>
            <button onClick={() => setShowForgot(false)} style={{ background: 'none', border: 'none', fontSize: 13, color: '#666', cursor: 'pointer', padding: 0, marginBottom: 24, textAlign: 'left' }}>← Back</button>

            <h2 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 900, color: '#1C1C1C', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>Reset password</h2>
            <p style={{ margin: '0 0 28px', fontSize: 13, color: '#666', lineHeight: 1.6 }}>Enter your email and we'll send a reset link.</p>

            {forgotSent ? (
              <div style={{ padding: '16px', background: 'rgba(200,16,46,0.08)', borderRadius: 4, border: `1px solid rgba(200,16,46,0.2)` }}>
                <p style={{ margin: 0, fontSize: 14, color: POL_RED, fontWeight: 700 }}>✓ Check your inbox — reset link sent.</p>
              </div>
            ) : (
              <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required
                    style={inputStyle} />
                </div>
                <button type="submit" disabled={loading} style={{
                  padding: '16px', background: POL_RED, color: 'white', border: 'none', borderRadius: 3,
                  fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                }}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            )}
          </>
        )}
      </div>

      {/* ── Bottom note ── */}
      <div style={{ padding: '24px 28px calc(env(safe-area-inset-bottom) + 24px)', flexShrink: 0 }}>
        <div style={{
          background: '#E8DFD0', borderRadius: 6, padding: '14px 16px',
          transform: 'rotate(-0.5deg)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <p style={{ margin: 0, fontSize: 13, color: '#1C1C1C', fontStyle: 'italic', fontWeight: 600 }}>
            No spam. Just good people. <span style={{ color: POL_RED }}>:)</span>
          </p>
        </div>
      </div>
    </div>
  );
}
