'use client';

import { useState } from 'react';
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

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <BrandLogo src="/pol-logo.png" size={64} radius={16} className="mb-4 shadow-xl shadow-brand/30" />
          <h1 className="font-display text-white text-2xl text-center">Welcome to People Of Lisbon</h1>
          <p className="text-stone-400 text-sm mt-2 text-center">Set your password to get started.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-stone-400 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-stone-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/40 transition-all"
            />
          </div>

          <div>
            <label className="block text-stone-400 text-xs font-semibold uppercase tracking-wider mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-stone-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/40 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving || !password || !confirm}
            className="w-full bg-brand hover:bg-brand/90 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all duration-200 active:scale-[0.98]"
          >
            {saving ? 'Setting up your account…' : 'Enter the Club'}
          </button>
        </div>
      </div>
    </div>
  );
}
