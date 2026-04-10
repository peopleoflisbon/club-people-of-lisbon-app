'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

const TILE_SIZE = 90;

// Realistic ceramic smash sound using Web Audio API
function playCeramicSmash() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Layer 1: Initial high-frequency crack (ceramic fracture)
    const crack = ctx.createOscillator();
    const crackGain = ctx.createGain();
    const crackFilter = ctx.createBiquadFilter();
    crackFilter.type = 'highpass';
    crackFilter.frequency.value = 3000;
    crack.type = 'sawtooth';
    crack.frequency.setValueAtTime(2400, now);
    crack.frequency.exponentialRampToValueAtTime(200, now + 0.08);
    crackGain.gain.setValueAtTime(0.5, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    crack.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(ctx.destination);
    crack.start(now);
    crack.stop(now + 0.1);

    // Layer 2: Noise burst (rubble / debris)
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 800;
    noiseFilter.Q.value = 0.5;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now + 0.01);

    // Layer 3: Low thud (heavy piece hitting floor)
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(120, now + 0.02);
    thud.frequency.exponentialRampToValueAtTime(30, now + 0.18);
    thudGain.gain.setValueAtTime(0.7, now + 0.02);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    thud.connect(thudGain);
    thudGain.connect(ctx.destination);
    thud.start(now + 0.02);
    thud.stop(now + 0.22);

    // Layer 4: Tinkling high chips
    for (let i = 0; i < 3; i++) {
      const chip = ctx.createOscillator();
      const chipGain = ctx.createGain();
      const delay = now + 0.05 + i * 0.04 + Math.random() * 0.03;
      chip.type = 'sine';
      chip.frequency.value = 2000 + Math.random() * 2000;
      chipGain.gain.setValueAtTime(0.15, delay);
      chipGain.gain.exponentialRampToValueAtTime(0.001, delay + 0.12);
      chip.connect(chipGain);
      chipGain.connect(ctx.destination);
      chip.start(delay);
      chip.stop(delay + 0.15);
    }
  } catch (e) {
    // Audio not available
  }
}

