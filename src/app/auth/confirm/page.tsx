'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function ConfirmPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState('');

  useEffect(() => {
    async function handleConfirm() {
      // Method 1: token in query params (our direct link approach)
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (token && type) {
        // Verify the token directly with Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any,
        });

        if (error) {
          setError('This link has expired. Please ask for a new one.');
          return;
        }

        // Successfully verified — go to set password
        router.replace('/auth/set-password');
        return;
      }

      // Method 2: hash tokens (Supabase implicit flow fallback)
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const hashType = params.get('type');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setError('This link has expired. Please ask for a new one.');
            return;
          }

          if (hashType === 'recovery' || hashType === 'invite' || hashType === 'signup') {
            router.replace('/auth/set-password');
            return;
          }

          router.replace('/home');
          return;
        }
      }

      // Method 3: already have a session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/auth/set-password');
        return;
      }

      setError('Invalid or expired link. Please ask for a new invite link.');
    }

    handleConfirm();
  }, []); // eslint-disable-line

  if (error) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center p-6 text-center">
        <img src="/pol-logo.png" alt="People Of Lisbon" className="w-16 h-16 object-contain mx-auto mb-6" />
        <h1 className="font-display text-white text-2xl mb-3">Link expired</h1>
        <p className="text-stone-400 text-sm mb-6 max-w-xs">{error}</p>
        <a href="/auth/login" className="block w-full max-w-xs py-3 bg-brand text-white text-sm font-semibold text-center">
          Back to Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="text-center">
        <img src="/pol-logo.png" alt="People Of Lisbon" className="w-16 h-16 object-contain mx-auto mb-4 opacity-80" />
        <p className="text-stone-400 text-sm">Setting up your account…</p>
      </div>
    </div>
  );
}
