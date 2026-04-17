import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import Avatar from '@/components/ui/Avatar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Tile Smashers · People Of Lisbon' };

export default async function TileLeaderboardPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data } = await admin
    .from('tile_scores')
    .select('user_id, score, profiles(full_name, avatar_url)')
    .order('score', { ascending: false })
    .limit(20);

  const board = (data || []).map((r: any) => ({
    id: r.user_id,
    full_name: r.profiles?.full_name,
    avatar_url: r.profiles?.avatar_url,
    score: r.score,
  }));

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="font-display text-3xl text-ink mb-1">Tile Smashers</h1>
        <p className="text-stone-400 text-sm mb-6">Most tiles broken in Break The Tiles</p>

        {board.length === 0 ? (
          <div className="pol-card p-6 text-center space-y-3">
            <p className="text-stone-400 text-sm">No scores yet — be the first to smash some tiles!</p>
            <Link href="/break-tiles" className="pol-btn-primary inline-block text-sm">Play Break The Tiles</Link>
          </div>
        ) : (
          <div className="pol-card divide-y divide-stone-50">
            {board.map((member, i) => (
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

        <div className="text-center mt-6">
          <Link href="/break-tiles" className="pol-btn-primary inline-block text-sm">Play Break The Tiles →</Link>
        </div>
      </div>
    </div>
  );
}
