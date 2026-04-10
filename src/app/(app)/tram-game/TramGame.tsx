'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const CANVAS_W = 400;
const CANVAS_H = 300;
const TRAM_W = 70;
const TRAM_H = 36;
const LANE_Y = [80, 150, 220]; // 3 lanes
const OBSTACLE_W = 32;
const OBSTACLE_H = 32;

type Obstacle = {
  x: number;
  lane: number;
  type: 'person' | 'car' | 'bike';
  scored: boolean;
};

const OBSTACLE_TYPES = ['person', 'car', 'bike'] as const;
const EMOJIS = { person: '🧑', car: '🚗', bike: '🚲' };
const POINTS = { person: 10, car: 20, bike: 15 };

export default function TramGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    lane: 1,
    targetLane: 1,
    tramY: LANE_Y[1],
    obstacles: [] as Obstacle[],
    score: 0,
    speed: 4,
    frameCount: 0,
    running: false,
    dead: false,
    bgOffset: 0,
  });
  const animRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  const [started, setStarted] = useState(false);
  const [bestScore, setBestScore] = useState(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s = stateRef.current;

    // Sky background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Road
    ctx.fillStyle = '#888';
    ctx.fillRect(0, 50, CANVAS_W, CANVAS_H - 50);

    // Road markings
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([30, 20]);
    ctx.lineWidth = 2;
    for (let laneIdx = 0; laneIdx < 2; laneIdx++) {
      ctx.beginPath();
      ctx.moveTo(0, LANE_Y[laneIdx] + 20);
      ctx.lineTo(CANVAS_W, LANE_Y[laneIdx] + 20);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Buildings (scrolling bg)
    const buildingColors = ['#c94040', '#e8a020', '#4060c0', '#40a060'];
    for (let i = 0; i < 8; i++) {
      const bx = ((i * 80 - s.bgOffset % 80) + CANVAS_W) % CANVAS_W;
      const bh = 30 + (i % 3) * 12;
      ctx.fillStyle = buildingColors[i % 4];
      ctx.fillRect(bx, 50 - bh, 50, bh);
      // Windows
      ctx.fillStyle = 'rgba(255,255,200,0.6)';
      for (let w = 0; w < 3; w++) {
        for (let h2 = 0; h2 < 2; h2++) {
          ctx.fillRect(bx + 6 + w * 14, 50 - bh + 6 + h2 * 12, 8, 8);
        }
      }
    }
    s.bgOffset += s.speed * 0.5;

    // Tram (smooth lane switch)
    const targetY = LANE_Y[s.targetLane];
    s.tramY += (targetY - s.tramY) * 0.18;

    // Draw tram body
    ctx.fillStyle = '#F4D03F';
    ctx.fillRect(60, s.tramY - TRAM_H / 2, TRAM_W, TRAM_H);

    // Tram details
    ctx.fillStyle = '#E67E22';
    ctx.fillRect(60, s.tramY - TRAM_H / 2, TRAM_W, 8); // roof stripe
    ctx.fillStyle = '#85C1E9';
    // Windows
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(70 + i * 18, s.tramY - TRAM_H / 2 + 10, 14, 14);
    }
    // Wheels
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(78, s.tramY + TRAM_H / 2, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(114, s.tramY + TRAM_H / 2, 6, 0, Math.PI * 2); ctx.fill();

    // Tram number 28
    ctx.fillStyle = '#c0392b';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('28', 95, s.tramY + 2);

    // Obstacles
    ctx.font = `${OBSTACLE_H}px serif`;
    ctx.textAlign = 'center';
    for (const obs of s.obstacles) {
      const oy = LANE_Y[obs.lane];
      ctx.fillText(EMOJIS[obs.type], obs.x + OBSTACLE_W / 2, oy + OBSTACLE_H / 2 - 4);
    }

    // Score
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, CANVAS_W, 28);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${s.score}`, 10, 19);
    ctx.textAlign = 'right';
    ctx.fillText(`Best: ${bestScore}`, CANVAS_W - 10, 19);

    if (s.dead) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 20);
      ctx.font = '16px sans-serif';
      ctx.fillText(`Score: ${s.score}`, CANVAS_W / 2, CANVAS_H / 2 + 10);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#F4D03F';
      ctx.fillText('Tap to play again', CANVAS_W / 2, CANVAS_H / 2 + 38);
    }
  }, [bestScore]);

  const gameLoop = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;

    s.frameCount++;

    // Speed up over time
    s.speed = 4 + Math.floor(s.score / 50) * 0.5;

    // Spawn obstacles
    const spawnRate = Math.max(60, 100 - Math.floor(s.score / 30) * 5);
    if (s.frameCount % spawnRate === 0) {
      const lane = Math.floor(Math.random() * 3);
      const type = OBSTACLE_TYPES[Math.floor(Math.random() * 3)];
      s.obstacles.push({ x: CANVAS_W + 20, lane, type, scored: false });
    }

    // Move obstacles
    s.obstacles = s.obstacles.filter(o => o.x > -OBSTACLE_W - 20);
    for (const obs of s.obstacles) {
      obs.x -= s.speed;

      // Score when passed
      if (!obs.scored && obs.x < 50) {
        obs.scored = true;
        s.score += POINTS[obs.type];
        setScore(s.score);
      }

      // Collision
      if (
        obs.lane === s.targetLane &&
        obs.x < 60 + TRAM_W - 8 &&
        obs.x + OBSTACLE_W > 60 + 8 &&
        Math.abs(LANE_Y[obs.lane] - s.tramY) < TRAM_H - 4
      ) {
        s.running = false;
        s.dead = true;
        setDead(true);
        setBestScore(prev => Math.max(prev, s.score));
        draw();
        return;
      }
    }

    draw();
    animRef.current = requestAnimationFrame(gameLoop);
  }, [draw]);

  function startGame() {
    const s = stateRef.current;
    s.lane = 1;
    s.targetLane = 1;
    s.tramY = LANE_Y[1];
    s.obstacles = [];
    s.score = 0;
    s.speed = 4;
    s.frameCount = 0;
    s.running = true;
    s.dead = false;
    s.bgOffset = 0;
    setScore(0);
    setDead(false);
    setStarted(true);
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(gameLoop);
  }

  function handleInput() {
    const s = stateRef.current;
    if (s.dead || !s.running) {
      startGame();
      return;
    }
    // Cycle through lanes: up = decrease lane index, wrap around
    s.targetLane = (s.targetLane + 1) % 3;
    s.lane = s.targetLane;
  }

  function handleUp() {
    const s = stateRef.current;
    if (s.dead || !s.running) { startGame(); return; }
    s.targetLane = Math.max(0, s.targetLane - 1);
    s.lane = s.targetLane;
  }

  function handleDown() {
    const s = stateRef.current;
    if (s.dead || !s.running) { startGame(); return; }
    s.targetLane = Math.min(2, s.targetLane + 1);
    s.lane = s.targetLane;
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); handleUp(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); handleDown(); }
      if (e.key === ' ') { e.preventDefault(); handleInput(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain">
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="font-display text-3xl text-ink mb-1">🚋 Lisbon Tram 28</h1>
        <p className="text-stone-500 text-sm mb-4">Swerve to avoid people, cars and bikes. How far can you go?</p>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="w-full border border-stone-200"
            style={{ touchAction: 'none', borderRadius: 0 }}
            onClick={handleInput}
          />
          {!started && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
              <p className="text-5xl mb-4">🚋</p>
              <p className="font-display text-white text-2xl mb-2">Tram 28</p>
              <p className="text-stone-300 text-sm mb-6 text-center px-8">Avoid the people, cars and bikes on the streets of Lisbon</p>
              <button onClick={startGame} className="bg-brand text-white font-bold px-8 py-3 text-sm">
                Start Game
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex gap-3 justify-center">
          <button
            onTouchStart={(e) => { e.preventDefault(); handleUp(); }}
            onClick={handleUp}
            className="flex-1 py-5 bg-ink text-white font-display text-2xl active:bg-brand transition-colors select-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            ▲
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDown(); }}
            onClick={handleDown}
            className="flex-1 py-5 bg-ink text-white font-display text-2xl active:bg-brand transition-colors select-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            ▼
          </button>
        </div>
        <p className="text-center text-stone-400 text-xs mt-3">Tap ▲ ▼ to switch lanes · Keyboard: Arrow keys</p>

        {dead && (
          <div className="mt-4 bg-ink text-white p-5 text-center">
            <p className="font-display text-2xl mb-1">Score: {score}</p>
            <p className="text-stone-400 text-sm mb-4">Best: {bestScore}</p>
            <button onClick={startGame} className="bg-brand text-white font-bold px-8 py-3 text-sm">
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