// Draw authentic Portuguese azulejo tile
function drawAzulejo(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  pattern: number, crackProgress: number
) {
  const s = size;
  const p = pattern % 4;

  // Base — white/cream tile
  ctx.fillStyle = '#f5f0e8';
  ctx.fillRect(x, y, s, s);

  // Border
  ctx.strokeStyle = '#d4c9b0';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);

  // Inner border
  const b = s * 0.07;
  ctx.strokeStyle = '#1a4f7a';
  ctx.lineWidth = s * 0.03;
  ctx.strokeRect(x + b, y + b, s - b*2, s - b*2);

  // Blue pigment colours
  const blues = ['#1a4f7a', '#1e5f9a', '#2471b8', '#0d3d6b', '#2980b9'];
  const blue = blues[pattern % blues.length];

  ctx.fillStyle = blue;
  ctx.strokeStyle = blue;

  if (p === 0) {
    // Classic 4-petal flower
    const cx = x + s/2, cy = y + s/2;
    const r = s * 0.25;
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * r * 0.7, cy + Math.sin(angle) * r * 0.7, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Centre
    ctx.fillStyle = '#f5f0e8';
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = blue;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2); ctx.fill();
    // Corner dots
    const cd = s * 0.13;
    for (const [dx, dy] of [[cd,cd],[s-cd,cd],[cd,s-cd],[s-cd,s-cd]]) {
      ctx.beginPath(); ctx.arc(x+dx, y+dy, s*0.05, 0, Math.PI*2); ctx.fill();
    }
  } else if (p === 1) {
    // Diamond + cross
    const cx = x + s/2, cy = y + s/2;
    const hw = s * 0.32;
    ctx.beginPath();
    ctx.moveTo(cx, cy - hw);
    ctx.lineTo(cx + hw, cy);
    ctx.lineTo(cx, cy + hw);
    ctx.lineTo(cx - hw, cy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f5f0e8';
    const iw = hw * 0.62;
    ctx.beginPath();
    ctx.moveTo(cx, cy - iw);
    ctx.lineTo(cx + iw, cy);
    ctx.lineTo(cx, cy + iw);
    ctx.lineTo(cx - iw, cy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = blue;
    ctx.beginPath(); ctx.arc(cx, cy, s*0.08, 0, Math.PI*2); ctx.fill();
    // Arms
    const arm = s * 0.07;
    ctx.lineWidth = arm;
    ctx.beginPath(); ctx.moveTo(x+b+arm/2, cy); ctx.lineTo(cx-hw-arm/2, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+hw+arm/2, cy); ctx.lineTo(x+s-b-arm/2, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, y+b+arm/2); ctx.lineTo(cx, cy-hw-arm/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy+hw+arm/2); ctx.lineTo(cx, y+s-b-arm/2); ctx.stroke();
  } else if (p === 2) {
    // Windmill / pinwheel
    const cx = x + s/2, cy = y + s/2;
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((Math.PI / 2) * i);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, s*0.38, -Math.PI*0.05, Math.PI*0.45);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#f5f0e8';
    ctx.beginPath(); ctx.arc(cx, cy, s*0.13, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = blue;
    ctx.beginPath(); ctx.arc(cx, cy, s*0.065, 0, Math.PI*2); ctx.fill();
  } else {
    // Geometric squares + circles
    const cx = x + s/2, cy = y + s/2;
    const sq = s * 0.28;
    ctx.fillRect(cx - sq/2, cy - sq/2, sq, sq);
    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(cx - sq*0.55, cy - sq*0.55, sq*0.55, sq*0.55);
    ctx.fillRect(cx, cy, sq*0.55, sq*0.55);
    ctx.fillStyle = blue;
    const cr = s * 0.12;
    for (const [dx, dy] of [[b+cr, b+cr],[s-b-cr,b+cr],[b+cr,s-b-cr],[s-b-cr,s-b-cr]]) {
      ctx.beginPath(); ctx.arc(x+dx, y+dy, cr, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#f5f0e8';
      ctx.beginPath(); ctx.arc(x+dx, y+dy, cr*0.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = blue;
    }
  }

  // Crack overlay
  if (crackProgress > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, crackProgress * 1.5);
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.lineWidth = 1.2;
    // Generate deterministic cracks based on pattern
    const seed = pattern * 137;
    const cx = x + s/2 + (seed % 10) - 5;
    const cy = y + s/2 + ((seed * 7) % 10) - 5;
    const numCracks = 5 + (seed % 4);
    for (let i = 0; i < numCracks; i++) {
      const angle = ((seed * (i+1) * 137) % 628) / 100;
      const len = s * (0.25 + ((seed * i) % 30) / 100);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const midX = cx + Math.cos(angle) * len * 0.5 + ((seed*i)%8)-4;
      const midY = cy + Math.sin(angle) * len * 0.5 + ((seed*i*3)%8)-4;
      ctx.lineTo(midX, midY);
      ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
      ctx.stroke();
    }
    // Dark shatter overlay
    ctx.fillStyle = `rgba(0,0,0,${crackProgress * 0.4})`;
    ctx.fillRect(x, y, s, s);
    ctx.restore();
  }
}

interface Tile {
  id: number;
  col: number;
  row: number;
  pattern: number;
  broken: boolean;
  crackProgress: number;
  shards: { x: number; y: number; vx: number; vy: number; r: number; life: number }[];
}

export default function BreakTiles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tilesRef = useRef<Tile[]>([]);
  const animRef = useRef<number>(0);
  const activeRef = useRef(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [cols, setCols] = useState(0);
  const [rows, setRows] = useState(0);

  const initTiles = useCallback((w: number, h: number) => {
    const c = Math.ceil(w / TILE_SIZE);
    const r = Math.ceil(h / TILE_SIZE);
    setCols(c); setRows(r);
    const tiles: Tile[] = [];
    for (let row = 0; row < r; row++) {
      for (let col = 0; col < c; col++) {
        tiles.push({
          id: row * c + col,
          col, row,
          pattern: (row * c + col + row * 3) % 16,
          broken: false,
          crackProgress: 0,
          shards: [],
        });
      }
    }
    tilesRef.current = tiles;
    scoreRef.current = 0;
    setScore(0);
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let needsAnim = false;

    for (const tile of tilesRef.current) {
      const x = tile.col * TILE_SIZE;
      const y = tile.row * TILE_SIZE;

      if (tile.crackProgress >= 1) {
        // Draw gap/shadow where tile was
        ctx.fillStyle = '#1a1410';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        continue;
      }

      if (tile.crackProgress > 0) {
        // Animate breaking
        tile.crackProgress = Math.min(1, tile.crackProgress + 0.055);
        needsAnim = true;
      }

      // Draw tile with cracks
      ctx.save();
      if (tile.crackProgress > 0.5) {
        // Split apart animation
        const split = (tile.crackProgress - 0.5) * 2;
        ctx.globalAlpha = 1 - split * 0.8;
        ctx.translate(x + TILE_SIZE/2, y + TILE_SIZE/2);
        ctx.scale(1 - split * 0.15, 1 - split * 0.15);
        ctx.translate(-x - TILE_SIZE/2, -y - TILE_SIZE/2);
      }
      drawAzulejo(ctx, x, y, TILE_SIZE, tile.pattern, tile.crackProgress);
      ctx.restore();
    }

    if (needsAnim) {
      animRef.current = requestAnimationFrame(render);
    } else {
      activeRef.current = false;
    }
  }, []);

  const handleTap = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);

    const tile = tilesRef.current.find(t => t.col === col && t.row === row);
    if (!tile || tile.broken || tile.crackProgress > 0) return;

    tile.broken = true;
    tile.crackProgress = 0.01;
    scoreRef.current++;
    setScore(scoreRef.current);
    playCeramicSmash();

    if (!activeRef.current) {
      activeRef.current = true;
      cancelAnimationFrame(animRef.current);
      animRef.current = requestAnimationFrame(render);
    }
  }, [render]);

  const handleReset = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    initTiles(canvas.width, canvas.height);
    cancelAnimationFrame(animRef.current);
    activeRef.current = false;
    requestAnimationFrame(render);
  }, [initTiles, render]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initTiles(canvas.width, canvas.height);
      cancelAnimationFrame(animRef.current);
      requestAnimationFrame(render);
    };
    setSize();
    window.addEventListener('resize', setSize);
    return () => { window.removeEventListener('resize', setSize); cancelAnimationFrame(animRef.current); };
  }, [initTiles, render]);

  const allBroken = tilesRef.current.length > 0 && tilesRef.current.every(t => t.broken);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ touchAction: 'none', background: '#1a1410' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 flex-shrink-0" style={{ background: '#1a1410' }}>
        <div>
          <h1 className="font-display text-2xl text-white">🔨 Break the Tiles</h1>
          <p className="text-stone-500 text-xs">Tap to smash Portuguese azulejos</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-display text-3xl text-white leading-none">{score}</p>
            <p className="text-stone-500 text-xs">smashed</p>
          </div>
          <button onClick={handleReset}
            className="px-3 py-2 bg-brand text-white text-xs font-bold hover:bg-red-700 transition-colors">
            Reset
          </button>
        </div>
      </div>

      {/* Canvas fills remaining space */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block', cursor: 'crosshair' }}
          onClick={(e) => handleTap(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            e.preventDefault();
            Array.from(e.changedTouches).forEach(t => handleTap(t.clientX, t.clientY));
          }}
        />
        {allBroken && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-display text-white text-4xl mb-2">🏆</p>
            <p className="font-display text-white text-2xl mb-1">All broken!</p>
            <p className="text-stone-400 text-sm mb-6">{score} tiles smashed</p>
            <button onClick={handleReset} className="bg-brand text-white font-bold px-8 py-3 text-sm">
              Smash Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
