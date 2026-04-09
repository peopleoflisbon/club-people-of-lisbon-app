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
        <a
          href={episode.appleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-brand hover:underline"
        >
          Apple Podcasts →
        </a>
      </div>

      <div className="bg-ink overflow-hidden">
        {/* Episode artwork + info */}
        <div className="flex items-start gap-4 p-5">
          {episode.artwork && (
            <img
              src={episode.artwork}
              alt="Podcast episode"
              className="w-20 h-20 object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-brand text-xs font-semibold uppercase tracking-wider mb-1">People Of Lisbon</p>
            <p className="text-white font-semibold text-base leading-snug mb-1 line-clamp-2">{episode.title}</p>
            {episode.description && (
              <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">{episode.description}</p>
            )}
          </div>
        </div>

        {/* Audio player */}
        {episode.audioUrl && (
          <div className="px-5 pb-5">
            <audio
              ref={audioRef}
              src={episode.audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setPlaying(false)}
            />

            {/* Progress bar */}
            <div className="mb-3">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full h-1 bg-stone-700 appearance-none cursor-pointer"
                style={{ accentColor: '#F4141E' }}
              />
              <div className="flex justify-between mt-1">
                <span className="text-stone-500 text-xs">{formatTime(currentTime)}</span>
                <span className="text-stone-500 text-xs">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="w-10 h-10 bg-brand flex items-center justify-center hover:bg-brand-dark transition-colors flex-shrink-0"
              >
                {playing ? (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
              <p className="text-stone-400 text-xs flex-1 leading-snug">
                {playing ? 'Now playing' : 'Tap to listen'}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
