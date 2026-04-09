'use client';

import { useEffect, useState } from 'react';

interface NewsItem {
  title: string;
  link: string;
  source: string;
}

export default function LisbonNews() {
  const [news, setNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(d => { if (!d.error) setNews(d); })
      .catch(() => {});
  }, []);

  if (!news) return null;

  return (
    <div className="flex items-center gap-3 bg-stone-900 px-4 py-2.5 overflow-hidden">
      <span className="text-brand text-xs font-bold uppercase tracking-wider flex-shrink-0">Portugal News</span>
      <div className="w-px h-3 bg-stone-700 flex-shrink-0" />
      <a
        href={news.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-stone-300 text-xs truncate hover:text-white transition-colors flex-1 min-w-0"
      >
        {news.title}
      </a>
      <span className="text-stone-600 text-xs flex-shrink-0 hidden sm:block">{news.source}</span>
    </div>
  );
}
