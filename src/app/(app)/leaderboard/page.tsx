import { createServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Leaderboard · People Of Lisbon' };

export default async function LeaderboardPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: profiles } = await supabase
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

  const board = (profiles || [])
    .map(p => ({ ...p, kudos: kudosMap[p.id] || 0 }))
    .filter(p => p.kudos > 0)
    .sort((a, b) => b.kudos - a.kudos)
    .slice(0, 10);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="font-display text-3xl text-ink mb-1">Leaderboard</h1>
        <p className="text-stone-400 text-sm mb-6">Members with the most kudos from the club</p>
        {board.length === 0 ? (
          <div className="pol-card p-6 text-center text-stone-400 text-sm">
            No kudos yet — go give someone a thumbs up on their profile!
          </div>
        ) : (
          <div className="pol-card divide-y divide-stone-50">
            {board.map((member, i) => (
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
      </div>
    </div>
  );
}
