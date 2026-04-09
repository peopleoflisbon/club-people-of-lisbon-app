import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get RSS feed URL from Apple iTunes API
    const itunesRes = await fetch(
      'https://itunes.apple.com/lookup?id=1748466846&entity=podcast',
      { next: { revalidate: 3600 } }
    );
    const itunesData = await itunesRes.json();
    const feedUrl = itunesData?.results?.[0]?.feedUrl;

    if (!feedUrl) {
      return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
    }

    // Fetch and parse the RSS feed
    const rssRes = await fetch(feedUrl, { next: { revalidate: 3600 } });
    const rssText = await rssRes.text();

    // Parse latest episode from XML
    const getTag = (xml: string, tag: string) => {
      const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i'));
      return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
    };

    const getAttr = (xml: string, tag: string, attr: string) => {
      const match = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i'));
      return match ? match[1] : '';
    };

    // Get show artwork from channel level
    const showArtwork = getAttr(rssText, 'itunes:image', 'href') || '';

    // Get first (latest) item
    const itemMatch = rssText.match(/<item>([\s\S]*?)<\/item>/i);
    if (!itemMatch) {
      return NextResponse.json({ error: 'No episodes found' }, { status: 404 });
    }

    const item = itemMatch[1];
    const title = getTag(item, 'title');
    const description = getTag(item, 'itunes:summary') || getTag(item, 'description');
    const audioUrl = getAttr(item, 'enclosure', 'url');
    const episodeArtwork = getAttr(item, 'itunes:image', 'href') || showArtwork;
    const pubDate = getTag(item, 'pubDate');
    const duration = getTag(item, 'itunes:duration');

    return NextResponse.json({
      title,
      description: description.replace(/<[^>]*>/g, '').slice(0, 300),
      audioUrl,
      artwork: episodeArtwork,
      pubDate,
      duration,
      appleUrl: 'https://podcasts.apple.com/us/podcast/people-of-lisbon/id1748466846',
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch podcast' }, { status: 500 });
  }
}
