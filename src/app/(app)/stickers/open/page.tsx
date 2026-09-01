'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StickerCard from '@/components/stickers/StickerCard';

const RED = '#C8102E';
const GOLD = '#E6B75C';
const INK = '#1C1C1C';
const FF = "-apple-system, BlinkMacSystemFont, system-ui, 'Helvetica Neue', Arial, sans-serif";

type State = 'loading' | 'ready' | 'opening' | 'revealed' | 'already' | 'complete' | 'error';

// Tear sound — works on iOS by resuming AudioContext inside user gesture
function playTearSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
    resume.then(() => {
      // Layer 1: white noise burst (the rip)
      const ripDuration = 0.3;
      const buf1 = ctx.createBuffer(1, ctx.sampleRate * ripDuration, ctx.sampleRate);
      const d1 = buf1.getChannelData(0);
      for (let i = 0; i < d1.length; i++) {
        d1[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d1.length, 0.8);
      }
      const src1 = ctx.createBufferSource();
      src1.buffer = buf1;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.6;
      const gain1 = ctx.createGain();
      gain1.gain.setValueAtTime(1.8, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ripDuration);
      src1.connect(bp); bp.connect(gain1); gain1.connect(ctx.destination);
      src1.start();

      // Layer 2: short crinkle tail
      const crinkleDuration = 0.15;
      const buf2 = ctx.createBuffer(1, ctx.sampleRate * crinkleDuration, ctx.sampleRate);
      const d2 = buf2.getChannelData(0);
      for (let i = 0; i < d2.length; i++) {
        d2[i] = (Math.random() * 2 - 1) * 0.3 * Math.pow(1 - i / d2.length, 2);
      }
      const src2 = ctx.createBufferSource();
      src2.buffer = buf2;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass'; hp.frequency.value = 3000;
      src2.connect(hp); hp.connect(ctx.destination);
      src2.start(ctx.currentTime + 0.12);
    });
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
            {/* POL Official Sticker Pack design */}
            <div style={{
              width: 260, borderRadius: 12, overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
              background: '#C8102E',
              backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 2px, transparent 2px, transparent 8px)',
            }}>
              <div style={{ margin: 8, borderRadius: 6, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)', background: '#C8102E' }}>
                <div style={{ padding: '14px 14px 0', position: 'relative', minHeight: 190 }}>
                  {/* Starburst badge */}
                  <div style={{
                    position: 'absolute', top: 10, right: 10, zIndex: 3,
                    width: 64, height: 64, background: '#FFDB00',
                    clipPath: 'polygon(50% 0%,61% 30%,93% 11%,75% 40%,100% 50%,75% 60%,93% 89%,61% 70%,50% 100%,39% 70%,7% 89%,25% 60%,0% 50%,25% 40%,7% 11%,39% 30%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ textAlign: 'center', fontSize: 6.5, fontWeight: 900, color: '#1C1C1C', lineHeight: 1.35 }}>
                      REAL PEOPLE<br />REAL STORIES<br />LISBON
                    </div>
                  </div>
                  {/* Title */}
                  <div style={{ fontSize: 40, fontWeight: 900, color: '#fff', lineHeight: 0.95, letterSpacing: '-0.02em', marginBottom: 5, fontFamily: FF }}>
                    People<br />Of<br />Lisbon
                  </div>
                  <div style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,0.85)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                    The Official Sticker Collection
                  </div>
                  {/* Three polaroid photos */}
                  <div style={{ position: 'relative', height: 100 }}>
                    <div style={{ position: 'absolute', left: 0, bottom: 0, background: '#fff', padding: '3px 3px 10px', borderRadius: 2, width: 62, transform: 'rotate(-8deg)', boxShadow: '2px 2px 8px rgba(0,0,0,0.35)' }}>
                      <div style={{ background: '#999', height: 52, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
                    </div>
                    <div style={{ position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%) rotate(-1deg)', background: '#fff', padding: '3px 3px 12px', borderRadius: 2, width: 74, zIndex: 2, boxShadow: '2px 4px 12px rgba(0,0,0,0.45)' }}>
                      <div style={{ background: '#777', height: 62, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👤</div>
                    </div>
                    <div style={{ position: 'absolute', right: 0, bottom: 0, background: '#fff', padding: '3px 3px 10px', borderRadius: 2, width: 62, transform: 'rotate(7deg)', boxShadow: '2px 2px 8px rgba(0,0,0,0.35)' }}>
                      <div style={{ background: '#888', height: 52, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
                    </div>
                  </div>
                </div>
                {/* Yellow strip */}
                <div style={{ background: '#FFDB00', padding: '10px 12px', textAlign: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: '#1C1C1C', letterSpacing: '.04em', textTransform: 'uppercase', fontFamily: FF }}>
                    Open 1 Sticker Per Day
                  </span>
                </div>
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
            <StickerCard sticker={sticker} size="xl" />
          </div>
          {sticker.description && (
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: '0 0 20px', lineHeight: 1.6, fontStyle: 'italic', maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
              "{sticker.description}"
            </p>
          )}
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 22 }}>Added to your collection</p>
          {sticker.youtube_url && (() => {
            const videoId = sticker.youtube_url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/)?.[1];
            return videoId ? (
              <button onClick={() => {
                const overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:300;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';
                overlay.innerHTML = `<div style="width:100%;max-width:500px"><div style="position:relative;padding-bottom:56.25%;height:0;border-radius:8px;overflow:hidden"><iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&modestbranding=1" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allow="autoplay;fullscreen" allowfullscreen></iframe></div><button onclick="this.closest('[style*=fixed]').remove()" style="margin-top:16px;display:block;width:100%;padding:12px;background:none;border:1px solid rgba(255,255,255,0.25);color:rgba(255,255,255,0.6);font-size:13px;font-weight:700;cursor:pointer;border-radius:4px">Close</button></div>`;
                overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
                document.body.appendChild(overlay);
              }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#C8102E', color: '#fff', padding: '10px 20px', borderRadius: 4, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: FF, marginBottom: 16 }}>
                ▶ Watch on YouTube
              </button>
            ) : null;
          })()}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
            <button onClick={() => router.push('/stickers')} style={{ background: RED, color: '#fff', border: 'none', padding: '13px 22px', fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: FF, borderRadius: 4 }}>View Collection →</button>
            <button onClick={() => router.push('/home')} style={{ background: 'none', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.2)', padding: '13px 22px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FF, borderRadius: 4 }}>Home</button>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>Open a new sticker every day ✦</p>
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
              <StickerCard sticker={todaySticker} size="xl" />
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
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
