'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StickerCard from '@/components/stickers/StickerCard';

const RED = '#C8102E';
const GOLD = '#E6B75C';
const INK = '#1C1C1C';
const FF = "-apple-system, BlinkMacSystemFont, system-ui, 'Helvetica Neue', Arial, sans-serif";

type State = 'loading' | 'ready' | 'opening' | 'revealed' | 'already' | 'complete' | 'error';

// Tear sound using Web Audio API — no external file needed
function playTearSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 0.35;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // White noise with exponential decay — sounds like a paper tear
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    // Bandpass filter to make it sound papery
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 0.8;
    source.connect(filter);
    filter.connect(ctx.destination);
    source.start();
    source.stop(ctx.currentTime + duration);
  } catch {}
}

export default function OpenPacketPage() {
  const router = useRouter();
  const [state, setState] = useState<State>('loading');
  const [sticker, setSticker] = useState<any>(null);
  const [todaySticker, setTodaySticker] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/sticker/open')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setState('error'); return; }
        if (data.complete) { setState('complete'); return; }
        if (data.alreadyOpened) { setTodaySticker(data.todaySticker); setState('already'); return; }
        setSticker(data.sticker);
        setState('ready');
      })
      .catch(() => { setError('Connection error'); setState('error'); });
  }, []);

  function openPacket() {
    if (state !== 'ready') return;
    playTearSound();
    setState('opening');
    setTimeout(() => setState('revealed'), 700);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: INK, display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: FF, overflow: 'hidden', zIndex: 10,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 35%, rgba(200,16,46,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <button onClick={() => router.push('/stickers')} style={{
        position: 'absolute', top: 'max(env(safe-area-inset-top), 20px)', left: 20,
        background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)',
        fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FF, zIndex: 2,
      }}>← Back</button>

      {/* LOADING */}
      {state === 'loading' && (
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTop: `3px solid ${RED}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Opening your packet…</p>
        </div>
      )}

      {/* ERROR */}
      {state === 'error' && (
        <div style={{ textAlign: 'center', padding: '0 32px', position: 'relative', zIndex: 1 }}>
          <p style={{ color: '#f87171', fontSize: 15, marginBottom: 16 }}>{error}</p>
          <button onClick={() => router.push('/stickers')} style={{ color: RED, background: 'none', border: `1px solid ${RED}`, padding: '10px 20px', fontSize: 13, cursor: 'pointer', fontFamily: FF }}>Go back</button>
        </div>
      )}

      {/* COMPLETE */}
      {state === 'complete' && (
        <div style={{ textAlign: 'center', padding: '0 32px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: GOLD, marginBottom: 8 }}>Incredible</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 12 }}>Collection Complete!</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>You've collected every People Of Lisbon sticker. Check back as new ones are added.</p>
          <button onClick={() => router.push('/stickers')} style={{ background: RED, color: '#fff', border: 'none', padding: '14px 28px', fontSize: 13, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: FF, borderRadius: 4 }}>View Collection</button>
        </div>
      )}

      {/* READY — big packet waiting to be opened */}
      {(state === 'ready' || state === 'opening') && (
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: RED, marginBottom: 6 }}>Daily Sticker</p>
          <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Your packet is ready</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>Tap to tear open</p>

          <div onClick={openPacket} style={{
            cursor: 'pointer', display: 'inline-block',
            transform: state === 'opening' ? 'scale(0.8) translateY(-20px) rotate(-3deg)' : 'scale(1)',
            opacity: state === 'opening' ? 0 : 1,
            transition: 'transform 0.4s ease, opacity 0.3s ease',
          }}>
            {/* Big packet — 180px wide */}
            <div style={{ width: 180, borderRadius: 10, overflow: 'hidden', border: `3px solid ${GOLD}`, background: INK, boxShadow: '0 20px 60px rgba(200,16,46,0.4)' }}>
              <div style={{ background: RED, padding: '16px 16px 12px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '-40%', width: '25%', height: '100%', background: 'rgba(255,255,255,0.12)', transform: 'skewX(-18deg)' }} />
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.16em', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', textAlign: 'center', marginBottom: 6 }}>People Of Lisbon</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', textAlign: 'center', lineHeight: 1.05 }}>Sticker<br />Collection</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 6, letterSpacing: '.1em' }}>Series 1 · 2025</div>
              </div>
              <div style={{ background: '#111', padding: '22px 16px', textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: RED, border: `2.5px solid ${GOLD}`, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '.1em', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase' }}>POL</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: GOLD }}>25</div>
                </div>
                <div style={{ color: GOLD, fontSize: 14, letterSpacing: 6, marginBottom: 10 }}>◆ ◆ ◆</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '.1em', textTransform: 'uppercase' }}>1 sticker inside</div>
              </div>
              <div style={{ borderTop: '2px dashed rgba(255,255,255,0.2)', margin: '0 14px' }} />
              <div style={{ background: RED, padding: '10px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: '.08em' }}>Tap to tear open ↓</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REVEALED */}
      {state === 'revealed' && sticker && (
        <div style={{
          textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 28px',
          animation: 'slideUp 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}>
          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: GOLD, marginBottom: 6 }}>New sticker unlocked</p>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 22px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Congratulations!<br />You got a new sticker.
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <StickerCard sticker={sticker} size="lg" />
          </div>
          {sticker.description && (
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: '0 0 20px', lineHeight: 1.6, fontStyle: 'italic', maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
              "{sticker.description}"
            </p>
          )}
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 22 }}>Added to your collection</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => router.push('/stickers')} style={{ background: RED, color: '#fff', border: 'none', padding: '13px 22px', fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: FF, borderRadius: 4 }}>View Collection →</button>
            <button onClick={() => router.push('/home')} style={{ background: 'none', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.2)', padding: '13px 22px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FF, borderRadius: 4 }}>Home</button>
          </div>
        </div>
      )}

      {/* ALREADY OPENED */}
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
          <button onClick={() => router.push('/stickers')} style={{ background: RED, color: '#fff', border: 'none', padding: '13px 22px', fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: FF, borderRadius: 4 }}>View Collection →</button>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(50px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
