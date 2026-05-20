'use client';

import { useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import BrandLogo from '@/components/ui/BrandLogo';
import ImageUpload from '@/components/ui/ImageUpload';

interface Props { settings: Record<string, string>; }

function parsePos(pos: string): { x: number; y: number } {
  const parts = pos.replace(/%/g, '').split(/\s+/);
  const keyMap: Record<string, number> = { left: 0, center: 50, right: 100, top: 0, bottom: 100 };
  const x = keyMap[parts[0]] ?? parseFloat(parts[0]) ?? 50;
  const y = keyMap[parts[1]] ?? parseFloat(parts[1]) ?? 50;
  return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? 50 : y };
}

function DraggableImagePosition({
  src, fallback, x, y, onChange, aspect,
}: {
  src: string; fallback: string; x: number; y: number;
  onChange: (x: number, y: number) => void; aspect: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startPos = useRef({ mouseX: 0, mouseY: 0, imgX: x, imgY: y });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startPos.current = { mouseX: e.clientX, mouseY: e.clientY, imgX: x, imgY: y };

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((ev.clientX - startPos.current.mouseX) / rect.width) * -100;
      const dy = ((ev.clientY - startPos.current.mouseY) / rect.height) * -100;
      const newX = Math.min(100, Math.max(0, startPos.current.imgX + dx));
      const newY = Math.min(100, Math.max(0, startPos.current.imgY + dy));
      onChange(newX, newY);
    };
    const onUp = () => { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [x, y, onChange]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    dragging.current = true;
    startPos.current = { mouseX: touch.clientX, mouseY: touch.clientY, imgX: x, imgY: y };

    const onMove = (ev: TouchEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const t = ev.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((t.clientX - startPos.current.mouseX) / rect.width) * -100;
      const dy = ((t.clientY - startPos.current.mouseY) / rect.height) * -100;
      const newX = Math.min(100, Math.max(0, startPos.current.imgX + dx));
      const newY = Math.min(100, Math.max(0, startPos.current.imgY + dy));
      onChange(newX, newY);
    };
    const onUp = () => { dragging.current = false; window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp); };
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
  }, [x, y, onChange]);

  return (
    <div>
      <div ref={containerRef} onMouseDown={onMouseDown} onTouchStart={onTouchStart}
        style={{ position: 'relative', width: '100%', paddingBottom: `${100 / aspect}%`, overflow: 'hidden', borderRadius: 10, cursor: 'grab', userSelect: 'none', background: '#111' }}>
        <img src={src || fallback} alt="" draggable={false}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${x}% ${y}%`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.6)', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }} />
        </div>
        <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.55)', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: 'white', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          Drag to reposition
        </div>
      </div>
      <p style={{ fontSize: 11, color: '#8A7C6E', margin: '6px 0 0', fontFamily: 'monospace' }}>
        Position: {Math.round(x)}% {Math.round(y)}%
      </p>
    </div>
  );
}

export default function AdminSettingsClient({ settings: initial }: Props) {
  const FALLBACK = 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=70';
  const [loginBg, setLoginBg] = useState(initial['login_background_image_url'] || '');
  const [desktopBg, setDesktopBg] = useState(initial['login_background_desktop_url'] || '');
  const mobileParsed = parsePos(initial['login_background_mobile_position'] || 'center top');
  const desktopParsed = parsePos(initial['login_background_desktop_position'] || 'center center');
  const [mobileX, setMobileX] = useState(mobileParsed.x);
  const [mobileY, setMobileY] = useState(mobileParsed.y);
  const [desktopX, setDesktopX] = useState(desktopParsed.x);
  const [desktopY, setDesktopY] = useState(desktopParsed.y);
  const [brandLogo, setBrandLogo] = useState(initial['brand_square_image_url'] || '/pol-logo.png');
  const [stephenPhoto, setStephenPhoto] = useState(initial['stephen_photo_url'] || '');
  const [latestEpisode, setLatestEpisode] = useState(initial['latest_episode_url'] || '');
  const [featuredPerson, setFeaturedPerson] = useState(initial['splash_featured_person'] || '');
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const supabase = createClient();

  async function save(key: string, value: string, id: string) {
    setSaving(id); setSaved(null);
    await supabase.from('app_settings').upsert({ key, value });
    setSaving(null); setSaved(id);
    setTimeout(() => setSaved(null), 3000);
  }

  async function saveMultiple(pairs: [string, string][], id: string) {
    setSaving(id); setSaved(null);
    for (const [key, value] of pairs) {
      await supabase.from('app_settings').upsert({ key, value });
    }
    setSaving(null); setSaved(id);
    setTimeout(() => setSaved(null), 3000);
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">Settings</h1>
        <p className="text-stone-500 text-sm">Brand and appearance settings for People Of Lisbon.</p>
      </div>

      {/* Brand Logo */}
      <div className="pol-card p-6">
        <h2 className="font-semibold text-sm text-ink mb-1">Brand Logo</h2>
        <p className="text-xs text-stone-400 mb-5">Used in the navigation, admin panel.</p>
        <div className="flex items-center gap-5 mb-5 p-4 bg-stone-50 rounded-xl border border-stone-100">
          <BrandLogo src={brandLogo} size={64} radius={14} className="shadow-md shadow-brand/20" />
          <div>
            <p className="font-semibold text-sm text-ink">Current logo</p>
            <p className="text-xs text-stone-400 mt-0.5 max-w-xs truncate">{brandLogo || 'Default'}</p>
          </div>
        </div>
        <div className="space-y-3">
          <ImageUpload value={brandLogo === '/pol-logo.png' ? '' : brandLogo} onChange={(url) => setBrandLogo(url || '/pol-logo.png')} label="Logo Image" folder="brand" preview="square" />
          <div className="flex items-center gap-3">
            <button onClick={() => save('brand_square_image_url', brandLogo, 'logo')} disabled={saving === 'logo'} className="pol-btn-primary">{saving === 'logo' ? 'Saving…' : 'Save Logo'}</button>
            {saved === 'logo' && <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>}
          </div>
        </div>
      </div>

      {/* Mobile Background */}
      <div className="pol-card p-6">
        <h2 className="font-semibold text-sm text-ink mb-1">Mobile Background Image</h2>
        <p className="text-xs text-stone-400 mb-4">Shown on phones. Drag the preview to reposition the image.</p>
        <div className="mb-4">
          <DraggableImagePosition
            src={loginBg} fallback={FALLBACK}
            x={mobileX} y={mobileY}
            onChange={(x, y) => { setMobileX(x); setMobileY(y); }}
            aspect={9/16}
          />
        </div>
        <div className="space-y-3">
          <ImageUpload value={loginBg} onChange={(url) => setLoginBg(url)} label="Mobile Background Photo" folder="backgrounds" preview="wide" />
          <div className="flex items-center gap-3">
            <button onClick={() => saveMultiple([['login_background_image_url', loginBg], ['login_background_mobile_position', `${Math.round(mobileX)}% ${Math.round(mobileY)}%`]], 'mobile')} disabled={saving === 'mobile'} className="pol-btn-primary">
              {saving === 'mobile' ? 'Saving…' : 'Save Mobile Background'}
            </button>
            {saved === 'mobile' && <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>}
          </div>
        </div>
      </div>

      {/* Desktop Background */}
      <div className="pol-card p-6">
        <h2 className="font-semibold text-sm text-ink mb-1">Desktop Background Image</h2>
        <p className="text-xs text-stone-400 mb-4">Shown on desktop. If blank, uses mobile image. Drag to reposition.</p>
        <div className="mb-4">
          <DraggableImagePosition
            src={desktopBg || loginBg} fallback={FALLBACK}
            x={desktopX} y={desktopY}
            onChange={(x, y) => { setDesktopX(x); setDesktopY(y); }}
            aspect={16/9}
          />
        </div>
        <div className="space-y-3">
          <ImageUpload value={desktopBg} onChange={(url) => setDesktopBg(url)} label="Desktop Background Photo" folder="backgrounds" preview="wide" />
          <div className="flex items-center gap-3">
            <button onClick={() => saveMultiple([['login_background_desktop_url', desktopBg], ['login_background_desktop_position', `${Math.round(desktopX)}% ${Math.round(desktopY)}%`]], 'desktop')} disabled={saving === 'desktop'} className="pol-btn-primary">
              {saving === 'desktop' ? 'Saving…' : 'Save Desktop Background'}
            </button>
            {saved === 'desktop' && <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>}
          </div>
        </div>
      </div>

      {/* Stephen's Photo */}
      <div className="pol-card p-6">
        <h2 className="font-semibold text-sm text-ink mb-1">Stephen's Photo</h2>
        <p className="text-xs text-stone-400 mb-5">Appears on the Updates from Stephen page.</p>
        <div className="space-y-3">
          <ImageUpload value={stephenPhoto} onChange={(url) => setStephenPhoto(url)} label="Stephen's Photo" folder="brand" preview="square" />
          <div className="flex items-center gap-3">
            <button onClick={() => save('stephen_photo_url', stephenPhoto, 'stephen')} disabled={saving === 'stephen'} className="pol-btn-primary">{saving === 'stephen' ? 'Saving…' : 'Save Photo'}</button>
            {saved === 'stephen' && <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>}
          </div>
        </div>
      </div>

      {/* Latest Episode */}
      <div className="pol-card p-6 space-y-4">
        <h2 className="font-semibold text-sm text-ink mb-1">Latest Episode</h2>
        <p className="text-xs text-stone-400">Paste a YouTube URL for the latest People Of Lisbon episode.</p>
        <input className="pol-input" value={latestEpisode} onChange={e => setLatestEpisode(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
        {latestEpisode && (
          <div className="aspect-video w-full bg-stone-100 overflow-hidden rounded">
            <iframe src={`https://www.youtube.com/embed/${latestEpisode.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]}`} className="w-full h-full" allowFullScreen />
          </div>
        )}
        <div className="flex items-center gap-3">
          <button onClick={() => save('latest_episode_url', latestEpisode, 'episode')} disabled={saving === 'episode'} className="pol-btn-primary">{saving === 'episode' ? 'Saving…' : 'Save Episode'}</button>
          {saved === 'episode' && <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>}
        </div>
      </div>

      {/* Featured Person */}
      <div className="pol-card p-6">
        <h2 className="font-semibold text-sm text-ink mb-1">Splash Screen — Featured Person</h2>
        <p className="text-xs text-stone-400 mb-4">Appears top-right on the entry splash screen.</p>
        <input className="pol-input mb-4" value={featuredPerson} onChange={e => setFeaturedPerson(e.target.value)} placeholder="e.g. João Silva // Episode 211" />
        <div className="flex items-center gap-3">
          <button onClick={() => save('splash_featured_person', featuredPerson, 'featured')} disabled={saving === 'featured'} className="pol-btn-primary">{saving === 'featured' ? 'Saving…' : 'Save'}</button>
          {saved === 'featured' && <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>}
        </div>
      </div>
    </div>
  );
}
