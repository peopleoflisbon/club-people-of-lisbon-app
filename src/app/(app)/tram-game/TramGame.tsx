'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const GROUND_Y = 0.75; // fraction of canvas height
const TRAM_X = 80;
const SPEED_INIT = 5;
const GRAVITY = 0.6;
const JUMP_FORCE = -13;

type Obstacle = { x: number; type: 'person' | 'car' | 'bike'; w: number; h: number; scored: boolean };

const OBS_CONFIG = {
  person: { w: 18, h: 40, color: '#333', label: '🧑' },
  car:    { w: 50, h: 28, color: '#555', label: '🚗' },
  bike:   { w: 30, h: 30, color: '#444', label: '🚲' },
};

export default function TramGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const state = useRef({
    vy: 0,
    tramY: 0,
    grounded: true,
    obstacles: [] as Obstacle[],
    score: 0,
    speed: SPEED_INIT,
    frame: 0,
    running: false,
    dead: false,
    groundX: 0,
    clouds: [{ x: 200, y: 60, s: 1 }, { x: 400, y: 40, s: 0.7 }, { x: 600, y: 70, s: 0.9 }],
  });
  const animRef = useRef(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'dead'>('idle');

  const getSize = () => {
    const c = containerRef.current;
    return c ? { w: c.clientWidth, h: Math.min(c.clientWidth * 0.45, 280) } : { w: 400, h: 180 };
  };

  const jump = useCallback(() => {
    const s = state.current;
    if (s.dead || !s.running) return;
    if (s.grounded) {
      s.vy = JUMP_FORCE;
      s.grounded = false;
    }
  }, []);

  const startGame = useCallback(() => {
    const s = state.current;
    const { h } = getSize();
    const ground = h * GROUND_Y;
    s.tramY = ground;
    s.vy = 0;
    s.grounded = true;
    s.obstacles = [];
    s.score = 0;
    s.speed = SPEED_INIT;
    s.frame = 0;
    s.running = true;
    s.dead = false;
    s.groundX = 0;
    setScore(0);
    setPhase('playing');
    cancelAnimationFrame(animRef.current);
    loop();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { w, h } = getSize();
    canvas.width = w;
    canvas.height = h;
    const ground = h * GROUND_Y;
    const s = state.current;
    const TRAM_W = w * 0.18;
    const TRAM_H = h * 0.16;

    // White background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    // Clouds
    ctx.fillStyle = '#e8e8e8';
    for (const cl of s.clouds) {
      ctx.beginPath();
      ctx.arc(cl.x, cl.y, 18 * cl.s, 0, Math.PI * 2);
      ctx.arc(cl.x + 18 * cl.s, cl.y - 8 * cl.s, 14 * cl.s, 0, Math.PI * 2);
      ctx.arc(cl.x + 36 * cl.s, cl.y, 18 * cl.s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground line
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, ground + 2);
    ctx.lineTo(w, ground + 2);
    ctx.stroke();

    // Ground texture (dashes)
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    const gx = (-(s.groundX % 40));
    for (let x = gx; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, ground + 8);
      ctx.lineTo(x + 20, ground + 8);
      ctx.stroke();
    }

    // TRAM — yellow with black outline, Lisbon style
    const tx = TRAM_X;
    const ty = s.tramY - TRAM_H;
    const tw = TRAM_W;
    const th = TRAM_H;

    // Body
    ctx.fillStyle = '#F4D03F';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.fillRect(tx, ty, tw, th);
    ctx.strokeRect(tx, ty, tw, th);

    // Roof stripe (red)
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(tx, ty, tw, th * 0.22);
    ctx.strokeRect(tx, ty, tw, th * 0.22);

    // Windows
    ctx.fillStyle = '#87CEEB';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    const winCount = 3;
    const winW = tw * 0.2;
    const winH = th * 0.28;
    const winY = ty + th * 0.28;
    for (let i = 0; i < winCount; i++) {
      const wx = tx + tw * 0.08 + i * (tw * 0.3);
      ctx.fillRect(wx, winY, winW, winH);
      ctx.strokeRect(wx, winY, winW, winH);
    }

    // Wheels
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(tx + tw * 0.22, ground + 2, h * 0.04, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(tx + tw * 0.78, ground + 2, h * 0.04, 0, Math.PI * 2); ctx.fill();

    // Number 28
    ctx.fillStyle = '#c0392b';
    ctx.font = `bold ${Math.round(th * 0.22)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('28', tx + tw * 0.5, ty + th * 0.78);

    // Obstacles
    for (const obs of s.obstacles) {
      const cfg = OBS_CONFIG[obs.type];
      const oh = obs.h;
      const ow = obs.w;
      const oy = ground - oh;

      if (obs.type === 'person') {
        // Stick figure
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(obs.x + ow/2, oy + 6, 5, 0, Math.PI*2); ctx.fill(); // head
        ctx.beginPath(); ctx.moveTo(obs.x + ow/2, oy + 11); ctx.lineTo(obs.x + ow/2, oy + 28); ctx.stroke(); // body
        ctx.beginPath(); ctx.moveTo(obs.x + ow/2, oy + 16); ctx.lineTo(obs.x + 4, oy + 22); ctx.stroke(); // arm L
        ctx.beginPath(); ctx.moveTo(obs.x + ow/2, oy + 16); ctx.lineTo(obs.x + ow - 4, oy + 22); ctx.stroke(); // arm R
        ctx.beginPath(); ctx.moveTo(obs.x + ow/2, oy + 28); ctx.lineTo(obs.x + 4, oy + oh); ctx.stroke(); // leg L
        ctx.beginPath(); ctx.moveTo(obs.x + ow/2, oy + 28); ctx.lineTo(obs.x + ow - 4, oy + oh); ctx.stroke(); // leg R
      } else if (obs.type === 'car') {
        ctx.fillStyle = '#333';
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2;
        ctx.fillRect(obs.x, oy + oh * 0.35, ow, oh * 0.65);
        ctx.strokeRect(obs.x, oy + oh * 0.35, ow, oh * 0.65);
        // Roof
        ctx.beginPath();
        ctx.moveTo(obs.x + ow * 0.15, oy + oh * 0.35);
        ctx.lineTo(obs.x + ow * 0.3, oy);
        ctx.lineTo(obs.x + ow * 0.7, oy);
        ctx.lineTo(obs.x + ow * 0.85, oy + oh * 0.35);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Wheels
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(obs.x + ow * 0.22, ground + 2, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(obs.x + ow * 0.78, ground + 2, 5, 0, Math.PI * 2); ctx.fill();
      } else {
        // Bike
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2;
        // Wheels
        ctx.beginPath(); ctx.arc(obs.x + 8, ground - 8, 8, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(obs.x + ow - 8, ground - 8, 8, 0, Math.PI * 2); ctx.stroke();
        // Frame
        ctx.beginPath();
        ctx.moveTo(obs.x + 8, ground - 8);
        ctx.lineTo(obs.x + ow/2, ground - oh * 0.7);
        ctx.lineTo(obs.x + ow - 8, ground - 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(obs.x + ow/2, ground - oh * 0.7);
        ctx.lineTo(obs.x + ow * 0.35, ground - 8);
        ctx.stroke();
        // Handlebar
        ctx.beginPath();
        ctx.moveTo(obs.x + ow - 12, ground - oh * 0.7);
        ctx.lineTo(obs.x + ow - 4, ground - oh * 0.7);
        ctx.stroke();
      }
    }

    // Score
    ctx.fillStyle = '#555';
    ctx.font = `bold ${Math.round(h * 0.07)}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(`HI ${String(best).padStart(5, '0')}  ${String(s.score).padStart(5, '0')}`, w - 12, h * 0.1);

    if (phase === 'idle' || (!s.running && !s.dead)) {
      ctx.fillStyle = '#111';
      ctx.font = `bold ${Math.round(h * 0.12)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('TAP TO START', w / 2, h / 2);
      ctx.font = `${Math.round(h * 0.07)}px monospace`;
      ctx.fillStyle = '#888';
      ctx.fillText('Tap / Space to jump', w / 2, h / 2 + h * 0.14);
    }

    if (s.dead) {
      ctx.fillStyle = '#111';
      ctx.font = `bold ${Math.round(h * 0.12)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', w / 2, h * 0.42);
      ctx.font = `${Math.round(h * 0.07)}px monospace`;
      ctx.fillStyle = '#888';
      ctx.fillText('Tap to restart', w / 2, h * 0.42 + h * 0.14);
    }
  }, [best, phase]);

  function loop() {
    const s = state.current;
    if (!s.running) return;
    const { h, w } = getSize();
    const ground = h * GROUND_Y;
    const TRAM_W = w * 0.18;
    const TRAM_H = h * 0.16;

    s.frame++;
    s.speed = SPEED_INIT + Math.floor(s.score / 100) * 0.5;

    // Physics
    if (!s.grounded) {
      s.vy += GRAVITY;
      s.tramY += s.vy;
      if (s.tramY >= ground) {
        s.tramY = ground;
        s.vy = 0;
        s.grounded = true;
      }
    }

    // Ground scroll
    s.groundX += s.speed;

    // Clouds
    for (const cl of s.clouds) {
      cl.x -= s.speed * 0.3;
      if (cl.x < -60) cl.x = w + 60;
    }

    // Spawn obstacles
    const spawnRate = Math.max(55, 90 - Math.floor(s.score / 50) * 5);
    if (s.frame % spawnRate === 0) {
      const types: Array<'person' | 'car' | 'bike'> = ['person', 'car', 'bike'];
      const type = types[Math.floor(Math.random() * 3)];
      const cfg = OBS_CONFIG[type];
      s.obstacles.push({ x: w + 20, type, w: cfg.w, h: cfg.h, scored: false });
    }

    // Move obstacles
    s.obstacles = s.obstacles.filter(o => o.x > -60);
    for (const obs of s.obstacles) {
      obs.x -= s.speed;

      // Score
      if (!obs.scored && obs.x + obs.w < TRAM_X) {
        obs.scored = true;
        s.score += obs.type === 'car' ? 20 : obs.type === 'bike' ? 15 : 10;
        setScore(s.score);
      }

      // Collision — tram bounding box
      const tx = TRAM_X + 4;
      const ty = s.tramY - TRAM_H + 4;
      const tw = TRAM_W - 8;
      const th = TRAM_H - 4;
      const oGround = ground - obs.h;

      if (
        obs.x < tx + tw &&
        obs.x + obs.w > tx &&
        oGround < ty + th &&
        ground > ty
      ) {
        s.running = false;
        s.dead = true;
        setPhase('dead');
        setBest(prev => Math.max(prev, s.score));
        draw();
        return;
      }
    }

    draw();
    animRef.current = requestAnimationFrame(loop);
  }

  const handleTap = useCallback(() => {
    const s = state.current;
    if (phase === 'idle' || phase === 'dead') {
      startGame();
    } else {
      jump();
    }
  }, [phase, startGame, jump]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); handleTap(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleTap]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Title bar */}
      <div className="px-4 py-3 border-b border-stone-100 flex-shrink-0">
        <h1 className="font-display text-2xl text-ink">🚋 Tram 28</h1>
        <p className="text-stone-400 text-xs">Jump to avoid people, cars & bikes</p>
      </div>

      {/* Game canvas — takes remaining space */}
      <div
        ref={containerRef}
        className="flex-1 flex flex-col items-center justify-center bg-white cursor-pointer select-none"
        onClick={handleTap}
        onTouchStart={(e) => { e.preventDefault(); handleTap(); }}
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ maxHeight: '100%', display: 'block' }}
        />
        <p className="text-stone-300 text-xs mt-2 pb-2">
          {phase === 'idle' ? 'Tap to start' : phase === 'playing' ? 'Tap to jump' : 'Tap to restart'}
        </p>
      </div>
    </div>
  );
}
