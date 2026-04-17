import { createServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import BoardClient from './BoardClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Board · People Of Lisbon' };

export default async function BoardPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: posts } = await (supabase as any)
    .from('board_posts')
    .select('id, content, created_at, profiles(id, full_name, avatar_url, job_title)')
    .order('created_at', { ascending: false })
    .limit(50);

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', session.user.id)
    .single();

  return <BoardClient posts={posts || []} profile={profile} />;
}
