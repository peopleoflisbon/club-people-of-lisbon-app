'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import Avatar from '@/components/ui/Avatar';
import { LISBON_NEIGHBORHOODS, cn } from '@/lib/utils';
import type { Profile } from '@/types';

export default function ProfileForm({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    headline: profile?.headline || '',
    job_title: profile?.job_title || '',
    short_bio: profile?.short_bio || '',
    neighborhood: profile?.neighborhood || '',
    linkedin_url: profile?.linkedin_url || '',
    instagram_handle: profile?.instagram_handle || '',
    twitter_handle: profile?.twitter_handle || '',
    website_url: profile?.website_url || '',
    favorite_spots: profile?.favorite_spots || '',
    personal_story: profile?.personal_story || '',
    open_to_feature: profile?.open_to_feature || false,
  });

  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function uploadAvatar(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `avatars/${profile.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
      setAvatarUrl(publicUrl);
    } catch (err) {
      setError('Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');

    const { error: saveError } = await supabase
      .from('profiles')
      .update({ ...form, avatar_url: avatarUrl })
      .eq('id', profile.id);

    setSaving(false);
    if (saveError) {
      setError(saveError.message);
    } else {
      setSaved(true);
      setTimeout(() => {
        window.location.href = `/members/${profile.id}`;
      }, 800);
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="pol-card p-6">
        <h2 className="font-semibold text-sm text-stone-500 uppercase tracking-wider mb-4">Photo</h2>
        <div className="flex items-center gap-4">
          <Avatar src={avatarUrl} name={form.full_name} size="xl" />
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="pol-btn-secondary text-sm"
            >
              {uploading ? 'Uploading…' : 'Change Photo'}
            </button>
            <p className="text-xs text-stone-400 mt-1">JPG, PNG. Max 5MB.</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadAvatar(file);
            }}
          />
        </div>
      </div>

      {/* Basic info */}
      <div className="pol-card p-6 space-y-4">
        <h2 className="font-semibold text-sm text-stone-500 uppercase tracking-wider">About</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="pol-label">Full Name</label>
            <input className="pol-input" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="Ana Rodrigues" />
          </div>
          <div>
            <label className="pol-label">Neighborhood</label>
            <select className="pol-input" value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)}>
              <option value="">Select neighborhood</option>
              {LISBON_NEIGHBORHOODS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="pol-label">Headline</label>
          <input className="pol-input" value={form.headline} onChange={(e) => set('headline', e.target.value)} placeholder="Filmmaker & Lisbon enthusiast" />
        </div>

        <div>
          <label className="pol-label">Job Title</label>
          <input className="pol-input" value={form.job_title} onChange={(e) => set('job_title', e.target.value)} placeholder="Filmmaker, Founder, Writer…" />
        </div>

        <div>
          <label className="pol-label">Short Bio</label>
          <textarea className="pol-textarea" rows={3} value={form.short_bio} onChange={(e) => set('short_bio', e.target.value)} placeholder="A few sentences about you…" />
        </div>

        <div>
          <label className="pol-label">My Lisbon Story</label>
          <textarea className="pol-textarea" rows={4} value={form.personal_story} onChange={(e) => set('personal_story', e.target.value)} placeholder="How did you end up in Lisbon? What keeps you here?" />
        </div>

        <div>
          <label className="pol-label">Favourite Lisbon Spots</label>
          <textarea className="pol-textarea" rows={3} value={form.favorite_spots} onChange={(e) => set('favorite_spots', e.target.value)} placeholder="Pastéis de Belém for breakfast, sunset at Miradouro da Graça…" />
        </div>
      </div>

      {/* Social */}
      <div className="pol-card p-6 space-y-4">
        <h2 className="font-semibold text-sm text-stone-500 uppercase tracking-wider">Links</h2>
        <div>
          <label className="pol-label">LinkedIn URL</label>
          <input className="pol-input" type="url" value={form.linkedin_url} onChange={(e) => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/yourname" />
        </div>
        <div>
          <label className="pol-label">Instagram Handle</label>
          <input className="pol-input" value={form.instagram_handle} onChange={(e) => set('instagram_handle', e.target.value)} placeholder="@yourhandle" />
        </div>
        <div>
          <label className="pol-label">Website</label>
          <input className="pol-input" type="url" value={form.website_url} onChange={(e) => set('website_url', e.target.value)} placeholder="https://yoursite.com" />
        </div>
      </div>

      {/* Feature checkbox */}
      <div className="pol-card p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.open_to_feature}
            onChange={(e) => set('open_to_feature', e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-stone-300 text-brand focus:ring-brand"
          />
          <div>
            <p className="font-semibold text-sm text-ink">Open to being featured on People Of Lisbon</p>
            <p className="text-xs text-stone-400 mt-0.5">We may reach out to feature your story in a video.</p>
          </div>
        </label>
      </div>

      {/* Save */}
      {error && <p className="text-brand text-sm px-1">{error}</p>}
      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="pol-btn-primary">
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
        {saved && <span className="text-sm text-green-600 font-medium">✓ Saved</span>}
      </div>
    </div>
  );
}
