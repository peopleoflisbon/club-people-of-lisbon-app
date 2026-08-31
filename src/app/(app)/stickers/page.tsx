'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StickerCard from '@/components/stickers/StickerCard';
import ScrollPage from '@/components/ui/ScrollPage';

const RED = '#C8102E';
const GOLD = '#E6B75C';
const INK = '#1C1C1C';
const MUTED = '#9B8A7A';
const FF = "-apple-system, BlinkMacSystemFont, system-ui, 'Helvetica Neue', Arial, sans-serif";

type Sticker = {
  type: 'rita';
  source_id: string;
  name: string;
  subtitle: string;
  description?: string;
  youtube_url?: string;
  image_url: string | null;
  number: number;
  collected: boolean;
  collected_at: string | null;
};

export default function StickersPage() {
  const router = useRouter();
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [packetAvailable, setPacketAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enlarged, setEnlarged] = useState<Sticker | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/sticker/collection')
      .then(r => r.json())
      .then(d => {
        setStickers(d.stickers || []);
        setTotalCollected(d.totalCollected || 0);
        setTotalPossible(d.totalPossible || 0);
        setPacketAvailable(d.packetAvailable || false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const pct = totalPossible > 0 ? Math.round((totalCollected / totalPossible) * 100) : 0;

  return (
    <>
      <ScrollPage>
        <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: FF }}>

          {/* Header */}
          <div style={{ background: INK, padding: '28px 20px 22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 30%, rgba(200,16,46,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: RED, margin: '0 0 4px' }}>People Of Lisbon</p>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.02em' }}>Sticker Collection</h1>
              {!loading && (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: GOLD }}>{totalCollected}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>/ {totalPossible} stickers</span>
                    {totalPossible > 0 && <span style={{ fontSize: 11, color: GOLD, marginLeft: 4 }}>{pct}%</span>}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 3, height: 4, overflow: 'hidden' }}>
                    <div style={{ background: RED, height: '100%', width: `${pct}%`, transition: 'width 0.5s ease', borderRadius: 3 }} />
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '10px 0 0', letterSpacing: '.04em' }}>Open a new sticker every day ✦</p>
                </>
              )}
            </div>
          </div>

          {/* Open packet CTA */}
          {packetAvailable && (
            <div style={{ margin: '12px 16px', background: '#fff', border: `2px solid ${RED}`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, background: RED, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>🃏</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: INK, margin: '0 0 2px' }}>Your daily packet is ready</p>
                <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>Open to reveal today's sticker</p>
              </div>
              <button onClick={() => router.push('/stickers/open')} style={{ background: RED, color: '#fff', border: 'none', padding: '9px 14px', fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: FF, borderRadius: 6, flexShrink: 0 }}>
                Open →
              </button>
            </div>
          )}

          {/* Collection grid */}
          <div style={{ padding: '12px 16px 8px' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: MUTED, fontSize: 13, padding: '40px 0' }}>Loading your collection…</p>
            ) : stickers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>🃏</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 6 }}>No stickers yet</p>
                <p style={{ fontSize: 13, color: MUTED }}>Open your daily packet to start collecting</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {stickers.map(s => (
                  <div
                    key={s.source_id}
                    style={{ display: 'flex', justifyContent: 'center', cursor: s.collected ? 'pointer' : 'default' }}
                    onClick={() => s.collected && setEnlarged(s)}
                  >
                    {s.collected ? (
                      <div style={{ transition: 'transform 0.15s', transform: 'scale(1)' }}
                        onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}>
                        <StickerCard sticker={s} size="sm" />
                      </div>
                    ) : (
                      <div style={{ width: 70, height: 98, background: '#EDE7DC', borderRadius: 4, border: '1.5px dashed #C9BFB0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#D4C9BC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 12, color: '#9B8A7A', fontWeight: 700 }}>?</span>
                        </div>
                        <span style={{ fontSize: 7, color: '#C9BFB0', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                          #{String(s.number).padStart(3, '0')}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </ScrollPage>

      {/* Enlarged sticker modal */}
      {enlarged && (
        <div onClick={() => setEnlarged(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 300 }}>
            <StickerCard sticker={enlarged} size="xl" />
            {enlarged.description && (
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 18, fontStyle: 'italic', lineHeight: 1.65, textAlign: 'center' }}>
                "{enlarged.description}"
              </p>
            )}
            {enlarged.youtube_url && (
              <button onClick={() => { setVideoUrl(enlarged.youtube_url!); setEnlarged(null); }} style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8, background: '#C8102E', color: '#fff', padding: '10px 20px', borderRadius: 4, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: FF }}>
                ▶ Watch on YouTube
              </button>
            )}
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 12, fontFamily: FF }}>
              Collected {enlarged.collected_at ? new Date(enlarged.collected_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
            </p>
            <button onClick={() => setEnlarged(null)} style={{ marginTop: 22, background: 'none', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.6)', padding: '11px 32px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FF, borderRadius: 4 }}>
              Close
            </button>
          </div>
        </div>
      )}
      {/* In-app YouTube video modal */}
      {videoUrl && (() => {
        const videoId = videoUrl.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/)?.[1];
        if (!videoId) return null;
        return (
          <div onClick={() => setVideoUrl(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 500 }}>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 8, overflow: 'hidden' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&modestbranding=1`}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <button onClick={() => setVideoUrl(null)} style={{ marginTop: 16, display: 'block', width: '100%', padding: '12px', background: 'none', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FF, borderRadius: 4 }}>
                Close
              </button>
            </div>
          </div>
        );
      })()}
    </>
  );
}
