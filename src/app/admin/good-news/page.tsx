import { createServerClient } from '@/lib/supabase-server';
import AdminGoodNewsClient from '@/components/admin/AdminGoodNewsClient';

export const metadata = { title: 'Good News · Admin · People Of Lisbon' };

export default async function AdminGoodNewsPage() {
  const supabase = createServerClient();
  const { data: posts } = await (supabase as any)
    .from('good_news_posts')
    .select('*, author:profiles(full_name, avatar_url)')
    .order('created_at', { ascending: false });

  return <AdminGoodNewsClient posts={posts || []} />;
}
