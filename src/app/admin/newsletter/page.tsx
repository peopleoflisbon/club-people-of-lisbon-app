export const dynamic = 'force-dynamic';

import { createServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import NewsletterClient from './NewsletterClient';

export const metadata = { title: 'Newsletter Generator · Admin · People Of Lisbon' };

export default async function NewsletterPage() {
  const supabase = createServerClient();
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const today = new Date().toISOString().split('T')[0];

  const [
    { data: latestEpisodeSetting },
    { data: recentMembers },
    { data: recommendations },
    { data: sponsors },
    { data: upcomingEvents },
    { data: memberEvents },
    { data: latestUpdate },
  ] = await Promise.all([
    supabase.from('app_settings').select('value').eq('key', 'latest_episode_url').single(),
    admin.from('profiles').select('full_name, headline, neighborhood, short_bio, avatar_url').eq('is_active', true).eq('role', 'member').order('joined_at', { ascending: false }).limit(4),
    admin.from('recommendations').select('name, category, description, neighbourhood, website_url').eq('is_active', true).order('created_at', { ascending: false }).limit(2),
    admin.from('sponsors').select('name, description, website_url').order('display_order', { ascending: true }),
    admin.from('events').select('title, starts_at, location_name, description').neq('status', 'cancelled').gte('starts_at', new Date().toISOString()).order('starts_at', { ascending: true }).limit(3),
    admin.from('member_events').select('name, event_date, event_time, location, description, submitted_by').gte('event_date', today).order('event_date', { ascending: true }).limit(3),
    admin.from('updates').select('title, content').eq('is_published', true).order('published_at', { ascending: false }).limit(1),
  ]);

  return (
    <NewsletterClient
      episodeUrl={(latestEpisodeSetting as any)?.value || ''}
      recentMembers={recentMembers || []}
      recommendations={recommendations || []}
      sponsors={sponsors || []}
      upcomingEvents={upcomingEvents || []}
      memberEvents={memberEvents || []}
      latestUpdate={latestUpdate?.[0] || null}
    />
  );
}
