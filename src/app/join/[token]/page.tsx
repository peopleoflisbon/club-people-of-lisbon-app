'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Short link redirector — /join/TOKEN redirects to /auth/confirm?token=TOKEN&type=recovery
export default function JoinPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const token = params.token as string;
    if (token) {
      router.replace(`/auth/confirm?token=${token}&type=recovery`);
    }
  }, [params.token]); // eslint-disable-line

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="text-center">
        <img src="/pol-logo.png" alt="People Of Lisbon" className="w-16 h-16 object-contain mx-auto mb-4 opacity-80" />
        <p className="text-stone-400 text-sm">Joining People Of Lisbon…</p>
      </div>
    </div>
  );
}
