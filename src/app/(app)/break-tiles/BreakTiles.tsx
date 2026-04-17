'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

function playCeramicSmash() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const crack = ctx.createOscillator();
    const crackGain = ctx.createGain();
    crack.type = 'sawtooth';
    crack.frequency.setValueAtTime(2400 + Math.random() * 400, now);
    crack.frequency.exponentialRampToValueAtTime(150, now + 0.1);
    crackGain.gain.setValueAtTime(0.4, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    crack.connect(crackGain); crackGain.connect(ctx.destination);
    crack.start(now); crack.stop(now + 0.12);
    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.2);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass'; noiseFilter.frequency.value = 900;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, now + 0.01);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(ctx.destination);
    noise.start(now + 0.01);
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(110, now + 0.02);
    thud.frequency.exponentialRampToValueAtTime(28, now + 0.18);
    thudGain.gain.setValueAtTime(0.6, now + 0.02);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    thud.connect(thudGain); thudGain.connect(ctx.destination);
    thud.start(now + 0.02); thud.stop(now + 0.22);
    for (let i = 0; i < 3; i++) {
      const chip = ctx.createOscillator();
      const chipGain = ctx.createGain();
      const d = now + 0.06 + i * 0.04 + Math.random() * 0.02;
      chip.frequency.value = 2200 + Math.random() * 1800;
      chipGain.gain.setValueAtTime(0.12, d);
      chipGain.gain.exponentialRampToValueAtTime(0.001, d + 0.1);
      chip.connect(chipGain); chipGain.connect(ctx.destination);
      chip.start(d); chip.stop(d + 0.12);
    }
  } catch {}
}

