import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch The Portugal News latest page
    const res = await fetch('https://www.theportugalnews.com/latest', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; POLApp/1.0)',
        'Accept': 'text/html',
      },
      next: { revalidate: 1800 },
    });

    if (!res.ok) throw new Error('Failed to fetch');

    const html = await res.text();

    // Extract news articles - looking for h2/h3 tags with article links
    const articlePattern = /href="(https:\/\/www\.theportugalnews\.com\/news\/[^"]+)"[^>]*>[\s\S]*?<\/a>[\s\S]*?##\s+([^\n]+)/g;

    // Simpler approach: extract ## headings which are article titles on this page
    const headings = html.match(/##\s+([^\n]+)/g) || [];
    const links = html.match(/href="(https:\/\/www\.theportugalnews\.com\/news\/[^"]+)"/g) || [];

    // Get first real news headline (skip "Latest News" section header)
    const newsHeadings = headings
      .map(h => h.replace(/^##\s+/, '').trim())
      .filter(h =>
        h.length > 10 &&
        !h.includes('Support The Portugal') &&
        !h.includes('Check out the video') &&
        !h.toLowerCase().includes('subscribe') &&
        !h.includes('Load more')
      );

    const newsLinks = links
      .map(l => l.replace(/^href="/, '').replace(/"$/, ''))
      .filter(l => l.includes('/news/') && !l.endsWith('/news/'));

    if (newsHeadings.length === 0) throw new Error('No headlines found');

    const title = newsHeadings[0];
    const link = newsLinks[0] || 'https://www.theportugalnews.com/latest';

    return NextResponse.json({
      title,
      link,
      description: newsHeadings.slice(1, 3).join(' · '),
      source: 'The Portugal News',
      pubDate: new Date().toISOString(),
    });

  } catch (err) {
    // Fallback: try RSS
    try {
      const rssRes = await fetch('https://feeds.bbci.co.uk/news/world/europe/rss.xml', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 1800 },
      });
      const xml = await rssRes.text();
      const titleMatch = xml.match(/<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>/);
      const linkMatch = xml.match(/<item>[\s\S]*?<link>(.*?)<\/link>/);
      const descMatch = xml.match(/<item>[\s\S]*?<description><!\[CDATA\[(.*?)\]\]><\/description>/);

      if (titleMatch) {
        return NextResponse.json({
          title: titleMatch[1],
          link: linkMatch?.[1] || 'https://www.bbc.com/news',
          description: descMatch?.[1]?.replace(/<[^>]*>/g, '').slice(0, 300) || '',
          source: 'BBC News Europe',
        });
      }
    } catch {}

    return NextResponse.json({ error: 'No news available' }, { status: 404 });
  }
}
