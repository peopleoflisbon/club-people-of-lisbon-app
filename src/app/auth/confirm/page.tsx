'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import BrandLogo from '@/components/ui/BrandLogo';

export default function ConfirmPage() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function handleConfirm() {
      // Supabase puts tokens in the URL hash: #access_token=...&type=invite
      const hash = window.location.hash;
      
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setErrorMsg('This invite link has expired. Please ask for a new one.');
            setStatus('error');
            return;
          }

          // Invite or recovery → set password
          if (type === 'invite' || type === 'recovery' || type === 'signup') {
            router.push('/auth/set-password');
            return;
          }

          // Otherwise go home
          router.push('/home');
          return;
        }
      }

      // No hash — check if already signed in
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/home');
        return;
      }

      setErrorMsg('Invalid or expired link. Please request a new invite.');
      setStatus('error');
    }

    handleConfirm();
  }, []); // eslint-disable-line

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <BrandLogo src="/pol-logo.png" size={64} radius={0} className="mx-auto mb-6 shadow-xl shadow-brand/30" />
          <h1 className="font-display text-white text-2xl mb-3">Link expired</h1>
          <p className="text-stone-400 text-sm mb-6">{errorMsg}</p>
          <a
            href="/auth/login"
            className="block w-full py-3 bg-brand text-white text-sm font-semibold text-center"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="text-center">
        <BrandLogo src="/pol-logo.png" size={64} radius={0} className="mx-auto mb-6 shadow-xl shadow-brand/30" />
        <p className="text-stone-400 text-sm">Setting up your access…</p>
      </div>
    </div>
  );
}
