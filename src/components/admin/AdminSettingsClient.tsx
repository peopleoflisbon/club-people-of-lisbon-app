'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import BrandLogo from '@/components/ui/BrandLogo';
import ImageUpload from '@/components/ui/ImageUpload';

interface Props {
  settings: Record<string, string>;
}

export default function AdminSettingsClient({ settings: initial }: Props) {
  const [loginBg, setLoginBg] = useState(initial['login_background_image_url'] || '');
  const [brandLogo, setBrandLogo] = useState(initial['brand_square_image_url'] || '/pol-logo.png');
  const [stephenPhoto, setStephenPhoto] = useState(initial['stephen_photo_url'] || '');
  const [latestEpisode, setLatestEpisode] = useState(initial['latest_episode_url'] || '');
  const [savingBg, setSavingBg] = useState(false);
  const [savedBg, setSavedBg] = useState(false);
  const [savingLogo, setSavingLogo] = useState(false);
  const [savedLogo, setSavedLogo] = useState(false);
  const [savingStephen, setSavingStephen] = useState(false);
  const [savedStephen, setSavedStephen] = useState(false);
  const [savingEpisode, setSavingEpisode] = useState(false);
  const [savedEpisode, setSavedEpisode] = useState(false);
  const [bgImgError, setBgImgError] = useState(false);
  const supabase = createClient();

  async function save(key: string, value: string, setSaving: (v: boolean) => void, setSaved: (v: boolean) => void) {
    setSaving(true);
    setSaved(false);
    await supabase.from('app_settings').upsert({ key, value });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const FALLBACK_BG = 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=70';
  const bgPreviewSrc = loginBg || FALLBACK_BG;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">Settings</h1>
        <p className="text-stone-500 text-sm">Brand and appearance settings for People Of Lisbon.</p>
      </div>

      {/* ── Brand Logo ── */}
      <div className="pol-card p-6">
        <h2 className="font-semibold text-sm text-ink mb-1">Brand Logo</h2>
        <p className="text-xs text-stone-400 mb-5">
          The square brand image used in the navigation, login screen, and admin panel.
          Upload to Supabase Storage and paste the public URL here.
          The default is the uploaded People Of Lisbon logo.
        </p>

        {/* Preview */}
        <div className="flex items-center gap-5 mb-5 p-4 bg-stone-50 rounded-xl border border-stone-100">
          <BrandLogo src={brandLogo} size={64} radius={14} className="shadow-md shadow-brand/20" />
          <div>
            <p className="font-semibold text-sm text-ink">Current logo</p>
            <p className="text-xs text-stone-400 mt-0.5 max-w-xs truncate">{brandLogo || 'Default'}</p>
            <p className="text-xs text-stone-300 mt-1">Used in: navigation, login screen, admin panel</p>
          </div>
        </div>

        <div className="space-y-3">
          <ImageUpload
            value={brandLogo === '/pol-logo.png' ? '' : brandLogo}
            onChange={(url) => { setBrandLogo(url || '/pol-logo.png'); setSavedLogo(false); }}
            label="Logo Image"
            folder="brand"
            preview="square"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => save('brand_square_image_url', brandLogo, setSavingLogo, setSavedLogo)}
              disabled={savingLogo}
              className="pol-btn-primary"
            >
              {savingLogo ? 'Saving…' : 'Save Logo'}
            </button>
            {savedLogo && <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>}
            <button
              onClick={() => { setBrandLogo('/pol-logo.png'); setSavedLogo(false); }}
              className="pol-btn-ghost text-xs"
            >
              Reset to default
            </button>
          </div>
        </div>
      </div>

      {/* ── Login Background ── */}
      <div className="pol-card p-6">
        <h2 className="font-semibold text-sm text-ink mb-1">Login Screen Background</h2>
        <p className="text-xs text-stone-400 mb-5">
          The full-screen photo behind the login form.
          Leave blank to use the default Lisbon photo.
          Upload to Supabase Storage → media bucket → paste public URL.
        </p>

        {/* Preview */}
        <div className="relative rounded-xl overflow-hidden h-44 bg-stone-900 mb-5">
          {!bgImgError && (
            <img
              src={bgPreviewSrc}
              alt="Login background preview"
              className="absolute inset-0 w-full h-full object-cover opacity-55"
              onError={() => setBgImgError(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-ink/85 via-ink/55 to-ink/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand/15 via-transparent to-transparent" />
          {/* Mini login preview */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/[0.06] border border-white/10 rounded-xl p-5 w-36 text-center">
              <BrandLogo src={brandLogo} size={32} radius={8} className="mx-auto mb-2 shadow-md shadow-brand/30" />
              <p className="font-display text-white text-xs leading-tight">People Of Lisbon</p>
              <div className="mt-3 h-6 bg-white/10 rounded-lg" />
              <div className="mt-2 h-6 bg-white/10 rounded-lg" />
              <div className="mt-3 h-7 bg-brand/80 rounded-lg" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent" />
        </div>

        <div className="space-y-3">
          <ImageUpload
            value={loginBg}
            onChange={(url) => { setLoginBg(url); setBgImgError(false); setSavedBg(false); }}
            label="Background Photo"
            folder="backgrounds"
            preview="wide"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => save('login_background_image_url', loginBg, setSavingBg, setSavedBg)}
              disabled={savingBg}
              className="pol-btn-primary"
            >
              {savingBg ? 'Saving…' : 'Save Background'}
            </button>
            {savedBg && <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>}
            {loginBg && (
              <button
                onClick={() => { setLoginBg(''); setBgImgError(false); setSavedBg(false); }}
                className="pol-btn-ghost text-xs"
              >
                Reset to default
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Stephen's Photo ── */}
      <div className="pol-card p-6">
        <h2 className="font-semibold text-sm text-ink mb-1">Stephen's Photo</h2>
        <p className="text-xs text-stone-400 mb-5">
          This photo appears at the top of the Updates from Stephen page.
        </p>
        <div className="space-y-3">
          <ImageUpload
            value={stephenPhoto}
            onChange={(url) => { setStephenPhoto(url); setSavedStephen(false); }}
            label="Stephen's Photo"
            folder="brand"
            preview="square"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => save('stephen_photo_url', stephenPhoto, setSavingStephen, setSavedStephen)}
              disabled={savingStephen}
              className="pol-btn-primary"
            >
              {savingStephen ? 'Saving…' : 'Save Photo'}
            </button>
            {savedStephen && <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>}
          </div>
        </div>
      </div>

      {/* ── Latest Episode ── */}
      <div className="pol-card p-6 space-y-4">
        <h2 className="font-semibold text-sm text-ink mb-1">Latest Episode</h2>
        <p className="text-xs text-stone-400">Paste a YouTube URL for the latest People Of Lisbon episode. It will appear on the home screen under New Member.</p>
        <input
          className="pol-input"
          value={latestEpisode}
          onChange={e => setLatestEpisode(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=EYfPjPnQeP4"
        />
        {latestEpisode && (
          <div className="aspect-video w-full bg-stone-100 overflow-hidden rounded">
            <iframe
              src={`https://www.youtube.com/embed/${latestEpisode.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]}`}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        )}
        <div className="flex items-center gap-3">
          <button onClick={() => save('latest_episode_url', latestEpisode, setSavingEpisode, setSavedEpisode)} disabled={savingEpisode} className="pol-btn-primary">
            {savingEpisode ? 'Saving…' : 'Save Episode'}
          </button>
          {savedEpisode && <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
        <h3 className="font-semibold text-sm text-ink mb-3">How to update images</h3>
        <ol className="text-xs text-stone-500 space-y-2 list-decimal list-inside">
          <li>In your Supabase project, go to <strong>Storage</strong></li>
          <li>Open the <strong>media</strong> bucket (or create it if it doesn't exist)</li>
          <li>Upload your image file (PNG or JPG, high resolution)</li>
          <li>Click the file → <strong>Get URL</strong> → copy the public URL</li>
          <li>Paste the URL above and click Save</li>
        </ol>
      </div>
    </div>
  );
}
