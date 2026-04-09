import { NextResponse } from 'next/server';

const FEEDS = [
  { url: 'https://www.theportugalnews.com/rss', name: 'The Portugal News' },
  { url: 'https://observador.pt/feed/', name: 'Observador' },
  { url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml', name: 'BBC News Europe' },
];

function extractText(str: string) {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .trim();
}

function getTag(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? extractText(match[1]) : '';
}

export async function GET() {
  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; POL-App/1.0)' },
        next: { revalidate: 1800 },
      });

      if (!res.ok) continue;

      const xml = await res.text();

      // Find first item
      const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/i);
      if (!itemMatch) continue;

      const item = itemMatch[1];
      const title = getTag(item, 'title');
      const link = getTag(item, 'link') || extractText(item.match(/<link>(.*?)<\/link>/i)?.[1] || '');
      const description = getTag(item, 'description') || getTag(item, 'summary');
      const pubDate = getTag(item, 'pubDate');

      if (title) {
        return NextResponse.json({
          title,
          link,
          description: description.slice(0, 400),
          source: feed.name,
          pubDate,
        });
      }
    } catch (e) {
      continue;
    }
  }

  return NextResponse.json({ error: 'No news available' }, { status: 404 });
}
