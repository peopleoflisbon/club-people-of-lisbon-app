'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StickerCard from '@/components/stickers/StickerCard';
import { StickerDef } from '@/lib/stickers';

const RED = '#C8102E';
const GOLD = '#E6B75C';
const INK = '#1C1C1C';
const FF = "-apple-system, BlinkMacSystemFont, system-ui, 'Helvetica Neue', Arial, sans-serif";

type State = 'loading' | 'ready' | 'opening' | 'revealed' | 'already' | 'complete' | 'error';

export default function OpenPacketPage() {
  const router = useRouter();
  const [state, setState] = useState<State>('loading');
  const [sticker, setSticker] = useState<StickerDef | null>(null);
  const [todaySticker, setTodaySticker] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/sticker/open')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setState('error'); return; }
        if (data.complete) { setState('complete'); return; }
        if (data.alreadyOpened) {
          setTodaySticker(data.todaySticker);
          setState('already');
          return;
        }
        setSticker(data.sticker);
        setState('ready');
      })
      .catch(() => { setError('Connection error'); setState('error'); });
  }, []);

  function openPacket() {
    if (state !== 'ready') return;
    setState('opening');
    setTimeout(() => setState('revealed'), 800);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: INK, display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: FF, overflow: 'hidden', zIndex: 10,
    }}>
      {/* Subtle radial glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(200,16,46,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Back button */}
      <button onClick={() => router.push('/stickers')} style={{
        position: 'absolute', top: 'max(env(safe-area-inset-top), 20px)', left: 20,
        background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)',
        fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FF,
      }}>
        ← Back
      </button>

      {state === 'loading' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTop: `3px solid ${RED}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Opening your packet…</p>
        </div>
      )}

      {state === 'error' && (
        <div style={{ textAlign: 'center', padding: '0 32px' }}>
          <p style={{ color: '#f87171', fontSize: 15, marginBottom: 16 }}>{error}</p>
          <button onClick={() => router.push('/stickers')} style={{ color: RED, background: 'none', border: `1px solid ${RED}`, padding: '10px 20px', fontSize: 13, cursor: 'pointer', fontFamily: FF }}>
            Go back
          </button>
        </div>
      )}

      {state === 'complete' && (
        <div style={{ textAlign: 'center', padding: '0 32px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: GOLD, marginBottom: 8 }}>Congratulations</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 12 }}>Collection Complete!</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>You have collected every People Of Lisbon sticker.</p>
          <button onClick={() => router.push('/stickers')} style={{ background: RED, color: '#fff', border: 'none', padding: '14px 28px', fontSize: 13, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: FF, borderRadius: 4 }}>
            View Collection
          </button>
        </div>
      )}

      {(state === 'ready' || state === 'opening') && sticker && (
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: RED, marginBottom: 6 }}>Daily Sticker</p>
          <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Your packet is ready</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>Tap to reveal today's sticker</p>

          {/* Packet */}
          <div
            onClick={openPacket}
            style={{
              cursor: 'pointer', display: 'inline-block',
              transform: state === 'opening' ? 'scale(0.85) translateY(-10px)' : 'scale(1)',
              opacity: state === 'opening' ? 0 : 1,
              transition: 'transform 0.35s ease, opacity 0.35s ease',
            }}
          >
            <div style={{ width: 120, borderRadius: 8, overflow: 'hidden', border: `2.5px solid ${GOLD}`, background: INK }}>
              {/* Packet top */}
              <div style={{ background: RED, padding: '10px 12px 8px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '-40%', width: '25%', height: '100%', background: 'rgba(255,255,255,0.1)', transform: 'skewX(-18deg)' }} />
                <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: '.14em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>People Of Lisbon</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', textAlign: 'center', lineHeight: 1.1 }}>Sticker{'\n'}Collection</div>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 4, letterSpacing: '.1em' }}>Series 1 · 2025</div>
              </div>
              {/* Packet mid */}
              <div style={{ background: '#111', padding: '14px 12px', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: RED, border: `2px solid ${GOLD}`, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div style={{ fontSize: 6.5, fontWeight: 800, letterSpacing: '.08em', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>POL</div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: GOLD }}>25</div>
                </div>
                <div style={{ color: GOLD, fontSize: 11, letterSpacing: 4 }}>◆ ◆ ◆</div>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 6 }}>1 sticker inside</div>
              </div>
              {/* Tear line */}
              <div style={{ borderTop: '1.5px dashed rgba(255,255,255,0.2)', margin: '0 10px' }} />
              {/* Packet bottom */}
              <div style={{ background: RED, padding: '7px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: '#fff', letterSpacing: '.06em' }}>Tap to tear open ↓</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {state === 'revealed' && sticker && (
        <div style={{
          textAlign: 'center', position: 'relative', zIndex: 1,
          animation: 'slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}>
          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: GOLD, marginBottom: 8 }}>
            {sticker.type === 'member' ? 'New Member' : sticker.type === 'landmark' ? 'Lisbon Landmark' : 'Recommendation'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <StickerCard sticker={sticker} size="lg" />
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Added to your collection</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => router.push('/stickers')} style={{
              background: RED, color: '#fff', border: 'none', padding: '13px 22px',
              fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: FF, borderRadius: 4,
            }}>
              View Collection →
            </button>
            <button onClick={() => router.push('/home')} style={{
              background: 'none', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.2)',
              padding: '13px 22px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FF, borderRadius: 4,
            }}>
              Home
            </button>
          </div>
        </div>
      )}

      {state === 'already' && (
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 32px' }}>
          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Today's sticker</p>
          <p style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Already opened today</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Come back tomorrow for your next sticker</p>
          {todaySticker && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <StickerCard sticker={todaySticker} size="lg" />
            </div>
          )}
          <button onClick={() => router.push('/stickers')} style={{
            background: RED, color: '#fff', border: 'none', padding: '13px 22px',
            fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: FF, borderRadius: 4,
          }}>
            View Collection →
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
