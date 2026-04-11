'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';

interface Entry {
  user_id: string;
  score: number;
  profile: { full_name: string; avatar_url: string };
}

export default function TileLeaderboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tile-leaderboard')
      .then(r => r.json())
      .then(d => { setEntries(d.entries || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-2xl text-ink">Tile Smashers</h2>
        <Link href="/break-tiles" className="text-sm font-semibold text-brand hover:underline">Play →</Link>
      </div>
      <div className="bg-white border border-stone-100 divide-y divide-stone-50">
        {loading ? (
          <p className="text-stone-400 text-sm text-center py-4">Loading…</p>
        ) : entries.length === 0 ? (
          <div className="px-4 py-4 text-center">
            <p className="text-stone-500 text-sm">No scores yet — be the first to smash some tiles!</p>
            <Link href="/break-tiles" className="text-brand text-sm font-semibold mt-1 inline-block hover:underline">Play Break The Tiles →</Link>
          </div>
        ) : (
          entries.slice(0, 5).map((entry, i) => (
            <div key={entry.user_id} className="flex items-center gap-3 px-4 py-3">
              <span className="w-8 text-center flex-shrink-0">
                {i < 3 ? <span className="text-lg">{medals[i]}</span> : <span className="font-display text-stone-400">#{i + 1}</span>}
              </span>
              <Avatar src={entry.profile?.avatar_url} name={entry.profile?.full_name} size="sm" className="flex-shrink-0" />
              <p className="flex-1 font-semibold text-sm text-ink truncate">{entry.profile?.full_name}</p>
              <p className="font-display text-xl text-ink flex-shrink-0">{entry.score.toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
