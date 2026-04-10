import { createServerClient } from '@/lib/supabase-server';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import ScrollPage from '@/components/ui/ScrollPage';

export const metadata = { title: 'Leaderboard · People Of Lisbon' };

export default async function LeaderboardPage() {
  const supabase = createServerClient();

  const { data: kudos } = await (supabase as any)
    .from('kudos')
    .select('recipient_id');

  const counts: Record<string, number> = {};
  (kudos || []).forEach((k: any) => {
    counts[k.recipient_id] = (counts[k.recipient_id] || 0) + 1;
  });

  const { data: profiles } = await (supabase as any)
    .from('profiles')
    .select('id, full_name, avatar_url, headline, job_title, neighborhood')
    .eq('is_active', true)
    .not('avatar_url', 'is', null)
    .neq('avatar_url', '')
    .not('full_name', 'is', null)
    .neq('full_name', '');

  const ranked = (profiles || [])
    .map((p: any) => ({ ...p, kudos: counts[p.id] || 0 }))
    .sort((a: any, b: any) => b.kudos - a.kudos);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <ScrollPage>
      <div className="max-w-2xl mx-auto">
        <div className="px-5 lg:px-8 py-8 lg:py-10" style={{ backgroundImage: 'url(/sidebar-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 className="font-display text-white text-3xl lg:text-4xl leading-none">Leaderboard</h1>
            <p className="text-stone-400 text-sm mt-1">the totally pointless People Of Lisbon leaderboard thats just for fun</p>
          </div>
        </div>

        <div className="px-4 lg:px-8 py-5 space-y-2">
          {ranked.map((member: any, i: number) => (
            <Link key={member.id} href={`/members/${member.id}`}
              className="flex items-center gap-4 bg-white border border-stone-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 text-center flex-shrink-0">
                {i < 3
                  ? <span className="text-2xl">{medals[i]}</span>
                  : <span className="font-display text-xl text-stone-400">#{i + 1}</span>}
              </div>
              <Avatar src={member.avatar_url} name={member.full_name} size="lg" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg text-ink leading-tight">{member.full_name}</p>
                {member.job_title && <p className="text-brand text-sm font-semibold">{member.job_title}</p>}
                {member.neighborhood && <p className="text-stone-400 text-xs mt-0.5">{member.neighborhood}</p>}
              </div>
              <div className="flex-shrink-0 text-center">
                <p className="font-display text-3xl text-ink leading-none">{member.kudos}</p>
                <p className="text-stone-400 text-xs mt-0.5">👍 points</p>
              </div>
            </Link>
          ))}
          {ranked.length === 0 && (
            <div className="text-center py-16 text-stone-400">
              <p className="text-4xl mb-3">👍</p>
              <p className="font-semibold text-ink">No points yet</p>
              <p className="text-sm mt-1">Visit a member's profile and give them a thumbs up!</p>
            </div>
          )}
        </div>
      </div>
    </ScrollPage>
  );
}