function drawAzulejo(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, pattern: number, crackProg: number) {
  const p = pattern % 4;
  ctx.fillStyle = '#f5f0e8';
  ctx.fillRect(x, y, s, s);
  ctx.strokeStyle = '#c8b89a';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
  const b = s * 0.07;
  ctx.strokeStyle = '#1a4f7a';
  ctx.lineWidth = s * 0.03;
  ctx.strokeRect(x + b, y + b, s - b * 2, s - b * 2);
  const blues = ['#1a4f7a', '#1e5f9a', '#2471b8', '#0d3d6b'];
  const blue = blues[pattern % blues.length];
  ctx.fillStyle = blue;

  if (p === 0) {
    const cx = x + s / 2, cy = y + s / 2, r = s * 0.25;
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 2) * i;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r * 0.7, cy + Math.sin(a) * r * 0.7, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#f5f0e8'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = blue; ctx.beginPath(); ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2); ctx.fill();
    const cd = s * 0.13;
    for (const [dx, dy] of [[cd, cd], [s - cd, cd], [cd, s - cd], [s - cd, s - cd]]) {
      ctx.beginPath(); ctx.arc(x + dx, y + dy, s * 0.05, 0, Math.PI * 2); ctx.fill();
    }
  } else if (p === 1) {
    const cx = x + s / 2, cy = y + s / 2, hw = s * 0.32;
    ctx.beginPath(); ctx.moveTo(cx, cy - hw); ctx.lineTo(cx + hw, cy); ctx.lineTo(cx, cy + hw); ctx.lineTo(cx - hw, cy); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f5f0e8';
    const iw = hw * 0.62;
    ctx.beginPath(); ctx.moveTo(cx, cy - iw); ctx.lineTo(cx + iw, cy); ctx.lineTo(cx, cy + iw); ctx.lineTo(cx - iw, cy); ctx.closePath(); ctx.fill();
    ctx.fillStyle = blue; ctx.beginPath(); ctx.arc(cx, cy, s * 0.08, 0, Math.PI * 2); ctx.fill();
  } else if (p === 2) {
    const cx = x + s / 2, cy = y + s / 2;
    for (let i = 0; i < 4; i++) {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate((Math.PI / 2) * i);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, s * 0.38, -Math.PI * 0.05, Math.PI * 0.45); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#f5f0e8'; ctx.beginPath(); ctx.arc(cx, cy, s * 0.13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = blue; ctx.beginPath(); ctx.arc(cx, cy, s * 0.065, 0, Math.PI * 2); ctx.fill();
  } else {
    const cx = x + s / 2, cy = y + s / 2, sq = s * 0.28;
    ctx.fillRect(cx - sq / 2, cy - sq / 2, sq, sq);
    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(cx - sq * 0.55, cy - sq * 0.55, sq * 0.55, sq * 0.55);
    ctx.fillRect(cx, cy, sq * 0.55, sq * 0.55);
    ctx.fillStyle = blue;
    const cr = s * 0.12;
    for (const [dx, dy] of [[b + cr, b + cr], [s - b - cr, b + cr], [b + cr, s - b - cr], [s - b - cr, s - b - cr]]) {
      ctx.beginPath(); ctx.arc(x + dx, y + dy, cr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f5f0e8'; ctx.beginPath(); ctx.arc(x + dx, y + dy, cr * 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = blue;
    }
  }

  if (crackProg > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, crackProg * 1.8);
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 1.5;
    const seed = pattern * 137;
    const cx2 = x + s / 2 + (seed % 10) - 5, cy2 = y + s / 2 + ((seed * 7) % 10) - 5;
    for (let i = 0; i < 6; i++) {
      const angle = ((seed * (i + 1) * 137) % 628) / 100;
      const len = s * (0.3 + ((seed * i) % 25) / 100);
      ctx.beginPath(); ctx.moveTo(cx2, cy2);
      ctx.lineTo(cx2 + Math.cos(angle) * len * 0.5 + ((seed * i) % 8) - 4, cy2 + Math.sin(angle) * len * 0.5 + ((seed * i * 3) % 8) - 4);
      ctx.lineTo(cx2 + Math.cos(angle) * len, cy2 + Math.sin(angle) * len);
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(0,0,0,${crackProg * 0.5})`;
    ctx.fillRect(x, y, s, s);
    ctx.restore();
  }
}

// Progressive rounds: keep going forever
function getRoundTileCount(round: number): number {
  if (round <= 6) return Math.pow(2, round - 1); // 1,2,4,8,16,32
  // After round 6, keep adding tiles but cap at reasonable max for screen
  return Math.min(32 + (round - 6) * 8, 120);
}

interface Tile { id: number; col: number; row: number; pattern: number; active: boolean; broken: boolean; crackProgress: number; }

export default function BreakTiles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<Tile[]>([]);
  const animRef = useRef<number>(0);
  const animatingRef = useRef(false);
  const [round, setRound] = useState(1);
  const [broken, setBroken] = useState(0);
  const [total, setTotal] = useState(1);
  const [complete, setComplete] = useState(false);
  const [lifetimeScore, setLifetimeScore] = useState(0);
  const roundRef = useRef(1);
  const brokenRef = useRef(0);
  const sessionBroken = useRef(0); // tiles broken this session, not yet saved

  // Load lifetime score on mount
  useEffect(() => {
    fetch('/api/tile-score').then(r => r.json()).then(d => setLifetimeScore(d.score || 0));
  }, []);

  // Save score to DB every 10 tiles
  async function saveScore(newTiles: number) {
    sessionBroken.current += newTiles;
    if (sessionBroken.current >= 1) {
      const toSave = sessionBroken.current;
      sessionBroken.current = 0;
      try {
        const res = await fetch('/api/tile-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tiles: toSave }),
        });
        const data = await res.json();
        setLifetimeScore(data.score || 0);
      } catch {}
    }
  }

  const getGridSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { cols: 4, rows: 6, tileSize: 80 };
    const maxCols = Math.floor(canvas.width / 70);
    const maxRows = Math.floor(canvas.height / 70);
    const tileSize = Math.min(Math.floor(canvas.width / maxCols), Math.floor(canvas.height / maxRows));
    const cols = Math.floor(canvas.width / tileSize);
    const rows = Math.floor(canvas.height / tileSize);
    return { cols, rows, tileSize };
  }, []);

  const buildRound = useCallback((r: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { cols, rows, tileSize } = getGridSize();
    const count = getRoundTileCount(r);

    // Place tiles randomly on grid
    const allPositions: { col: number; row: number }[] = [];
    for (let row = 0; row < rows; row++)
      for (let col = 0; col < cols; col++)
        allPositions.push({ col, row });

    // Shuffle and pick `count`
    const shuffled = allPositions.sort(() => Math.random() - 0.5).slice(0, Math.min(count, allPositions.length));

    tilesRef.current = shuffled.map((pos, i) => ({
      id: i,
      col: pos.col,
      row: pos.row,
      pattern: Math.floor(Math.random() * 16),
      active: true,
      broken: false,
      crackProgress: 0,
    }));

    brokenRef.current = 0;
    setBroken(0);
    setTotal(shuffled.length);
    setComplete(false);
  }, [getGridSize]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { tileSize } = getGridSize();

    // Dark background
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let needsAnim = false;
    for (const tile of tilesRef.current) {
      if (!tile.active) continue;
      if (tile.crackProgress >= 1) continue;

      if (tile.broken && tile.crackProgress < 1) {
        tile.crackProgress = Math.min(1, tile.crackProgress + 0.06);
        needsAnim = true;
      }

      ctx.save();
      if (tile.crackProgress > 0.5) {
        ctx.globalAlpha = 1 - (tile.crackProgress - 0.5) * 1.6;
      }
      const x = tile.col * tileSize + (canvas.width - Math.floor(canvas.width / tileSize) * tileSize) / 2;
      const y = tile.row * tileSize + (canvas.height - Math.floor(canvas.height / tileSize) * tileSize) / 2;
      drawAzulejo(ctx, x, y, tileSize, tile.pattern, tile.crackProgress);
      ctx.restore();
    }

    if (needsAnim) {
      animatingRef.current = true;
      animRef.current = requestAnimationFrame(render);
    } else {
      animatingRef.current = false;
    }
  }, [getGridSize]);

  const handleTap = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    const { tileSize } = getGridSize();
    const offsetX = (canvas.width - Math.floor(canvas.width / tileSize) * tileSize) / 2;
    const offsetY = (canvas.height - Math.floor(canvas.height / tileSize) * tileSize) / 2;
    const col = Math.floor((x - offsetX) / tileSize);
    const row = Math.floor((y - offsetY) / tileSize);

    const tile = tilesRef.current.find(t => t.col === col && t.row === row && t.active && !t.broken);
    if (!tile) return;

    tile.broken = true;
    tile.crackProgress = 0.01;
    playCeramicSmash();
    brokenRef.current++;
    setBroken(brokenRef.current);
    saveScore(1);

    const activeCount = tilesRef.current.filter(t => t.active && !t.broken).length;
    if (activeCount === 0) {
      setTimeout(() => {
        const nextRound = roundRef.current + 1;
        roundRef.current = nextRound;
        setRound(nextRound);
        buildRound(nextRound);
        cancelAnimationFrame(animRef.current);
        requestAnimationFrame(render);
      }, 600);
    }

    if (!animatingRef.current) {
      animatingRef.current = true;
      cancelAnimationFrame(animRef.current);
      animRef.current = requestAnimationFrame(render);
    }
  }, [getGridSize, buildRound, render]);

  useEffect(() => {
    const setSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      buildRound(roundRef.current);
      cancelAnimationFrame(animRef.current);
      requestAnimationFrame(render);
    };
    setSize();
    window.addEventListener('resize', setSize);
    return () => { window.removeEventListener('resize', setSize); cancelAnimationFrame(animRef.current); };
  }, [buildRound, render]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ touchAction: 'none', background: '#1a1410' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 flex-shrink-0" style={{ background: '#1a1410' }}>
        <div>
          <h1 className="font-display text-2xl text-white">Break The Tiles</h1>
          <p className="text-stone-500 text-xs">Round {round} · {broken}/{total} this round · {lifetimeScore} total</p>
        </div>
        <button onClick={() => { roundRef.current = 1; setRound(1); buildRound(1); cancelAnimationFrame(animRef.current); requestAnimationFrame(render); }}
          className="px-3 py-2 bg-brand text-white text-xs font-bold hover:bg-red-700 transition-colors">
          Reset
        </button>
      </div>

      <div ref={containerRef} className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block', cursor: 'crosshair' }}
          onClick={(e) => handleTap(e.clientX, e.clientY)}
          onTouchStart={(e) => { e.preventDefault(); Array.from(e.changedTouches).forEach(t => handleTap(t.clientX, t.clientY)); }}
        />
      </div>
    </div>
  );
}
