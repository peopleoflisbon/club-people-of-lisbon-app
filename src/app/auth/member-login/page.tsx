'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const POL_RED = '#C8102E';
const ff      = "'SF UI Display', -apple-system, BlinkMacSystemFont, sans-serif";
const FALLBACK_BG = 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=85';

export default function MemberLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [bgImage, setBgImage]       = useState(FALLBACK_BG);
  const [bgLoaded, setBgLoaded]     = useState(false);
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
        if (row.key === 'login_background_image_url' && row.value) setBgImage(row.value);
      });
    });
  }, []); // eslint-disable-line

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
    width: '100%', padding: '13px 14px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.18)',
    color: 'white', fontSize: 15, fontFamily: ff,
    outline: 'none', boxSizing: 'border-box', borderRadius: 4,
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 9, fontWeight: 700,
    letterSpacing: '0.18em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)', marginBottom: 8, fontFamily: ff,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', fontFamily: ff, overflow: 'hidden' }}>

      {/* Background image */}
      <img
        src={bgImage}
        alt=""
        onLoad={() => setBgLoaded(true)}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center top',
          transition: 'opacity 0.6s ease',
          opacity: bgLoaded ? 1 : 0,
        }}
      />

      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', flex: 1, padding: '0 28px' }}>

          {/* Back button */}
          <div style={{ paddingTop: 'max(env(safe-area-inset-top), 20px)', paddingBottom: 16, display: 'flex', justifyContent: 'flex-start' }}>
            <a href="/auth/login" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
              ← Back
            </a>
          </div>

          {/* Main content */}
          <div style={{ flex: 1, paddingTop: 20 }}>

            {!showForgot ? (<>
              {/* Headline */}
              <div style={{ marginBottom: 36 }}>
                <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(32px, 8vw, 44px)', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 1.0 }}>
                  Welcome<br />back.
                </h1>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ height: 3, width: 28, background: POL_RED, borderRadius: 2, marginRight: 10, flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', fontWeight: 500, lineHeight: 1.4 }}>
                    Lisbon's most interesting people, all in one place.
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPw ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
                      style={{ ...inputStyle, paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0, fontSize: 15 }}>
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8 }}>
                  <button type="button" onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', fontSize: 12, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0, fontWeight: 600, fontFamily: ff }}>
                    Forgot password?
                  </button>
                </div>
                {error && <p style={{ fontSize: 13, color: '#f87171', margin: '-8px 0 0', fontWeight: 600 }}>{error}</p>}
                <button type="submit" disabled={loading} style={{
                  padding: '17px', background: POL_RED, color: 'white', border: 'none', borderRadius: 2,
                  fontSize: 13, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: ff,
                }}>
                  {loading ? 'Signing in…' : 'Sign In →'}
                </button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
              </div>

              {/* Explore as guest */}
              <a href="/auth/login" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '15px', border: '2px solid rgba(255,255,255,0.25)', borderRadius: 2,
                color: 'white', textDecoration: 'none',
                fontSize: 12, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: ff,
              }}>
                Explore the Map as a Guest →
              </a>

              {/* Join link */}
              <p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                Not a member yet?{' '}
                <a href="/auth/join"
                  style={{ color: '#E6B75C', fontWeight: 700, textDecoration: 'none' }}>
                  Join The Club →
                </a>
              </p>
            </>) : (<>
              {/* Forgot password */}
              <button onClick={() => setShowForgot(false)} style={{ background: 'none', border: 'none', fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0, marginBottom: 24, textAlign: 'left', fontFamily: ff }}>← Back</button>
              <h2 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 900, color: 'white', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>Reset Password</h2>
              <p style={{ margin: '0 0 28px', fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>Enter your email and we'll send a reset link.</p>
              {forgotSent ? (
                <div style={{ padding: '16px', background: 'rgba(200,16,46,0.15)', borderRadius: 4, border: '1px solid rgba(200,16,46,0.4)' }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#f87171', fontWeight: 700 }}>Check your inbox — reset link sent.</p>
                </div>
              ) : (
                <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
                  </div>
                  <button type="submit" disabled={loading} style={{ padding: '16px', background: POL_RED, color: 'white', border: 'none', borderRadius: 2, fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: ff }}>
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </form>
              )}
            </>)}
          </div>

          <div style={{ height: 'calc(env(safe-area-inset-bottom) + 32px)', flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}
