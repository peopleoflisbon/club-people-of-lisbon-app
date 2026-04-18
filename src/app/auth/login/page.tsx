'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const FALLBACK_BG = 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=85';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bgImage, setBgImage] = useState(FALLBACK_BG);
  const [logoUrl, setLogoUrl] = useState('/pol-logo.png');
  const [bgLoaded, setBgLoaded] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');

  useEffect(() => {
    supabase.from('app_settings').select('key, value').then(({ data }) => {
      (data || []).forEach((row: any) => {
        if (row.key === 'login_background_image_url' && row.value) setBgImage(row.value);
        if ((row.key === 'brand_square_image_url' || row.key === 'logo_url') && row.value) setLogoUrl(row.value);
      });
    });
  }, []); // eslint-disable-line

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError('Incorrect email or password.');
      setLoading(false);
    } else {
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', data.user.id).single();
      const firstName = (profile as any)?.full_name?.split(' ')[0] || '';
      setWelcomeName(firstName);
      setTimeout(() => { router.push('/home'); router.refresh(); }, 1400);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: `${window.location.origin}/auth/confirm`,
    });
    setForgotSent(true);
    setForgotLoading(false);
  }

  // Welcome flash screen
  if (welcomeName) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.55))' }} />
        <div className="relative z-10 text-center px-6">
          <img src={logoUrl} alt="People Of Lisbon" className="w-14 h-14 object-contain mx-auto mb-5 opacity-90"
            onError={(e) => { (e.target as HTMLImageElement).src = '/pol-logo.png'; }} />
          <p className="text-white/60 text-xs uppercase tracking-widest mb-2 font-medium">Welcome back</p>
          <h1 className="font-display text-white" style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', letterSpacing: '0.02em' }}>{welcomeName}</h1>
          <p className="text-white/50 text-sm mt-3 italic">(Bem-vindo de volta)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col">

      {/* ── Full-bleed background image ── */}
      <div className="absolute inset-0 z-0" style={{ background: '#1a1a18' }}>
        <img
          src={bgImage}
          alt=""
          className={cn('absolute inset-0 w-full h-full object-cover transition-opacity duration-1500', bgLoaded ? 'opacity-100' : 'opacity-0')}
          onLoad={() => setBgLoaded(true)}
        />
        {/* LP-style soft gradient — bottom-weighted for readability, not heavy */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0.65) 75%, rgba(0,0,0,0.80) 100%)'
        }} />
      </div>

      {/* ── Top: Logo + location pill ── */}
      <div className="relative z-10 flex items-start justify-between px-6 pt-12 pb-0 lg:px-12 lg:pt-14">
        <img
          src={logoUrl}
          alt="People Of Lisbon"
          className="w-11 h-11 object-contain"
          onError={(e) => { (e.target as HTMLImageElement).src = '/pol-logo.png'; }}
        />
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <span style={{ color: '#E6B75C', fontSize: '8px' }}>●</span>
          <span className="text-white text-xs font-semibold tracking-wide">LISBON</span>
        </div>
      </div>

      {/* ── Middle: Brand statement ── */}
      <div className="relative z-10 flex-1 flex items-end lg:items-center px-6 lg:px-12 pb-8 lg:pb-0">
        <div className="hidden lg:block">
          <h1 className="font-display text-white leading-none mb-5"
            style={{ fontSize: 'clamp(3.5rem, 6vw, 6rem)', letterSpacing: '0.02em' }}>
            Good to<br />see you.
          </h1>
          <p className="text-white/70 text-lg font-light" style={{ maxWidth: '28ch', lineHeight: 1.5 }}>
            Lisbon's most interesting people, all in one place.
          </p>
        </div>
      </div>

      {/* ── Bottom: Form panel ── */}
      <div className="relative z-10 w-full px-4 pb-10 pt-6 lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-[420px] lg:flex lg:items-center lg:p-12">

        {/* Mobile header */}
        <div className="lg:hidden text-center mb-8">
          <h1 className="font-display text-white text-5xl leading-none mb-3" style={{ letterSpacing: '0.02em' }}>
            Good to see you.
          </h1>
          <p className="text-white/65 text-sm font-light" style={{ lineHeight: 1.55 }}>
            Lisbon's most interesting people,<br />all in one place.
          </p>
        </div>

        {/* Glass form panel */}
        <div className="w-full rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(250, 248, 244, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.3)',
          }}>
          <div className="p-7 lg:p-8">
            {!showForgot ? (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-0.5" style={{ color: '#1C1C1C' }}>Sign in</h2>
                  <p className="text-sm" style={{ color: '#A89A8C' }}>Private members only.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4" noValidate>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#A89A8C' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      autoComplete="email"
                      autoCapitalize="none"
                      style={{
                        width: '100%', padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1.5px solid #E8E0D4',
                        background: '#FFFFFF',
                        color: '#1C1C1C',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      placeholder="your@email.com"
                      onFocus={e => { e.target.style.borderColor = '#2F6DA5'; e.target.style.boxShadow = '0 0 0 3px rgba(47,109,165,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#E8E0D4'; e.target.style.boxShadow = 'none'; }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#A89A8C' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      autoComplete="current-password"
                      style={{
                        width: '100%', padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1.5px solid #E8E0D4',
                        background: '#FFFFFF',
                        color: '#1C1C1C',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      placeholder="••••••••"
                      onFocus={e => { e.target.style.borderColor = '#2F6DA5'; e.target.style.boxShadow = '0 0 0 3px rgba(47,109,165,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#E8E0D4'; e.target.style.boxShadow = 'none'; }}
                      required
                    />
                  </div>

                  {error && (
                    <div className="text-sm px-4 py-3 rounded-lg" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    style={{
                      width: '100%', padding: '13px',
                      borderRadius: '10px',
                      background: loading || !email || !password ? '#93B5D4' : '#2F6DA5',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      letterSpacing: '0.04em',
                      border: 'none',
                      cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s, transform 0.1s',
                      marginTop: '4px',
                    }}
                    onMouseEnter={e => { if (!loading && email && password) (e.target as HTMLElement).style.background = '#1E4E7A'; }}
                    onMouseLeave={e => { if (!loading && email && password) (e.target as HTMLElement).style.background = '#2F6DA5'; }}
                  >
                    {loading ? 'Signing in…' : 'Enter'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowForgot(true); setForgotEmail(email); }}
                    className="w-full text-center text-sm font-medium mt-1 py-1 transition-colors"
                    style={{ color: '#A89A8C' }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = '#2F6DA5'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = '#A89A8C'; }}
                  >
                    Forgot password?
                  </button>
                </form>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setShowForgot(false); setForgotSent(false); }}
                  className="flex items-center gap-1.5 text-sm font-medium mb-5 transition-colors"
                  style={{ color: '#A89A8C' }}
                >
                  ← Back
                </button>
                <h2 className="text-xl font-semibold mb-1" style={{ color: '#1C1C1C' }}>Reset password</h2>
                <p className="text-sm mb-6" style={{ color: '#A89A8C' }}>We'll send a link to your email.</p>

                {forgotSent ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: '#EEF4FA' }}>
                      <svg className="w-6 h-6" style={{ color: '#2F6DA5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="font-semibold mb-1" style={{ color: '#1C1C1C' }}>Check your email</p>
                    <p className="text-xs" style={{ color: '#A89A8C' }}>Reset link sent to {forgotEmail}</p>
                  </div>
                ) : (
                  <form onSubmit={handleForgot} className="space-y-4" noValidate>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1.5px solid #E8E0D4',
                        background: '#FFFFFF',
                        color: '#1C1C1C',
                        fontSize: '15px',
                        outline: 'none',
                      }}
                      placeholder="your@email.com"
                      onFocus={e => { e.target.style.borderColor = '#2F6DA5'; e.target.style.boxShadow = '0 0 0 3px rgba(47,109,165,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#E8E0D4'; e.target.style.boxShadow = 'none'; }}
                      required
                    />
                    <button
                      type="submit"
                      disabled={forgotLoading || !forgotEmail}
                      style={{
                        width: '100%', padding: '13px',
                        borderRadius: '10px',
                        background: '#2F6DA5',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer',
                        opacity: forgotLoading || !forgotEmail ? 0.5 : 1,
                      }}
                    >
                      {forgotLoading ? 'Sending…' : 'Send reset link'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          {/* Bottom note */}
          <div className="px-7 pb-5 lg:px-8">
            <p className="text-xs text-center" style={{ color: '#C8BEB2' }}>By invitation only · People Of Lisbon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
