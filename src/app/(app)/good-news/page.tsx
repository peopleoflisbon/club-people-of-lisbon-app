import { createServerClient } from '@/lib/supabase';
import GoodNewsClient from '@/components/goodnews/GoodNewsClient';

export const metadata = { title: 'Good News · People Of Lisbon' };

export default async function GoodNewsPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session!.user.id;

  // BUG FIX: use explicit foreign key hint for author join
  const { data: posts } = await supabase
    .from('good_news_posts')
    .select(`
      id, title, body, category, link_url,
      is_published, is_featured, created_at, updated_at,
      author_profile_id,
      author:profiles!good_news_posts_author_profile_id_fkey(
        id, full_name, avatar_url, headline
      )
    `)
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  return <GoodNewsClient posts={(posts || []) as any} userId={userId} />;
}
