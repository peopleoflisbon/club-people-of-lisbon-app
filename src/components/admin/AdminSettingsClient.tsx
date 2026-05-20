'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import BrandLogo from '@/components/ui/BrandLogo';
import ImageUpload from '@/components/ui/ImageUpload';

const POSITIONS = [
  'center top', 'center center', 'center bottom',
  'left top', 'left center', 'left bottom',
  'right top', 'right center', 'right bottom',
  '50% 20%', '50% 30%', '50% 40%', '50% 60%', '50% 70%', '50% 80%',
];

interface Props { settings: Record<string, string>; }

export default function AdminSettingsClient({ settings: initial }: Props) {
  const [loginBg, setLoginBg] = useState(initial['login_background_image_url'] || '');
  const [desktopBg, setDesktopBg] = useState(initial['login_background_desktop_url'] || '');
  const [mobilePosn, setMobilePosn] = useState(initial['login_background_mobile_position'] || 'center top');
  const [desktopPosn, setDesktopPosn] = useState(initial['login_background_desktop_position'] || 'center center');
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

  const FALLBACK_BG = 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=70';

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">Settings</h1>
        <p className="text-stone-500 text-sm">Brand and appearance settings for People Of Lisbon.</p>
      </div>

      {/* ── Brand Logo ── */}
      <div className="pol-card p-6">
        <h2 className="font-semibold text-sm text-ink mb-1">Brand Logo</h2>
        <p className="text-xs text-stone-400 mb-5">The square brand image used in the navigation and login screen.</p>
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

      {/* ── Mobile Background ── */}
      <div className="pol-card p-6">
        <h2 className="font-semibold text-sm text-ink mb-1">Mobile Background Image</h2>
        <p className="text-xs text-stone-400 mb-4">Shown on phones and tablets on the login splash screen.</p>

        {/* Preview */}
        <div className="relative rounded-xl overflow-hidden mb-4" style={{ height: 220, background: '#111' }}>
          <img src={loginBg || FALLBACK_BG} alt="Mobile preview"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: mobilePosn }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>MOBILE PREVIEW</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'white', lineHeight: 1.1 }}>Lisbon's most <span style={{ background: '#C8102E', padding: '0 4px' }}>interesting</span> people.</div>
          </div>
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: 'white' }}>
            Position: {mobilePosn}
          </div>
        </div>

        <div className="space-y-3">
          <ImageUpload value={loginBg} onChange={(url) => setLoginBg(url)} label="Mobile Background Photo" folder="backgrounds" preview="wide" />
          <div>
            <label className="pol-label">Image Position</label>
            <select className="pol-input" value={mobilePosn} onChange={e => setMobilePosn(e.target.value)}>
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => saveMultiple([['login_background_image_url', loginBg], ['login_background_mobile_position', mobilePosn]], 'mobile')} disabled={saving === 'mobile'} className="pol-btn-primary">
              {saving === 'mobile' ? 'Saving…' : 'Save Mobile Background'}
            </button>
            {saved === 'mobile' && <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>}
          </div>
        </div>
      </div>

      {/* ── Desktop Background ── */}
      <div className="pol-card p-6">
        <h2 className="font-semibold text-sm text-ink mb-1">Desktop Background Image</h2>
        <p className="text-xs text-stone-400 mb-4">Shown on desktop screens on the login splash screen. If left blank, uses the mobile image.</p>

        {/* Preview */}
        <div className="relative rounded-xl overflow-hidden mb-4" style={{ height: 220, background: '#111' }}>
          <img src={desktopBg || loginBg || FALLBACK_BG} alt="Desktop preview"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: desktopPosn }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.05) 100%)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 24, transform: 'translateY(-50%)' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>DESKTOP PREVIEW</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1, maxWidth: 260 }}>Lisbon's most <span style={{ background: '#C8102E', padding: '0 4px' }}>interesting</span> people, all in one place.</div>
          </div>
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: 'white' }}>
            Position: {desktopPosn}
          </div>
        </div>

        <div className="space-y-3">
          <ImageUpload value={desktopBg} onChange={(url) => setDesktopBg(url)} label="Desktop Background Photo" folder="backgrounds" preview="wide" />
          <div>
            <label className="pol-label">Image Position</label>
            <select className="pol-input" value={desktopPosn} onChange={e => setDesktopPosn(e.target.value)}>
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => saveMultiple([['login_background_desktop_url', desktopBg], ['login_background_desktop_position', desktopPosn]], 'desktop')} disabled={saving === 'desktop'} className="pol-btn-primary">
              {saving === 'desktop' ? 'Saving…' : 'Save Desktop Background'}
            </button>
            {saved === 'desktop' && <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>}
          </div>
        </div>
      </div>

      {/* ── Stephen's Photo ── */}
      <div className="pol-card p-6">
        <h2 className="font-semibold text-sm text-ink mb-1">Stephen's Photo</h2>
        <p className="text-xs text-stone-400 mb-5">This photo appears at the top of the Updates from Stephen page.</p>
        <div className="space-y-3">
          <ImageUpload value={stephenPhoto} onChange={(url) => setStephenPhoto(url)} label="Stephen's Photo" folder="brand" preview="square" />
          <div className="flex items-center gap-3">
            <button onClick={() => save('stephen_photo_url', stephenPhoto, 'stephen')} disabled={saving === 'stephen'} className="pol-btn-primary">{saving === 'stephen' ? 'Saving…' : 'Save Photo'}</button>
            {saved === 'stephen' && <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>}
          </div>
        </div>
      </div>

      {/* ── Latest Episode ── */}
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

      {/* ── Splash Featured Person ── */}
      <div className="pol-card p-6">
        <h2 className="font-semibold text-sm text-ink mb-1">Splash Screen — Featured Person</h2>
        <p className="text-xs text-stone-400 mb-4">This text appears top-right on the entry splash screen.</p>
        <input className="pol-input mb-4" value={featuredPerson} onChange={e => setFeaturedPerson(e.target.value)} placeholder="e.g. João Silva // Episode 211" />
        <div className="flex items-center gap-3">
          <button onClick={() => save('splash_featured_person', featuredPerson, 'featured')} disabled={saving === 'featured'} className="pol-btn-primary">{saving === 'featured' ? 'Saving…' : 'Save'}</button>
          {saved === 'featured' && <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>}
        </div>
      </div>
    </div>
  );
}
