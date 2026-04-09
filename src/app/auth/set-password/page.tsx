'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import BrandLogo from '@/components/ui/BrandLogo';

export default function SetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Confirm there is an active session before showing the form
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      } else {
        router.push('/auth/login');
      }
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
      router.push('/home');
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <BrandLogo src="/pol-logo.png" size={64} radius={0} className="shadow-xl shadow-brand/30" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-8">
          <BrandLogo src="/pol-logo.png" size={72} radius={0} className="mb-5 shadow-xl shadow-brand/30" />
          <h1 className="font-display text-white text-3xl text-center leading-tight">Welcome to<br />People Of Lisbon</h1>
          <p className="text-stone-400 text-sm mt-3 text-center">Choose a password to access the club.</p>
        </div>

        <div className="bg-white/[0.04] border border-white/10 p-6 space-y-4">
          <div>
            <label className="block text-stone-400 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="At least 8 characters"
              className="w-full bg-white/10 border border-white/10 px-4 py-3 text-white placeholder-stone-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-stone-400 text-xs font-semibold uppercase tracking-wider mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(''); }}
              placeholder="Repeat your password"
              className="w-full bg-white/10 border border-white/10 px-4 py-3 text-white placeholder-stone-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && (
            <p className="text-brand text-xs text-center bg-brand/10 border border-brand/20 px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving || !password || !confirm}
            className="w-full bg-brand hover:bg-brand-dark disabled:opacity-40 text-white font-semibold py-4 text-sm transition-all active:scale-[0.98]"
          >
            {saving ? 'Setting up your account…' : 'Enter the Club'}
          </button>
        </div>

        <p className="text-center text-stone-600 text-xs mt-6">
          People Of Lisbon · Private Members Club
        </p>
      </div>
    </div>
  );
}
