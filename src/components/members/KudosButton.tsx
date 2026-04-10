'use client';

import { useState } from 'react';

interface Props {
  recipientId: string;
  initialCount: number;
  isOwnProfile: boolean;
}

export default function KudosButton({ recipientId, initialCount, isOwnProfile }: Props) {
  const [count, setCount] = useState(initialCount);
  const [bumping, setBumping] = useState(false);
  const [floaters, setFloaters] = useState<number[]>([]);

  async function giveKudos() {
    if (isOwnProfile) return;

    // Optimistic update
    setCount(c => c + 1);
    setBumping(true);
    setTimeout(() => setBumping(false), 300);

    // Add floating +1
    const id = Date.now();
    setFloaters(f => [...f, id]);
    setTimeout(() => setFloaters(f => f.filter(x => x !== id)), 1000);

    // Save to DB
    try {
      const res = await fetch('/api/kudos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId }),
      });
      const data = await res.json();
      if (data.total !== undefined) setCount(data.total);
    } catch {}
  }

  return (
    <div className="flex items-center gap-4 bg-white border border-stone-100 p-5 relative overflow-visible">
      {/* Floating +1s */}
      {floaters.map(id => (
        <span
          key={id}
          className="absolute text-brand font-display text-xl pointer-events-none"
          style={{
            left: '60px',
            top: '10px',
            animation: 'floatUp 1s ease-out forwards',
          }}
        >
          +1
        </span>
      ))}

      <button
        onClick={giveKudos}
        disabled={isOwnProfile}
        title={isOwnProfile ? "You can't give yourself kudos!" : 'Give kudos!'}
        className={`text-5xl transition-transform select-none ${bumping ? 'scale-150' : 'scale-100'} ${isOwnProfile ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-125 active:scale-150'}`}
        style={{ transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        👍
      </button>

      <div>
        <p className="font-display text-4xl text-ink leading-none">{count}</p>
        <p className="text-stone-400 text-xs mt-1">
          {isOwnProfile ? 'Your kudos score' : 'Tap to give kudos'}
        </p>
      </div>

      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-40px); }
        }
      `}</style>
    </div>
  );
}
