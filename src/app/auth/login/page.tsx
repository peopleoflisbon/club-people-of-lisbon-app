'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const TAGLINE = "Lisbon's most interesting people, all in one place.";
const TAGLINE_PT = "(As pessoas mais interessantes de Lisboa, todas num só lugar.)";
const FALLBACK_BG = 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=85';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bgImage, setBgImage] = useState(FALLBACK_BG);
  const [logoUrl, setLogoUrl] = useState('/pol-logo.png');  const [bgLoaded, setBgLoaded] = useState(false);
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

  // Welcome screen
  if (welcomeName) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ink">
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-ink/60" />
        <div className="relative z-10 text-center px-6">
          {logoUrl && <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain mx-auto mb-6" />}
          <p className="text-stone-400 text-sm uppercase tracking-widest mb-1 font-semibold">Welcome back</p>
          <p className="text-stone-500 text-xs mb-3 italic">(Bem-vindo de volta)</p>
          <h1 className="font-display text-white text-5xl">{welcomeName}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-stretch overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-ink">
        <img
          src={bgImage}
          alt=""
          className={cn('absolute inset-0 w-full h-full object-cover transition-opacity duration-1000', bgLoaded ? 'opacity-100' : 'opacity-0')}
          onLoad={() => setBgLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-ink/20" />
      </div>

      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative z-10 p-12">
        <div>
          <img src={logoUrl} alt="People Of Lisbon" className="w-16 h-16 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).src = '/pol-logo.png'; }} />
        </div>
        <div>
          <h1 className="font-display text-white leading-none tracking-tight mb-6" style={{ fontSize: 'clamp(3.5rem, 6vw, 5rem)', lineHeight: 0.95 }}>
            People<br />Of<br />Lisbon
          </h1>
          <p className="text-white text-lg font-semibold leading-snug mb-1">{TAGLINE}</p>
          <p className="text-stone-400 text-sm italic">{TAGLINE_PT}</p>
        </div>
        <div className="h-px bg-stone-700" />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center relative z-10 p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo only - no text */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <img src={logoUrl} alt="People Of Lisbon" className="w-24 h-24 object-contain mb-4"
              onError={(e) => { (e.target as HTMLImageElement).src = '/pol-logo.png'; }} />
          </div>

          {/* Form card */}
          <div className="bg-white/[0.06] backdrop-blur-md border border-white/10 p-8 shadow-2xl">
            {!showForgot ? (
              <>
                <h2 className="font-display text-white text-2xl mb-6 hidden lg:block">Sign In</h2>
                <form onSubmit={handleLogin} className="space-y-4" noValidate>
                  <div>
                    <label className="block text-xs font-bold text-stone-300 uppercase tracking-widest mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      autoComplete="email"
                      autoCapitalize="none"
                      className="w-full px-4 py-3.5 text-sm text-white placeholder-stone-500 bg-white/[0.06] border border-white/15 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-all"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-300 uppercase tracking-widest mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      autoComplete="current-password"
                      className="w-full px-4 py-3.5 text-sm text-white placeholder-stone-500 bg-white/[0.06] border border-white/15 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {error && (
                    <div className="text-brand text-sm bg-brand/10 border border-brand/20 px-4 py-3">{error}</div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full py-4 font-bold text-sm text-white mt-2 bg-brand hover:bg-brand-dark shadow-lg shadow-brand/25 active:scale-[0.98] transition-all disabled:opacity-40"
                  >
                    {loading ? 'Signing in…' : 'Sign In'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowForgot(true); setForgotEmail(email); }}
                    className="w-full text-center text-white font-semibold text-sm hover:text-white/80 transition-colors mt-1 py-1"
                  >
                    Forgot your password?
                  </button>
                </form>
              </>
            ) : (
              <>
                <button onClick={() => { setShowForgot(false); setForgotSent(false); }} className="text-stone-300 text-sm font-semibold hover:text-white transition-colors mb-5 flex items-center gap-1">
                  ← Back to sign in
                </button>
                <h2 className="font-display text-white text-2xl mb-2">Reset Password</h2>
                <p className="text-stone-300 text-sm mb-6">Enter your email and we'll send a reset link.</p>
                {forgotSent ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-white text-sm font-bold mb-1">Check your email</p>
                    <p className="text-stone-400 text-xs">Reset link sent to {forgotEmail}</p>
                  </div>
                ) : (
                  <form onSubmit={handleForgot} className="space-y-4" noValidate>
                    <div>
                      <label className="block text-xs font-bold text-stone-300 uppercase tracking-widest mb-2">Email</label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full px-4 py-3.5 text-sm text-white placeholder-stone-500 bg-white/[0.06] border border-white/15 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-all"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={forgotLoading || !forgotEmail}
                      className="w-full py-4 font-bold text-sm text-white bg-brand hover:bg-brand-dark active:scale-[0.98] transition-all disabled:opacity-40"
                    >
                      {forgotLoading ? 'Sending…' : 'Send Reset Link'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          <p className="text-center text-stone-600 text-xs mt-6">By invitation only · People Of Lisbon</p>
        </div>
      </div>
    </div>
  );
}
