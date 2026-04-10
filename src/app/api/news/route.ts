import { NextResponse } from 'next/server';

// Portuguese news RSS feeds
const FEEDS = [
  { url: 'https://www.rtp.pt/noticias/rss', name: 'RTP Notícias' },
  { url: 'https://feeds.observador.pt/observador', name: 'Observador' },
  { url: 'https://www.dn.pt/rss/feed.aspx', name: 'Diário de Notícias' },
  { url: 'https://www.publico.pt/api/rss', name: 'Público' },
  { url: 'https://www.theportugalnews.com/rss', name: 'The Portugal News' },
];

function extractText(str: string) {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .trim();
}

function getTagContent(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? extractText(match[1]) : '';
}

function getLinkContent(xml: string): string {
  // Try plain link tag first
  const plain = xml.match(/<link>([^<]+)<\/link>/i);
  if (plain) return plain[1].trim();
  // Try CDATA link
  const cdata = xml.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/i);
  if (cdata) return cdata[1].trim();
  // Try atom link
  const atom = xml.match(/<link[^>]+href="([^"]+)"/i);
  if (atom) return atom[1].trim();
  return '';
}

export async function GET() {
  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; POL-App/1.0)',
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
        next: { revalidate: 1800 },
      });

      if (!res.ok) continue;

      const xml = await res.text();
      const itemMatch = xml.match(/<item[^>]*>([\s\S]*?)<\/item>/i);
      if (!itemMatch) continue;

      const item = itemMatch[1];
      const title = getTagContent(item, 'title');
      const link = getLinkContent(item);
      const description = getTagContent(item, 'description') || getTagContent(item, 'summary');

      if (title && title.length > 5) {
        return NextResponse.json({
          title,
          link: link || `https://www.theportugalnews.com`,
          description: description.slice(0, 300),
          source: feed.name,
        });
      }
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: 'No news available' }, { status: 404 });
}
