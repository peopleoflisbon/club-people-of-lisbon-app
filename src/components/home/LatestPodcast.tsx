'use client';

import { useEffect, useState, useRef } from 'react';

interface Episode {
  title: string;
  description: string;
  audioUrl: string;
  artwork: string;
  pubDate: string;
  duration: string;
  appleUrl: string;
}

export default function LatestPodcast() {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch('/api/podcast')
      .then(r => r.json())
      .then(d => { if (!d.error) setEpisode(d); })
      .catch(() => {});
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    setProgress((audio.currentTime / audio.duration) * 100);
  }

  function handleLoadedMetadata() {
    if (audioRef.current) setDuration(audioRef.current.duration);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const time = (Number(e.target.value) / 100) * audio.duration;
    audio.currentTime = time;
    setProgress(Number(e.target.value));
  }

  function formatTime(s: number) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  if (!episode) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-2xl text-ink">Latest Podcast</h2>
        <a href={episode.appleUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand hover:underline">
          Apple Podcasts →
        </a>
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: 14, overflow: 'hidden', border: '1px solid #EDE7DC' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
          {episode.artwork && (
            <img src={episode.artwork} alt="Podcast" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }} />
          )}
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2F6DA5', margin: '0 0 3px' }}>People Of Lisbon Podcast</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1C', lineHeight: 1.3, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{episode.title}</p>
          </div>
          {episode.audioUrl && (
            <button onClick={togglePlay}
              style={{ width: 44, height: 44, borderRadius: '50%', background: '#2F6DA5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: 'none', cursor: 'pointer' }}>
              {playing ? (
                <svg style={{ width: 16, height: 16 }} fill="white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg style={{ width: 16, height: 16, marginLeft: 2 }} fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
          )}
        </div>
        {episode.audioUrl && (
          <div style={{ padding: '0 18px 14px' }}>
            <audio ref={audioRef} src={episode.audioUrl}
              onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={() => setPlaying(false)} />
            <input type="range" min="0" max="100" value={progress} onChange={handleSeek}
              style={{ width: '100%', accentColor: '#2F6DA5', cursor: 'pointer' }} />
          </div>
        )}
      </div>
    </section>
  );
}
