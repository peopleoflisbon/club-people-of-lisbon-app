'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const FALLBACK_BG = 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=85';

type Mode = 'landing' | 'signup' | 'signin' | 'forgot' | 'forgot-sent';

export default function GatewayPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>('landing');
  const [bgImage, setBgImage] = useState(FALLBACK_BG);
  const [logoUrl, setLogoUrl] = useState('/pol-logo.png');
  const [bgLoaded, setBgLoaded] = useState(false);

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    supabase.from('app_settings').select('key, value').then(({ data }) => {
      (data || []).forEach((row: any) => {
        if (row.key === 'login_background_image_url' && row.value) setBgImage(row.value);
        if (row.key === 'brand_square_image_url' && row.value) setLogoUrl(row.value);
      });
    });
  }, []); // eslint-disable-line

  function reset(m: Mode) { setMode(m); setError(''); setPassword(''); setConfirm(''); }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');

    try {
      const res = await fetch('/api/auth/map-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error || 'Could not create account.'); setLoading(false); return; }
      await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
      router.push('/map'); router.refresh();
    } catch { setError('Connection error. Please try again.'); setLoading(false); }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err || !data.session) { setError('Incorrect email or password.'); setLoading(false); return; }
    const role = data.user?.user_metadata?.role;
    router.push(role === 'map_user' ? '/map' : '/home'); router.refresh();
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: `${window.location.origin}/auth/set-password`,
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setMode('forgot-sent'); setLoading(false);
  }

  // ── shared input style ────────────────────────────────
  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.07)',
    color: '#fff', fontSize: 15, fontFamily: 'inherit', outline: 'none',
  };
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 10, fontWeight: 700,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)', marginBottom: 6,
  };
  const focus = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = 'rgba(255,255,255,0.4)'; };
  const blur  = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col">

      {/* ── Full-bleed background ── */}
      <div className="absolute inset-0" style={{ background: '#0a0a0f' }}>
        <img src={bgImage} alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${bgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setBgLoaded(true)} />
        {/* Cinematic gradient — deep at bottom where panel sits */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.82) 70%, rgba(0,0,0,0.96) 100%)'
        }} />
        {/* Subtle vignette */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 30% 50%, transparent 40%, rgba(0,0,0,0.4) 100%)'
        }} />
      </div>

      {/* ── Logo ── */}
      <div className="relative z-10 px-6 pt-10 lg:px-12 lg:pt-12">
        <img src={logoUrl} alt="People Of Lisbon"
          style={{ width: 42, height: 42, objectFit: 'contain' }}
          onError={(e) => { (e.target as HTMLImageElement).src = '/pol-logo.png'; }} />
      </div>

      {/* ── Tagline — left side on desktop, above panel on mobile ── */}
      <div className="relative z-10 flex-1 flex items-end lg:items-center px-6 pb-8 lg:px-12 lg:pb-0">
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 12 }}>
            People Of Lisbon
          </p>
          <h1 className="text-white font-bold" style={{
            fontSize: 'clamp(1.7rem, 4vw, 2.8rem)', lineHeight: 1.15,
            maxWidth: '16ch', textShadow: '0 2px 16px rgba(0,0,0,0.5)',
            letterSpacing: '-0.01em',
          }}>
            Lisbon's most interesting people, all in one place.
          </h1>
          {mode === 'landing' && (
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginTop: 12, fontWeight: 400 }}>
              Discover Lisbon through its people.
            </p>
          )}
        </div>
      </div>

      {/* ── Auth panel ── */}
      <div className="relative z-10 w-full lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-[420px] lg:flex lg:items-center lg:p-12">
        <div className="w-full" style={{
          background: 'rgba(6,6,10,0.72)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: '20px 20px 0 0',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ padding: '28px 28px 32px' }}>

            {/* ── LANDING ── */}
            {mode === 'landing' && (
              <>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 18 }}>
                  Free to explore
                </p>

                <button onClick={() => reset('signup')}
                  style={{
                    width: '100%', padding: '15px 20px',
                    background: '#2F6DA5', color: 'white',
                    fontSize: 16, fontWeight: 700, borderRadius: 12, border: 'none',
                    cursor: 'pointer', letterSpacing: '0.01em',
                    boxShadow: '0 4px 28px rgba(47,109,165,0.45)',
                  }}>
                  Enter the Map →
                </button>

                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', textAlign: 'center', marginTop: 10 }}>
                  Create a free account to access the interactive map.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>or</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                </div>

                <button onClick={() => reset('signin')}
                  style={{
                    width: '100%', padding: '13px 20px',
                    background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)',
                    fontSize: 14, fontWeight: 600, borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer',
                  }}>
                  Sign in to your account
                </button>

                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
                  <a href="/auth/member-login"
                    style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}
                    onMouseEnter={e => { (e.currentTarget).style.color = 'rgba(255,255,255,0.55)'; }}
                    onMouseLeave={e => { (e.currentTarget).style.color = 'rgba(255,255,255,0.25)'; }}>
                    Full member? Sign in here →
                  </a>
                </div>
              </>
            )}

            {/* ── SIGN UP ── */}
            {mode === 'signup' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <button onClick={() => reset('landing')}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 22, padding: 0, lineHeight: 1 }}>
                    ←
                  </button>
                  <p style={{ fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.92)', margin: 0 }}>Create your account</p>
                </div>

                <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={lbl}>Email</label>
                    <input type="email" value={email} required onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder="your@email.com" style={inp} onFocus={focus} onBlur={blur}
                      autoComplete="email" autoCapitalize="none" />
                  </div>
                  <div>
                    <label style={lbl}>Password</label>
                    <input type="password" value={password} required minLength={6}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="At least 6 characters" style={inp} onFocus={focus} onBlur={blur}
                      autoComplete="new-password" />
                  </div>
                  <div>
                    <label style={lbl}>Confirm password</label>
                    <input type="password" value={confirm} required minLength={6}
                      onChange={e => { setConfirm(e.target.value); setError(''); }}
                      placeholder="Repeat your password" style={inp} onFocus={focus} onBlur={blur}
                      autoComplete="new-password" />
                  </div>

                  {error && <div style={{ fontSize: 13, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.25)' }}>{error}</div>}

                  <button type="submit" disabled={loading}
                    style={{ width: '100%', padding: 14, background: loading ? 'rgba(47,109,165,0.4)' : '#2F6DA5', color: 'white', fontSize: 15, fontWeight: 700, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}>
                    {loading ? 'Creating account…' : 'Enter the Map →'}
                  </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                  Already have an account?{' '}
                  <button onClick={() => reset('signin')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0 }}>
                    Sign in
                  </button>
                </p>
              </>
            )}

            {/* ── SIGN IN ── */}
            {mode === 'signin' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <button onClick={() => reset('landing')}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 22, padding: 0, lineHeight: 1 }}>
                    ←
                  </button>
                  <p style={{ fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.92)', margin: 0 }}>Sign in</p>
                </div>

                <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={lbl}>Email</label>
                    <input type="email" value={email} required onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder="your@email.com" style={inp} onFocus={focus} onBlur={blur}
                      autoComplete="email" autoCapitalize="none" />
                  </div>
                  <div>
                    <label style={lbl}>Password</label>
                    <input type="password" value={password} required onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="••••••••" style={inp} onFocus={focus} onBlur={blur}
                      autoComplete="current-password" />
                  </div>

                  {error && <div style={{ fontSize: 13, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.25)' }}>{error}</div>}

                  <button type="submit" disabled={loading}
                    style={{ width: '100%', padding: 14, background: loading ? 'rgba(47,109,165,0.4)' : '#2F6DA5', color: 'white', fontSize: 15, fontWeight: 700, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}>
                    {loading ? 'Signing in…' : 'Sign In →'}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button onClick={() => reset('forgot')}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 13, padding: 0 }}>
                    Forgot password?
                  </button>
                </div>
                <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                  New here?{' '}
                  <button onClick={() => reset('signup')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0 }}>
                    Create account
                  </button>
                </p>
              </>
            )}

            {/* ── FORGOT PASSWORD ── */}
            {mode === 'forgot' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <button onClick={() => reset('signin')}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 22, padding: 0, lineHeight: 1 }}>
                    ←
                  </button>
                  <p style={{ fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.92)', margin: 0 }}>Reset password</p>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20, lineHeight: 1.6 }}>
                  Enter your email and we'll send you a reset link.
                </p>

                <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={lbl}>Email</label>
                    <input type="email" value={forgotEmail} required onChange={e => { setForgotEmail(e.target.value); setError(''); }}
                      placeholder="your@email.com" style={inp} onFocus={focus} onBlur={blur}
                      autoComplete="email" />
                  </div>
                  {error && <div style={{ fontSize: 13, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.25)' }}>{error}</div>}
                  <button type="submit" disabled={loading}
                    style={{ width: '100%', padding: 14, background: loading ? 'rgba(47,109,165,0.4)' : '#2F6DA5', color: 'white', fontSize: 15, fontWeight: 700, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            )}

            {/* ── FORGOT SENT ── */}
            {mode === 'forgot-sent' && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>✉️</div>
                <p style={{ fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 8 }}>Check your email</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20, lineHeight: 1.6 }}>
                  We sent a reset link to <strong style={{ color: 'rgba(255,255,255,0.65)' }}>{forgotEmail}</strong>
                </p>
                <button onClick={() => reset('signin')}
                  style={{ background: 'none', border: 'none', color: '#2F6DA5', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  ← Back to sign in
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
