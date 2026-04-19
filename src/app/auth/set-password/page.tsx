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

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event — fired when user clicks reset link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
      if (event === 'SIGNED_IN' && session) {
        setReady(true);
      }
    });

    // Also check if session already exists (e.g. page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setSaving(true);
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setSaving(false);
    } else {
      setDone(true);
      // Sign out so they sign in fresh with new password
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
      }, 2500);
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.07)',
    color: '#fff', fontSize: 15, outline: 'none', fontFamily: 'inherit',
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
      style={{ background: '#0a0a0f' }}>
      <div className="absolute inset-0 opacity-30"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(47,109,165,0.4), transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="text-center mb-8">
          <img src="/pol-logo.png" alt="People Of Lisbon" style={{ width: 44, height: 44, objectFit: 'contain', margin: '0 auto 16px' }} />
          {!done && (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Set new password</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Choose a new password for your account.</p>
            </>
          )}
        </div>

        {!ready && !done && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            <div style={{ width: 24, height: 24, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#2F6DA5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            Verifying reset link…
          </div>
        )}

        {ready && !done && (
          <form onSubmit={handleSubmit}
            style={{ background: 'rgba(6,6,10,0.8)', backdropFilter: 'blur(20px)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: '28px 24px' }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
                New password
              </label>
              <input type="password" value={password} required minLength={6}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="At least 6 characters" style={inp}
                onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                autoFocus />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
                Confirm password
              </label>
              <input type="password" value={confirm} required minLength={6}
                onChange={e => { setConfirm(e.target.value); setError(''); }}
                placeholder="Repeat your password" style={inp}
                onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }} />
            </div>

            {error && (
              <div style={{ fontSize: 13, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.25)', marginBottom: 14 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={saving || !password || !confirm}
              style={{ width: '100%', padding: 14, background: saving ? 'rgba(47,109,165,0.4)' : '#2F6DA5', color: 'white', fontSize: 15, fontWeight: 700, borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Updating…' : 'Set New Password →'}
            </button>
          </form>
        )}

        {done && (
          <div style={{ textAlign: 'center', background: 'rgba(6,6,10,0.8)', backdropFilter: 'blur(20px)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: '32px 24px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Password updated</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Redirecting you to sign in…</p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
