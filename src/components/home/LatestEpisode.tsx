'use client';

import { useState } from 'react';

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function LatestEpisode({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);
  const videoId = getYouTubeId(url);
  if (!videoId) return null;

  const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <section>
      <div style={{ position: 'relative', background: '#111', overflow: 'hidden', aspectRatio: '16/9' }}>
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : (
          <button onClick={() => setPlaying(true)} className="w-full h-full relative group block">
            <img src={thumbnail} alt="Latest Episode" className="w-full h-full object-cover" />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', transition: 'transform 0.2s' }}
                className="group-hover:scale-110">
                <svg style={{ width: 24, height: 24, marginLeft: 3, color: '#2F6DA5' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </button>
        )}
      </div>
    </section>
  );
}
