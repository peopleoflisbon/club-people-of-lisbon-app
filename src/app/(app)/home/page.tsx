import { createServerClient } from '@/lib/supabase-server';
import HomeClient from '@/components/home/HomeClient';

export const metadata = { title: 'Home · People Of Lisbon' };

export default async function HomePage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session!.user.id;

  const [
    { data: profile },
    { data: recentMembers },
    { data: upcomingEvents },
    { data: latestPhotoArr },
    { data: latestUpdateArr },
    { data: goodNews },
    { data: brandSetting },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url, neighborhood').eq('id', userId).single(),
    supabase.from('profiles')
      .select('id, full_name, avatar_url, headline, neighborhood')
      .eq('is_active', true)
      .neq('id', userId)
      .order('joined_at', { ascending: false })
      .limit(8),
    supabase.from('events')
      .select('id, title, starts_at, location_name, status')
      .eq('status', 'upcoming')
      .order('starts_at', { ascending: true })
      .limit(3),
    supabase.from('rita_photos')
      .select('id, image_url, title, caption')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .limit(1),
    supabase.from('updates')
      .select('id, title, content, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(1),
    supabase.from('good_news_posts')
      .select('id, title, body, category, is_featured, created_at, author:profiles(full_name, avatar_url)')
      .eq('is_published', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(4),
    supabase.from('app_settings').select('value').eq('key', 'brand_square_image_url').single(),
  ]);

  const brandLogoUrl = (brandSetting as any)?.value || '/pol-logo.png';

  return (
    <HomeClient
      profile={profile}
      recentMembers={recentMembers || []}
      upcomingEvents={upcomingEvents || []}
      latestPhoto={(latestPhotoArr && latestPhotoArr[0]) || null}
      latestUpdate={(latestUpdateArr && latestUpdateArr[0]) || null}
      goodNews={goodNews || []}
      brandLogoUrl={brandLogoUrl}
    />
  );
}
