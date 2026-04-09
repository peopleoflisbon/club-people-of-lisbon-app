'use client';

import { useEffect, useState } from 'react';

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
}

export default function LisbonNews() {
  const [news, setNews] = useState<NewsItem | null>(null);
  const [showReader, setShowReader] = useState(false);

  useEffect(() => {
    fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/world/europe/rss.xml&count=5`)
      .then(r => r.json())
      .then(d => {
        const items = d.items || [];
        // Try to find a Portugal/Lisbon story, otherwise use first headline
        const portugal = items.find((i: any) =>
          i.title?.toLowerCase().includes('portugal') ||
          i.title?.toLowerCase().includes('lisbon') ||
          i.description?.toLowerCase().includes('portugal')
        ) || items[0];
        if (portugal) {
          setNews({
            title: portugal.title,
            link: portugal.link,
            description: portugal.description?.replace(/<[^>]*>/g, '') || '',
            pubDate: portugal.pubDate,
            source: 'BBC News',
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!news) return null;

  return (
    <>
      <div className="bg-white border border-stone-100">
        <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-semibold text-brand uppercase tracking-wider">Latest News</span>
          </div>
          <span className="text-xs text-stone-400">{news.source}</span>
        </div>
        <button
          onClick={() => setShowReader(true)}
          className="w-full text-left px-5 py-4 hover:bg-stone-50 transition-colors"
        >
          <p className="font-semibold text-sm text-ink leading-snug mb-1">{news.title}</p>
          {news.description && (
            <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{news.description}</p>
          )}
          <p className="text-xs text-brand font-semibold mt-2">Read full article →</p>
        </button>
      </div>

      {/* In-app reader overlay */}
      {showReader && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end lg:items-center justify-center"
          onClick={() => setShowReader(false)}
        >
          <div
            className="bg-white w-full lg:max-w-2xl lg:mx-4 max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{news.source}</span>
              <button onClick={() => setShowReader(false)} className="text-stone-400 hover:text-ink transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <h2 className="font-display text-2xl text-ink leading-tight mb-4">{news.title}</h2>
              {news.description && (
                <p className="text-stone-600 text-sm leading-relaxed">{news.description}</p>
              )}
            </div>
            <div className="px-5 py-4 border-t border-stone-100">
              <a
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-brand text-white text-sm font-semibold text-center"
              >
                Read full article on {news.source}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
