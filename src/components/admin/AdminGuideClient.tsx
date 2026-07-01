'use client';

import { useState } from 'react';

export default function AdminGuideClient() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    setDownloading(true);
    setError('');
    try {
      const res = await fetch('/api/generate-guide', { cache: 'no-store' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate the guide');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'People-Of-Lisbon-Guide.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Try again.');
    }
    setDownloading(false);
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-2">Member Guide</h1>
      <p className="text-stone-500 text-sm mb-6 max-w-md">
        Generates a fresh PDF guide pulling live data: your welcome letter, upcoming events,
        active recommendations, active member offers, and the full members directory with bios.
      </p>

      <div className="pol-card p-6 max-w-md">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="pol-btn-primary w-full text-sm"
        >
          {downloading ? 'Generating guide…' : 'Download People Of Lisbon Guide (PDF)'}
        </button>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        <p className="text-xs text-stone-400 mt-3">
          This can take up to a minute for a large directory — please don't close the tab while it generates.
        </p>
      </div>
    </div>
  );
}
