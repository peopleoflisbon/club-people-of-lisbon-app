'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function SetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [bgImage, setBgImage] = useState('https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=85');
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      } else {
        // No session - send back to login
        router.replace('/auth/login');
      }
    });
    supabase.from('app_settings').select('key, value').then(({ data }) => {
      (data || []).forEach((row: any) => {
        if (row.key === 'login_background_image_url' && row.value) setBgImage(row.value);
      });
    });
  }, []); // eslint-disable-line

  async function handleSubmit() {
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setSaving(true);
    setError('');
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setSaving(false);
    } else {
      setDone(true);
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <img src="/pol-logo.png" alt="People Of Lisbon" className="w-16 h-16 object-contain opacity-50" />
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
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${bgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setBgLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/30" />
      </div>

      {/* Left branding — desktop */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative z-10 p-12">
        <div>
          <img src="/pol-logo.png" alt="People Of Lisbon" className="w-16 h-16 object-contain" />
        </div>
        <div>
          <h1 className="font-display text-white leading-none tracking-tight mb-4" style={{ fontSize: 'clamp(3.5rem, 6vw, 5rem)', lineHeight: 0.95 }}>
            People<br />Of<br />Lisbon
          </h1>
          <p className="text-white/70 text-lg font-semibold">Lisbon's most interesting people,<br />all in one place.</p>
        </div>
        <div className="h-px bg-stone-700" />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center relative z-10 p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <img src="/pol-logo.png" alt="People Of Lisbon" className="w-20 h-20 object-contain" />
          </div>

          {!done ? (
            <div className="bg-white/[0.06] backdrop-blur-md border border-white/10 p-8 shadow-2xl">
              <h2 className="font-display text-white text-3xl leading-tight mb-1">Welcome to<br />People Of Lisbon</h2>
              <p className="text-stone-400 text-sm mb-6">Choose a password to access the club.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase tracking-widest mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="At least 8 characters"
                    autoFocus
                    className="w-full px-4 py-3.5 text-sm text-white placeholder-stone-600 bg-white/[0.06] border border-white/15 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase tracking-widest mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                    placeholder="Repeat your password"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className="w-full px-4 py-3.5 text-sm text-white placeholder-stone-600 bg-white/[0.06] border border-white/15 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all"
                  />
                </div>

                {error && (
                  <div className="text-brand text-sm bg-brand/10 border border-brand/20 px-4 py-3">{error}</div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={saving || !password || !confirm}
                  className="w-full py-4 font-bold text-sm text-white bg-brand hover:bg-brand-dark active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  {saving ? 'Creating your account…' : 'Create Password & Join'}
                </button>
              </div>
            </div>
          ) : (
            /* Congratulations screen */
            <div className="bg-white/[0.06] backdrop-blur-md border border-white/10 p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-white text-3xl leading-tight mb-3">Congratulations!</h2>
              <p className="text-stone-300 text-sm leading-relaxed mb-2">You're now a member of People Of Lisbon.</p>
              <p className="text-stone-500 text-xs mb-8">Sign in with your email and the password you just created.</p>
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full py-4 font-bold text-sm text-white bg-brand hover:bg-brand-dark active:scale-[0.98] transition-all"
              >
                Sign In to the Club →
              </button>
            </div>
          )}

          <p className="text-center text-stone-600 text-xs mt-6">By invitation only · People Of Lisbon</p>
        </div>
      </div>
    </div>
  );
}
