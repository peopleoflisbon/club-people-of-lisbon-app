'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const POL_RED = '#C8102E';
const CREAM   = '#F2EDE4';
const ff      = "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif";

export default function MemberLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [logoUrl, setLogoUrl]       = useState('/pol-logo.png');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    supabase.from('app_settings').select('key, value').then(({ data }) => {
      (data || []).forEach((row: any) => {
        if ((row.key === 'brand_square_image_url' || row.key === 'logo_url') && row.value) setLogoUrl(row.value);
      });
    });
  }, []); // eslint-disable-line

  // ── Auth logic — unchanged ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError || !data.session) { setError('Incorrect email or password.'); setLoading(false); return; }
      setTimeout(() => { router.push('/home'); router.refresh(); }, 1400);
    } catch { setError('Connection error. Please try again.'); setLoading(false); }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/confirm` });
    setForgotSent(true); setLoading(false);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0 0 12px', background: 'none',
    border: 'none', borderBottom: '2px solid #1C1C1C',
    color: '#1C1C1C', fontSize: 16, fontFamily: ff,
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 9, fontWeight: 700,
    letterSpacing: '0.18em', textTransform: 'uppercase',
    color: '#666', marginBottom: 8,
  };

  return (
    <div style={{ minHeight: '100dvh', background: CREAM, fontFamily: ff, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* ── Header ── */}
        <div style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          {/* Logo — also a back link */}
          <a href="/auth/login" style={{ display: 'block', lineHeight: 0 }}>
            <img src={logoUrl} alt="People Of Lisbon"
              style={{ width: 44, height: 44, objectFit: 'contain', display: 'block' }}
              onError={(e) => { (e.target as HTMLImageElement).src = '/pol-logo.png'; }} />
          </a>

          {/* Back button */}
          <a href="/auth/login" style={{
            fontSize: 12, fontWeight: 700, color: '#888', textDecoration: 'none',
            letterSpacing: '0.05em',
          }}>
            ← Back
          </a>
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, padding: '4px 28px 0', display: 'flex', flexDirection: 'column' }}>

          {!showForgot ? (<>
            {/* Headline */}
            <div style={{ marginBottom: 36 }}>
              <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(32px, 8vw, 44px)', fontWeight: 900, color: '#1C1C1C', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 1.0 }}>
                Welcome<br />back.
              </h1>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ height: 3, width: 28, background: POL_RED, borderRadius: 2, marginRight: 10, flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 13, color: '#555', fontStyle: 'italic', fontWeight: 500, lineHeight: 1.4 }}>
                  Lisbon's most interesting people, all in one place.
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
                </div>
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
                    style={{ ...inputStyle, paddingRight: 32 }} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 0, bottom: 12, background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 0, fontSize: 15 }}>
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -16 }}>
                <button type="button" onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', fontSize: 12, color: '#888', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                  Forgot password?
                </button>
              </div>
              {error && <p style={{ fontSize: 13, color: POL_RED, margin: '-12px 0 0', fontWeight: 600 }}>{error}</p>}
              <button type="submit" disabled={loading} style={{
                padding: '17px', background: POL_RED, color: 'white', border: 'none', borderRadius: 2,
                fontSize: 13, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Signing in…' : 'Sign in →'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#D4C9BC' }} />
              <span style={{ fontSize: 11, color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#D4C9BC' }} />
            </div>

            {/* Explore as guest */}
            <a href="/auth/login" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '15px', border: '2px solid #1C1C1C', borderRadius: 2,
              color: '#1C1C1C', textDecoration: 'none',
              fontSize: 12, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              Explore the map as a guest →
            </a>

            {/* Join link */}
            <p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: 13, color: '#888' }}>
              Not a member yet?{' '}
              <a href="https://www.peopleoflisbon.com" target="_blank" rel="noopener noreferrer"
                style={{ color: POL_RED, fontWeight: 700, textDecoration: 'none' }}>
                Join the club → peopleoflisbon.com
              </a>
            </p>
          </>) : (<>
            {/* Forgot password */}
            <button onClick={() => setShowForgot(false)} style={{ background: 'none', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer', padding: 0, marginBottom: 24, textAlign: 'left' }}>← Back</button>
            <h2 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 900, color: '#1C1C1C', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>Reset password</h2>
            <p style={{ margin: '0 0 28px', fontSize: 13, color: '#666', lineHeight: 1.6 }}>Enter your email and we'll send a reset link.</p>
            {forgotSent ? (
              <div style={{ padding: '16px', background: 'rgba(200,16,46,0.06)', borderRadius: 4, border: '1px solid rgba(200,16,46,0.2)' }}>
                <p style={{ margin: 0, fontSize: 14, color: POL_RED, fontWeight: 700 }}>✓ Check your inbox — reset link sent.</p>
              </div>
            ) : (
              <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
                </div>
                <button type="submit" disabled={loading} style={{ padding: '16px', background: POL_RED, color: 'white', border: 'none', borderRadius: 2, fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            )}
          </>)}
        </div>

        {/* ── Bottom spacer ── */}
        <div style={{ height: 'calc(env(safe-area-inset-bottom) + 32px)', flexShrink: 0 }} />
      </div>
    </div>
  );
}
