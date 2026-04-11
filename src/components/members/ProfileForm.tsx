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
    company: (profile as any)?.company || '',
    short_bio: profile?.short_bio || '',
    neighborhood: profile?.neighborhood || '',
    linkedin_url: profile?.linkedin_url || '',
    instagram_handle: profile?.instagram_handle || '',
    twitter_handle: profile?.twitter_handle || '',
    website_url: profile?.website_url || '',
    favorite_spots: profile?.favorite_spots || '',
    personal_story: profile?.personal_story || '',
    open_to_feature: profile?.open_to_feature || false,
    nationality: (profile as any)?.nationality || '',
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
    setError('');
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      // Add timestamp to bust CDN cache
      const path = `avatars/${profile.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(path, file, { upsert: false, contentType: file.type });

      if (uploadError) {
        // Try upsert if upload fails (bucket may require it)
        const { error: upsertError } = await supabase.storage
          .from('media')
          .upload(`avatars/${profile.id}.${ext}`, file, { upsert: true, contentType: file.type });
        if (upsertError) throw upsertError;
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(`avatars/${profile.id}.${ext}`);
        setAvatarUrl(publicUrl + '?t=' + Date.now());
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
      setAvatarUrl(publicUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(`Photo upload failed: ${err?.message || 'Please try again'}`);
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
          <div className="relative flex-shrink-0 cursor-pointer group" onClick={() => fileRef.current?.click()}>
            <Avatar src={avatarUrl} name={form.full_name} size="xl" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-bold">Change</span>
            </div>
          </div>
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="pol-btn-primary text-sm"
            >
              {uploading ? 'Uploading…' : avatarUrl ? 'Change Photo' : 'Add Photo'}
            </button>
            <p className="text-xs text-stone-400 mt-1">JPG or PNG · max 5MB</p>
            <p className="text-xs text-stone-400">Tap photo or button to upload</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 5 * 1024 * 1024) {
                  setError('Photo must be under 5MB');
                  return;
                }
                uploadAvatar(file);
              }
              // Reset input so same file can be selected again
              e.target.value = '';
            }}
          />
        </div>
        {uploading && (
          <div className="mt-3 h-1 bg-stone-100 overflow-hidden">
            <div className="h-full bg-brand animate-pulse" style={{ width: '60%' }} />
          </div>
        )}
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
          <label className="pol-label">Company / Project</label>
          <input className="pol-input" value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="People Of Lisbon, Acme Corp…" />
        </div>

        <div>
          <label className="pol-label">Nationality 🌍</label>
          <select className="pol-input" value={form.nationality} onChange={(e) => set('nationality', e.target.value)}>
            <option value="">Select your nationality</option>
            {['Irish','British','American','Portuguese','French','Spanish','Italian','German','Brazilian','Australian','Canadian','Dutch','Belgian','Swedish','Norwegian','Danish','Finnish','Polish','Russian','Ukrainian','Greek','Turkish','Israeli','South African','Indian','Chinese','Japanese','Korean','Mexican','Argentine','Colombian','Chilean','Venezuelan','Latvian','Lithuanian','Estonian','Romanian','Hungarian','Czech','Slovak','Croatian','Serbian','Swiss','Austrian','New Zealander','Singaporean','Malaysian','Nigerian','Ghanaian','Kenyan','Ethiopian','Egyptian','Moroccan','Pakistani','Bangladeshi'].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
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
