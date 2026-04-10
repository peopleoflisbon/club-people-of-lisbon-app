import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch Lisboa Secreta homepage and extract top story
    const res = await fetch('https://lisboasecreta.co/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; POL-App/1.0; +https://peopleoflisbon.com)',
        'Accept': 'text/html',
        'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
      },
      next: { revalidate: 1800 },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    // Extract article title and link from Lisboa Secreta HTML
    // Try og:title first
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1];

    // Try to find first article headline
    const articleMatch = html.match(/<h[23][^>]*class="[^"]*(?:entry-title|post-title|article-title)[^"]*"[^>]*>\s*<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/i)
      || html.match(/<a[^>]+href="(https:\/\/lisboasecreta\.co\/[^"]+)"[^>]*class="[^"]*(?:entry-title|post-title)[^"]*"[^>]*>([^<]+)<\/a>/i)
      || html.match(/<h[23][^>]*>\s*<a[^>]+href="(https:\/\/lisboasecreta\.co\/[^"]+)"[^>]*>([^<]+)<\/a>/i);

    if (articleMatch) {
      return NextResponse.json({
        title: articleMatch[2].trim().replace(/&amp;/g, '&').replace(/&#8211;/g, '–').replace(/&#8220;/g, '"').replace(/&#8221;/g, '"'),
        link: articleMatch[1],
        source: 'Lisboa Secreta',
      });
    }

    // Fallback: use og:title
    if (ogTitle && ogTitle.toLowerCase() !== 'lisboa secreta') {
      const ogUrl = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)?.[1]
        || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/i)?.[1]
        || 'https://lisboasecreta.co';

      return NextResponse.json({
        title: ogTitle.trim(),
        link: ogUrl,
        source: 'Lisboa Secreta',
      });
    }

    // Last resort - hardcoded fallback with link to site
    return NextResponse.json({
      title: 'Discover the best of Lisbon — hidden gems, places and stories',
      link: 'https://lisboasecreta.co',
      source: 'Lisboa Secreta',
    });

  } catch (err) {
    // Return a working fallback
    return NextResponse.json({
      title: 'Explore Lisbon\'s best kept secrets and hidden places',
      link: 'https://lisboasecreta.co',
      source: 'Lisboa Secreta',
    });
  }
}
