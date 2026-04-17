import { createServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Leaderboard · People Of Lisbon' };

export default async function LeaderboardPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  // Kudos leaderboard
  const { data: kudosRaw } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, headline')
    .eq('is_active', true);

  const { data: kudosCounts } = await supabase
    .from('kudos')
    .select('recipient_id');

  const kudosMap: Record<string, number> = {};
  (kudosCounts || []).forEach((k: any) => {
    kudosMap[k.recipient_id] = (kudosMap[k.recipient_id] || 0) + 1;
  });

  const kudosBoard = (kudosRaw || [])
    .map(p => ({ ...p, kudos: kudosMap[p.id] || 0 }))
    .filter(p => p.kudos > 0)
    .sort((a, b) => b.kudos - a.kudos)
    .slice(0, 10);

  // Tile leaderboard via admin client
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: tileRaw } = await admin
    .from('tile_scores')
    .select('user_id, score, profiles(full_name, avatar_url)')
    .order('score', { ascending: false })
    .limit(10);

  const tileBoard = (tileRaw || []).map((r: any) => ({
    id: r.user_id,
    full_name: r.profiles?.full_name,
    avatar_url: r.profiles?.avatar_url,
    score: r.score,
  }));

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-8">

        {/* Kudos */}
        <section>
          <h1 className="font-display text-3xl text-ink mb-1">Kudos Leaderboard</h1>
          <p className="text-stone-400 text-sm mb-4">Members with the most thumbs up from the club</p>
          {kudosBoard.length === 0 ? (
            <div className="pol-card p-6 text-center text-stone-400 text-sm">
              No kudos yet — go give someone a thumbs up on their profile!
            </div>
          ) : (
            <div className="pol-card divide-y divide-stone-50">
              {kudosBoard.map((member, i) => (
                <Link key={member.id} href={`/members/${member.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-stone-50 transition-colors">
                  <span className="w-8 text-center flex-shrink-0 text-lg">
                    {i < 3 ? medals[i] : <span className="font-display text-stone-400 text-base">#{i + 1}</span>}
                  </span>
                  <Avatar src={member.avatar_url} name={member.full_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-ink">{member.full_name}</p>
                    {member.headline && <p className="text-xs text-stone-400 truncate">{member.headline}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display text-2xl text-ink">{member.kudos}</p>
                    <p className="text-xs text-stone-400">👍</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Tile Smashers */}
        <section>
          <h2 className="font-display text-3xl text-ink mb-1">Tile Smashers</h2>
          <p className="text-stone-400 text-sm mb-4">Most tiles broken in Break The Tiles</p>
          {tileBoard.length === 0 ? (
            <div className="pol-card p-6 text-center">
              <p className="text-stone-400 text-sm mb-2">No scores yet — be the first!</p>
              <Link href="/break-tiles" className="text-brand font-semibold text-sm hover:underline">Play Break The Tiles →</Link>
            </div>
          ) : (
            <div className="pol-card divide-y divide-stone-50">
              {tileBoard.map((member, i) => (
                <div key={member.id} className="flex items-center gap-4 px-4 py-3">
                  <span className="w-8 text-center flex-shrink-0 text-lg">
                    {i < 3 ? medals[i] : <span className="font-display text-stone-400 text-base">#{i + 1}</span>}
                  </span>
                  <Avatar src={member.avatar_url} name={member.full_name} size="sm" />
                  <p className="flex-1 font-semibold text-sm text-ink truncate">{member.full_name}</p>
                  <p className="font-display text-2xl text-ink flex-shrink-0">{member.score.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-3">
            <Link href="/break-tiles" className="text-brand font-semibold text-sm hover:underline">Play Break The Tiles →</Link>
          </div>
        </section>

      </div>
    </div>
  );
}
