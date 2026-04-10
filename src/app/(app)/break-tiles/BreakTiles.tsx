'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// Azulejo tile patterns — blue/white Portuguese style
const TILE_COLORS = [
  '#1a4a7a', '#1e5a96', '#2166ac', '#2471a3', '#1f618d',
  '#154360', '#1a5276', '#0e4b7a', '#163d6e', '#1b4f8a',
];

const TILE_PATTERNS = [
  // Cross pattern
  (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.fillStyle = '#f0e6d0';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#c8b89a';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, y, size, size);
    ctx.fillStyle = color;
    const p = size * 0.15;
    const c = size / 2;
    // Center cross
    ctx.fillRect(x + c - p/2, y + p, p, size - p*2);
    ctx.fillRect(x + p, y + c - p/2, size - p*2, p);
    // Corner dots
    ctx.beginPath(); ctx.arc(x + p*1.2, y + p*1.2, p*0.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + size - p*1.2, y + p*1.2, p*0.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + p*1.2, y + size - p*1.2, p*0.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + size - p*1.2, y + size - p*1.2, p*0.5, 0, Math.PI*2); ctx.fill();
  },
  // Diamond pattern
  (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.fillStyle = '#f0e6d0';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#c8b89a';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, y, size, size);
    ctx.fillStyle = color;
    const c = size / 2;
    ctx.beginPath();
    ctx.moveTo(x + c, y + size*0.1);
    ctx.lineTo(x + size*0.9, y + c);
    ctx.lineTo(x + c, y + size*0.9);
    ctx.lineTo(x + size*0.1, y + c);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f0e6d0';
    ctx.beginPath();
    ctx.moveTo(x + c, y + size*0.28);
    ctx.lineTo(x + size*0.72, y + c);
    ctx.lineTo(x + c, y + size*0.72);
    ctx.lineTo(x + size*0.28, y + c);
    ctx.closePath();
    ctx.fill();
  },
  // Circle pattern
  (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.fillStyle = '#f0e6d0';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#c8b89a';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, y, size, size);
    ctx.fillStyle = color;
    const c = size / 2;
    ctx.beginPath(); ctx.arc(x + c, y + c, size*0.38, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#f0e6d0';
    ctx.beginPath(); ctx.arc(x + c, y + c, size*0.24, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x + c, y + c, size*0.1, 0, Math.PI*2); ctx.fill();
    // Corner arcs
    const r = size * 0.22;
    for (const [cx, cy, start] of [[x, y, 0], [x+size, y, Math.PI/2], [x+size, y+size, Math.PI], [x, y+size, Math.PI*1.5]] as [number,number,number][]) {
      ctx.beginPath(); ctx.arc(cx, cy, r, start, start + Math.PI/2); ctx.lineTo(cx, cy); ctx.closePath(); ctx.fill();
    }
  },
];

interface Tile {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  pattern: number;
  broken: boolean;
  breakProgress: number; // 0-1, 1 = fully broken
  cracks: {x1:number,y1:number,x2:number,y2:number}[];
}

const TILE_SIZE = 80;

export default function BreakTiles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tilesRef = useRef<Tile[]>([]);
  const animRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const scoreRef = useRef(0);

  const initTiles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cols = Math.ceil(canvas.width / TILE_SIZE);
    const rows = Math.ceil(canvas.height / TILE_SIZE);
    const tiles: Tile[] = [];
    let id = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        tiles.push({
          id: id++,
          x: c * TILE_SIZE,
          y: r * TILE_SIZE,
          size: TILE_SIZE,
          color: TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)],
          pattern: Math.floor(Math.random() * TILE_PATTERNS.length),
          broken: false,
          breakProgress: 0,
          cracks: [],
        });
      }
    }
    tilesRef.current = tiles;
  }, []);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const tile of tilesRef.current) {
      if (tile.breakProgress >= 1) continue; // fully gone

      ctx.save();
      if (tile.breakProgress > 0) {
        ctx.globalAlpha = 1 - tile.breakProgress;
      }

      // Draw tile
      TILE_PATTERNS[tile.pattern](ctx, tile.x, tile.y, tile.size, tile.color);

      // Draw cracks
      if (tile.cracks.length > 0) {
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 1.5;
        for (const crack of tile.cracks) {
          ctx.beginPath();
          ctx.moveTo(crack.x1, crack.y1);
          ctx.lineTo(crack.x2, crack.y2);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // Animate breaking tiles
    let needsFrame = false;
    for (const tile of tilesRef.current) {
      if (tile.broken && tile.breakProgress < 1) {
        tile.breakProgress = Math.min(1, tile.breakProgress + 0.06);
        needsFrame = true;
      }
    }

    if (needsFrame) {
      animRef.current = requestAnimationFrame(drawFrame);
    }
  }, []);

  function generateCracks(tile: Tile, cx: number, cy: number) {
    const numCracks = 4 + Math.floor(Math.random() * 4);
    const cracks = [];
    for (let i = 0; i < numCracks; i++) {
      const angle = (Math.PI * 2 * i / numCracks) + (Math.random() - 0.5) * 0.8;
      const len = tile.size * (0.3 + Math.random() * 0.4);
      cracks.push({
        x1: cx, y1: cy,
        x2: cx + Math.cos(angle) * len,
        y2: cy + Math.sin(angle) * len,
      });
    }
    return cracks;
  }

  // Sound effect using Web Audio API
  function playBreakSound() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300 + Math.random() * 200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }

  const handleTap = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    let hit = false;
    for (const tile of tilesRef.current) {
      if (tile.broken) continue;
      if (x >= tile.x && x < tile.x + tile.size && y >= tile.y && y < tile.y + tile.size) {
        tile.broken = true;
        tile.cracks = generateCracks(tile, x, y);
        scoreRef.current += 1;
        setScore(scoreRef.current);
        playBreakSound();
        hit = true;
        break;
      }
    }
    if (hit) {
      cancelAnimationFrame(animRef.current);
      animRef.current = requestAnimationFrame(drawFrame);
    }
  }, [drawFrame]);

  const handleReset = useCallback(() => {
    initTiles();
    scoreRef.current = 0;
    setScore(0);
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(drawFrame);
  }, [initTiles, drawFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initTiles();
      cancelAnimationFrame(animRef.current);
      animRef.current = requestAnimationFrame(drawFrame);
    };
    setSize();
    window.addEventListener('resize', setSize);
    return () => { window.removeEventListener('resize', setSize); cancelAnimationFrame(animRef.current); };
  }, [initTiles, drawFrame]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ touchAction: 'none' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-stone-100 flex-shrink-0">
        <div>
          <h1 className="font-display text-2xl text-ink">🔨 Break the Tiles</h1>
          <p className="text-stone-400 text-xs">Tap to smash · stress reliever</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-display text-2xl text-ink leading-none">{score}</p>
            <p className="text-stone-400 text-xs">smashed</p>
          </div>
          <button onClick={handleReset}
            className="px-3 py-1.5 bg-brand text-white text-xs font-bold hover:bg-red-700 transition-colors">
            Reset
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="flex-1 w-full"
        style={{ display: 'block', cursor: 'crosshair' }}
        onClick={(e) => { setStarted(true); handleTap(e.clientX, e.clientY); }}
        onTouchStart={(e) => {
          e.preventDefault();
          setStarted(true);
          Array.from(e.changedTouches).forEach(t => handleTap(t.clientX, t.clientY));
        }}
      />
    </div>
  );
}
