import { Suspense } from 'react';
import InviteClient from './InviteClient';

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink flex items-center justify-center text-stone-500 text-sm">Loading…</div>}>
      <InviteClient />
    </Suspense>
  );
}
