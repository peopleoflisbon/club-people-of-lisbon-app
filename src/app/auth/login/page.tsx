'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import BrandLogo from '@/components/ui/BrandLogo';

const FALLBACK_BG = 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=85';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bgImage, setBgImage] = useState(FALLBACK_BG);
  const [brandLogo, setBrandLogo] = useState('/pol-logo.png');
  const [bgLoaded, setBgLoaded] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('key, value')
      .then(({ data }) => {
        (data || []).forEach((row: { key: string; value: string }) => {
          if (row.key === 'login_background_image_url' && row.value) setBgImage(row.value);
          if ((row.key === 'brand_square_image_url' || row.key === 'logo_url') && row.value && row.value !== '/pol-logo.png') setBrandLogo(row.value);
        });
      });
  }, []); // eslint-disable-line

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError('Incorrect email or password.');
      setLoading(false);
    } else {
      router.push('/home');
      router.refresh();
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    setForgotSent(true);
    setForgotLoading(false);
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
        {/* Lighter overlay so photo shows through more */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand/10 via-transparent to-transparent" />
      </div>

      {/* Left branding panel (desktop only) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative z-10 p-12">
        <div>
          <BrandLogo src={brandLogo} size={72} radius={18} className="shadow-2xl shadow-brand/30" />
        </div>
        <div>
          <h1 className="font-display text-white text-6xl xl:text-7xl leading-none tracking-tight mb-4">
            People Of<br />Lisbon
          </h1>
          <p className="text-stone-400 text-lg">A private club for the People Of Lisbon community.</p>
        </div>
        <div className="h-px bg-gradient-to-r from-brand via-stone-700 to-transparent" />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center relative z-10 p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo + title */}
          <div className="flex flex-col items-center mb-10 lg:hidden">
            <BrandLogo src={brandLogo} size={72} radius={18} className="shadow-xl shadow-brand/30 mb-4" />
            <h1 className="font-display text-white text-3xl leading-none tracking-tight">People Of Lisbon</h1>
            <p className="text-stone-500 text-xs mt-2 tracking-widest uppercase">Private Network</p>
          </div>

          {/* Glass form card */}
          <div className="bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">

            {!showForgot ? (
              <>
                <h2 className="font-display text-white text-xl mb-6 hidden lg:block">Sign In</h2>
                <form onSubmit={handleLogin} className="space-y-4" noValidate>
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      autoComplete="email"
                      autoCapitalize="none"
                      className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-stone-600 bg-white/[0.06] border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-all duration-200"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      autoComplete="current-password"
                      className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-stone-600 bg-white/[0.06] border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-all duration-200"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-brand text-sm bg-brand/10 border border-brand/20 rounded-xl px-4 py-3">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full py-4 rounded-xl font-semibold text-sm text-white mt-2 bg-brand hover:bg-brand-dark shadow-lg shadow-brand/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Signing in…
                      </span>
                    ) : 'Sign In'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowForgot(true); setForgotEmail(email); }}
                    className="w-full text-center text-stone-500 text-xs hover:text-stone-300 transition-colors mt-2"
                  >
                    Forgot your password?
                  </button>
                </form>
              </>
            ) : (
              <>
                <button onClick={() => { setShowForgot(false); setForgotSent(false); }} className="text-stone-500 text-xs hover:text-stone-300 transition-colors mb-4 flex items-center gap-1">
                  ← Back to sign in
                </button>
                <h2 className="font-display text-white text-xl mb-2">Reset Password</h2>
                <p className="text-stone-400 text-sm mb-6">We'll send you a link to reset your password.</p>

                {forgotSent ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-white text-sm font-semibold mb-1">Check your email</p>
                    <p className="text-stone-400 text-xs">We sent a reset link to {forgotEmail}</p>
                  </div>
                ) : (
                  <form onSubmit={handleForgot} className="space-y-4" noValidate>
                    <div>
                      <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Email</label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        autoComplete="email"
                        className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-stone-600 bg-white/[0.06] border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-all"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={forgotLoading || !forgotEmail}
                      className="w-full py-4 rounded-xl font-semibold text-sm text-white bg-brand hover:bg-brand-dark active:scale-[0.98] transition-all disabled:opacity-40"
                    >
                      {forgotLoading ? 'Sending…' : 'Send Reset Link'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          <p className="text-center text-stone-600 text-xs mt-6 leading-relaxed">
            By invitation only · Contact People Of Lisbon for access
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent z-10" />
    </div>
  );
}