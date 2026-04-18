'use client';

import { useState } from 'react';

interface Props {
  recipientId: string;
  initialCount: number;
  isOwnProfile: boolean;
  inline?: boolean;
}

export default function KudosButton({ recipientId, initialCount, isOwnProfile, inline }: Props) {
  const [count, setCount] = useState(initialCount);
  const [bumping, setBumping] = useState(false);
  const [floaters, setFloaters] = useState<number[]>([]);

  async function giveKudos() {
    if (isOwnProfile) return;
    setCount(c => c + 1);
    setBumping(true);
    setTimeout(() => setBumping(false), 300);
    const id = Date.now();
    setFloaters(f => [...f, id]);
    setTimeout(() => setFloaters(f => f.filter(x => x !== id)), 1000);
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

  if (inline) {
    return (
      <div className="flex items-center gap-3 relative">
        {floaters.map(id => (
          <span key={id} className="absolute pointer-events-none font-bold text-base"
            style={{ right: '54px', top: '-8px', color: '#2F6DA5', animation: 'floatUp 1s ease-out forwards' }}>
            +1
          </span>
        ))}
        <div className="text-right">
          <p className="text-3xl font-bold leading-none" style={{ color: '#1C1C1C' }}>{count}</p>
          <p className="text-xs mt-0.5" style={{ color: '#A89A8C' }}>points</p>
        </div>
        <button
          onClick={giveKudos}
          disabled={isOwnProfile}
          title={isOwnProfile ? "You can't vote for yourself!" : 'Tap to give kudos!'}
          className={`text-4xl select-none ${isOwnProfile ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-150'}`}
          style={{
            transform: bumping ? 'scale(1.5)' : 'scale(1)',
            transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          👍
        </button>
        <style>{`@keyframes floatUp { 0% { opacity:1; transform:translateY(0); } 100% { opacity:0; transform:translateY(-40px); } }`}</style>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-5 relative overflow-visible"
      style={{ background: '#FFFFFF', border: '1px solid #EDE7DC', borderRadius: '10px' }}>
      {floaters.map(id => (
        <span key={id} className="absolute pointer-events-none font-bold text-lg"
          style={{ left: '70px', top: '8px', color: '#2F6DA5', animation: 'floatUp 1s ease-out forwards' }}>
          +1
        </span>
      ))}
      <button
        onClick={giveKudos}
        disabled={isOwnProfile}
        title={isOwnProfile ? "You can't vote for yourself!" : 'Tap to vote!'}
        className={`text-5xl select-none ${isOwnProfile ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        style={{
          transform: bumping ? 'scale(1.5)' : 'scale(1)',
          transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        👍
      </button>
      <div>
        <p className="text-4xl font-bold leading-none" style={{ color: '#1C1C1C' }}>{count}</p>
        <p className="text-xs mt-1" style={{ color: '#A89A8C' }}>
          {isOwnProfile ? 'Your kudos score' : 'Tap to vote!'}
        </p>
      </div>
      <style>{`@keyframes floatUp { 0% { opacity:1; transform:translateY(0); } 100% { opacity:0; transform:translateY(-40px); } }`}</style>
    </div>
  );
}
