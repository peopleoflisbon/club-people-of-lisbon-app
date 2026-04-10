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

      <div className="overflow-hidden relative" style={{ backgroundImage: "url('/sidebar-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
        <div className="relative z-10 flex items-center gap-4 p-5">
          {episode.artwork && (
            <img src={episode.artwork} alt="Podcast" className="w-16 h-16 object-cover flex-shrink-0 shadow-lg" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-brand text-xs font-semibold uppercase tracking-wider mb-1">People Of Lisbon Podcast</p>
            <p className="text-white font-semibold text-base leading-snug">{episode.title}</p>
          </div>
          {episode.audioUrl && (
            <button onClick={togglePlay}
              className="w-12 h-12 bg-brand flex items-center justify-center hover:bg-red-700 transition-colors flex-shrink-0">
              {playing ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
          )}
        </div>
        {episode.audioUrl && (
          <div className="relative z-10 px-5 pb-4">
            <audio ref={audioRef} src={episode.audioUrl}
              onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={() => setPlaying(false)} />
            <input type="range" min="0" max="100" value={progress} onChange={handleSeek}
              className="w-full h-0.5 bg-white/20 appearance-none cursor-pointer" style={{ accentColor: '#F4141E' }} />
          </div>
        )}
      </div>
    </section>
  );
}
