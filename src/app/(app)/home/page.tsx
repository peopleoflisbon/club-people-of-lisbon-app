import { createServerClient } from '@/lib/supabase-server';
import HomeClient from '@/components/home/HomeClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata = { title: 'Home · People Of Lisbon' };

export default async function HomePage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session!.user.id;

  // Fetch events — try with image_url, fall back without it
  let upcomingEvents: any[] = [];
  const { data: eventsWithImage, error: eventsError } = await (supabase as any)
    .from('events')
    .select('id, title, starts_at, location_name, status, cover_image_url')
    .in('status', ['upcoming', 'live'])
    .gt('starts_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString())
    .order('starts_at', { ascending: true })
    .limit(3);

  if (!eventsError) {
    upcomingEvents = (eventsWithImage || []).map((e: any) => ({ ...e, image_url: e.cover_image_url }));
  } else {
    // image_url column missing — fetch without it
    const { data: eventsBasic } = await supabase
      .from('events')
      .select('id, title, starts_at, location_name, status')
      .in('status', ['upcoming', 'live'])
      .gt('starts_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString())
      .order('starts_at', { ascending: true })
      .limit(3);
    upcomingEvents = eventsBasic || [];
  }

  const [
    { data: profile },
    { data: recentMembers },
    { data: latestPhotoArr },
    { data: latestUpdateArr },
    { data: brandSetting },
    { data: episodeSetting },
    { data: latestRecArr },
    { data: nextMemberEventArr },
    { data: latestOfferArr },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url, neighborhood').eq('id', userId).single(),
    supabase.from('profiles')
      .select('id, full_name, avatar_url, headline, neighborhood, joined_at')
      .eq('is_active', true)
      .neq('id', userId)
      .not('avatar_url', 'is', null).neq('avatar_url', '')
      .not('full_name', 'is', null).neq('full_name', '')
      .order('joined_at', { ascending: false })
      .limit(1),
    supabase.from('rita_photos')
      .select('id, image_url, title, caption')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .limit(1),
    supabase.from('updates')
      .select('id, title, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(1),
    supabase.from('app_settings').select('value').eq('key', 'brand_square_image_url').single(),
    supabase.from('app_settings').select('value').eq('key', 'latest_episode_url').single(),
    (supabase as any).from('recommendations').select('id, name, category, neighbourhood, image_url').eq('is_active', true).not('image_url', 'is', null).neq('image_url', '').limit(20),
    (supabase as any).from('member_events').select('id, name, event_date, event_time, location, submitted_by').gte('event_date', new Date().toISOString().split('T')[0]).order('event_date', { ascending: true }).limit(1),
    (supabase as any).from('membership_offers').select('id, title, partner_name, cta_url').eq('is_active', true).order('display_order', { ascending: true }),
  ]);

  const { data: stephenProfile } = await (supabase as any)
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('role', 'admin')
    .limit(1)
    .single();

  const brandLogoUrl = (brandSetting as any)?.value || '/pol-logo.png';
  const latestEpisodeUrl = (episodeSetting as any)?.value || '';
  const recList = latestRecArr || [];
  // Pick a different rec based on current minute so it changes regularly without Math.random() hydration issues
  const latestRec = recList.length > 0 ? recList[Math.floor(Date.now() / 60000) % recList.length] : null;

  const nextMemberEvent = nextMemberEventArr?.[0] || null;
  const offerList = latestOfferArr || [];
  const latestOffer = offerList.length > 0 ? offerList[Math.floor(Date.now() / 60000) % offerList.length] : null;

  return (
    <HomeClient
      profile={profile}
      recentMembers={recentMembers || []}
      upcomingEvents={upcomingEvents}
      latestPhoto={(latestPhotoArr && latestPhotoArr[0]) || null}
      latestUpdate={(latestUpdateArr && latestUpdateArr[0]) || null}
      stephenProfile={stephenProfile || null}
      brandLogoUrl={brandLogoUrl}
      latestEpisodeUrl={latestEpisodeUrl}
      latestRec={latestRec}
      nextMemberEvent={nextMemberEvent}
      latestOffer={latestOffer}
    />
  );
}
