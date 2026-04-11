import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export async function POST() {
  try {
    // Verify admin
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if ((profile as any)?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch YouTube channel page to get video IDs
    const channelUrl = 'https://www.youtube.com/@peopleoflisbon/videos';
    const res = await fetch(channelUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Could not fetch YouTube channel' }, { status: 500 });
    }

    const html = await res.text();

    // Extract video IDs and titles from YouTube's initial data
    const dataMatch = html.match(/var ytInitialData = ({.+?});<\/script>/s);
    if (!dataMatch) {
      return NextResponse.json({ error: 'Could not parse YouTube data' }, { status: 500 });
    }

    let videos: { videoId: string; title: string; url: string; thumbnail: string }[] = [];

    try {
      const data = JSON.parse(dataMatch[1]);
      // Navigate YouTube's complex data structure
      const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
      for (const tab of tabs) {
        const content = tab?.tabRenderer?.content;
        const richGrid = content?.richGridRenderer?.contents || content?.sectionListRenderer?.contents;
        if (!richGrid) continue;

        for (const item of richGrid) {
          const videoRenderer = item?.richItemRenderer?.content?.videoRenderer;
          if (!videoRenderer?.videoId) continue;
          const videoId = videoRenderer.videoId;
          const title = videoRenderer.title?.runs?.[0]?.text || videoRenderer.title?.simpleText || '';
          if (videoId && title) {
            videos.push({
              videoId,
              title,
              url: `https://www.youtube.com/watch?v=${videoId}`,
              thumbnail: getThumbnail(videoId),
            });
          }
        }
      }
    } catch (parseErr) {
      // Fallback: regex scrape for video IDs
      const videoMatches = html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"[^}]*?"text":"([^"]+)"/g);
      const seen = new Set<string>();
      for (const match of videoMatches) {
        const [, videoId, title] = match;
        if (!seen.has(videoId) && title.length > 3) {
          seen.add(videoId);
          videos.push({
            videoId,
            title,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnail: getThumbnail(videoId),
          });
        }
      }
    }

    if (videos.length === 0) {
      return NextResponse.json({ error: 'No videos found. YouTube may be blocking the request.' }, { status: 404 });
    }

    // Get existing pins to avoid duplicates
    const admin = adminClient();
    const { data: existing } = await admin.from('map_pins').select('youtube_url');
    const existingUrls = new Set((existing || []).map((p: any) => p.youtube_url));

    // Insert new pins (unpublished, centered on Lisbon until location is added)
    const toInsert = videos
      .filter(v => !existingUrls.has(v.url))
      .map(v => ({
        title: v.title,
        youtube_url: v.url,
        thumbnail_url: v.thumbnail,
        latitude: 38.7223,
        longitude: -9.1393,
        is_published: false,
        featured_person: '',
        neighborhood: '',
        description: '',
      }));

    if (toInsert.length === 0) {
      return NextResponse.json({ imported: 0, message: 'All videos already imported' });
    }

    const { error } = await admin.from('map_pins').insert(toInsert);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ imported: toInsert.length, total: videos.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
