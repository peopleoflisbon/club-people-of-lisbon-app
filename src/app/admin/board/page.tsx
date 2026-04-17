import { createServerClient } from '@/lib/supabase-server';
import AdminBoardClient from './AdminBoardClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Message Board · Admin' };

export default async function AdminBoardPage() {
  const supabase = createServerClient();
  const { data: posts } = await (supabase as any)
    .from('board_posts')
    .select('id, content, created_at, profiles(full_name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(100);

  return <AdminBoardClient posts={posts || []} />;
}
