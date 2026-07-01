'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StickerCard from '@/components/stickers/StickerCard';
import ScrollPage from '@/components/ui/ScrollPage';

const RED = '#C8102E';
const GOLD = '#E6B75C';
const INK = '#1C1C1C';
const CREAM = '#F5F1EA';
const MUTED = '#9B8A7A';
const FF = "-apple-system, BlinkMacSystemFont, system-ui, 'Helvetica Neue', Arial, sans-serif";

type AlbumSticker = {
  type: 'member' | 'recommendation' | 'landmark';
  source_id: string;
  name: string;
  subtitle: string;
  image_url: string | null;
  number: number;
  collected: boolean;
  collected_at: string | null;
};

export default function StickersPage() {
  const router = useRouter();
  const [data, setData] = useState<{
    members: AlbumSticker[];
    landmarks: AlbumSticker[];
    recommendations: AlbumSticker[];
    totalCollected: number;
    totalPossible: number;
    packetAvailable: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sticker/collection')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const pct = data ? Math.round((data.totalCollected / Math.max(data.totalPossible, 1)) * 100) : 0;

  return (
    <ScrollPage>
      <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: FF }}>

        {/* Header */}
        <div style={{ background: INK, padding: '28px 20px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 30%, rgba(200,16,46,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: RED, margin: '0 0 4px' }}>People Of Lisbon</p>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.02em' }}>My Collection</h1>

            {loading ? (
              <div style={{ height: 32 }} />
            ) : data && (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: GOLD }}>{data.totalCollected}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>/ {data.totalPossible} stickers</span>
                  <span style={{ fontSize: 11, color: GOLD, marginLeft: 4 }}>{pct}%</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 3, height: 4, overflow: 'hidden' }}>
                  <div style={{ background: RED, height: '100%', width: `${pct}%`, transition: 'width 0.5s ease', borderRadius: 3 }} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Packet CTA */}
        {data?.packetAvailable && (
          <div style={{ margin: '12px 16px', background: '#fff', border: `2px solid ${RED}`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: RED, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>🃏</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: INK, margin: '0 0 2px' }}>Your daily packet is ready</p>
              <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>Open to reveal today's sticker</p>
            </div>
            <button onClick={() => router.push('/stickers/open')} style={{
              background: RED, color: '#fff', border: 'none', padding: '9px 14px',
              fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: FF, borderRadius: 6, flexShrink: 0,
            }}>
              Open →
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: MUTED, fontSize: 13 }}>
            Loading your collection…
          </div>
        ) : data && (
          <div style={{ padding: '8px 16px' }}>
            <Section title="Members" stickers={data.members} />
            <Section title="Lisbon Landmarks" stickers={data.landmarks} />
            <Section title="Recommendations" stickers={data.recommendations} />
          </div>
        )}
      </div>
    </ScrollPage>
  );
}

function Section({ title, stickers }: { title: string; stickers: AlbumSticker[] }) {
  const collected = stickers.filter(s => s.collected).length;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 10px' }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: INK, letterSpacing: '-0.01em' }}>{title}</span>
        <span style={{ fontSize: 11, color: MUTED }}>{collected} / {stickers.length}</span>
      </div>

      {/* Progress */}
      <div style={{ background: '#EDE7DC', borderRadius: 2, height: 3, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{
          background: '#C8102E', height: '100%', borderRadius: 2,
          width: `${stickers.length > 0 ? (collected / stickers.length) * 100 : 0}%`,
          transition: 'width 0.5s ease',
        }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {stickers.map(s => (
          <div key={`${s.type}-${s.source_id}`} style={{ display: 'flex', justifyContent: 'center' }}>
            {s.collected ? (
              <StickerCard sticker={s} size="sm" />
            ) : (
              <div style={{
                width: 70, height: 98, background: '#EDE7DC', borderRadius: 4,
                border: '1.5px dashed #C9BFB0', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#D4C9BC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 11, color: '#9B8A7A', fontWeight: 700 }}>?</span>
                </div>
                <span style={{ fontSize: 7, color: '#C9BFB0', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                  #{String(s.number).padStart(3, '0')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
