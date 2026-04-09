export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import BrandLogo from '@/components/ui/BrandLogo';

const FALLBACK_BG = 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=85';

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const supabase = createClient();

  const [invite, setInvite] = useState<{ email: string } | null>(null);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [invalidToken, setInvalidToken] = useState(false);
  const [bgImage, setBgImage] = useState(FALLBACK_BG);
  const [brandLogo, setBrandLogo] = useState('/pol-logo.png');

  useEffect(() => {
    // Fetch settings
    supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['login_background_image_url', 'brand_square_image_url'])
      .then(({ data }) => {
        (data || []).forEach((row: { key: string; value: string }) => {
          if (row.key === 'login_background_image_url' && row.value) setBgImage(row.value);
          if (row.key === 'brand_square_image_url' && row.value) setBrandLogo(row.value);
        });
      });

    // Validate token
    if (!token) {
      setInvalidToken(true);
      setLoading(false);
      return;
    }

    supabase
      .from('invitations')
      .select('email, status, expires_at')
      .eq('token', token)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data || data.status !== 'pending' || new Date(data.expires_at) < new Date()) {
          setInvalidToken(true);
        } else {
          setInvite({ email: data.email });
        }
        setLoading(false);
      });
  }, []); // eslint-disable-line

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!invite || !fullName.trim() || password.length < 8) return;
    setSubmitting(true);
    setError('');

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: invite.email,
        password,
        options: { data: { full_name: fullName.trim() } },
      });
      if (signUpError) throw signUpError;

      await supabase
        .from('invitations')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('token', token);

      router.push('/home');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/90 via-ink/70 to-ink/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand/15 via-transparent to-transparent" />
      </div>
      <div className="relative z-10 w-full max-w-sm mx-auto px-6 py-10">
        {children}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent z-10" />
    </div>
  );

  if (loading) {
    return (
      <Wrapper>
        <div className="text-center text-stone-500 text-sm">Validating your invitation…</div>
      </Wrapper>
    );
  }

  if (invalidToken) {
    return (
      <Wrapper>
        <div className="text-center">
          <BrandLogo src={brandLogo} size={64} radius={16} className="mx-auto mb-5 shadow-xl shadow-brand/30" />
          <h2 className="font-display text-white text-2xl mb-3">Invalid Invitation</h2>
          <p className="text-stone-400 text-sm leading-relaxed">
            This invitation link is invalid or has expired.
            <br />Contact People Of Lisbon for a new invite.
          </p>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="text-center mb-8">
        <BrandLogo src={brandLogo} size={64} radius={16} className="mx-auto mb-5 shadow-xl shadow-brand/30" />
        <h1 className="font-display text-white text-3xl leading-none tracking-tight mb-1">You're Invited</h1>
        <p className="text-stone-500 text-sm mt-2">Welcome to People Of Lisbon</p>
        <p className="text-stone-400 text-xs mt-1">{invite?.email}</p>
        <div className="mt-5 h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent" />
      </div>

      <div className="bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
              Your Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-stone-600 bg-white/[0.06] border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-all duration-200"
              placeholder="Ana Rodrigues"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
              Create Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-stone-600 bg-white/[0.06] border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-all duration-200"
              placeholder="Min. 8 characters"
              minLength={8}
              required
            />
            {password.length > 0 && password.length < 8 && (
              <p className="text-xs text-amber-400 mt-1.5">Must be at least 8 characters</p>
            )}
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
            disabled={submitting || !fullName.trim() || password.length < 8}
            className="w-full py-4 rounded-xl font-semibold text-sm text-white mt-2 bg-brand hover:bg-brand-dark shadow-lg shadow-brand/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account…
              </span>
            ) : 'Join People Of Lisbon'}
          </button>
        </form>
      </div>

      <p className="text-center text-stone-600 text-xs mt-6">
        You can complete your profile after joining.
      </p>
    </Wrapper>
  );
}
