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
          <div className="flex items-center border border-stone-200 bg-white focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all">
            <span className="px-3 py-3 text-stone-400 text-sm border-r border-stone-200 bg-stone-50 select-none">https://</span>
            <input className="flex-1 px-3 py-3 text-sm text-ink focus:outline-none" value={form.linkedin_url.replace(/^https?:\/\//,'')} onChange={(e) => set('linkedin_url', e.target.value ? 'https://' + e.target.value.replace(/^https?:\/\//,'') : '')} placeholder="linkedin.com/in/yourname" />
          </div>
        </div>
        <div>
          <label className="pol-label">Instagram Handle</label>
          <input className="pol-input" value={form.instagram_handle} onChange={(e) => set('instagram_handle', e.target.value)} placeholder="@yourhandle" />
        </div>
        <div>
          <label className="pol-label">Website</label>
          <div className="flex items-center border border-stone-200 bg-white focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all">
            <span className="px-3 py-3 text-stone-400 text-sm border-r border-stone-200 bg-stone-50 select-none">https://</span>
            <input className="flex-1 px-3 py-3 text-sm text-ink focus:outline-none" value={form.website_url.replace(/^https?:\/\//,'')} onChange={(e) => set('website_url', e.target.value ? 'https://' + e.target.value.replace(/^https?:\/\//,'') : '')} placeholder="yoursite.com" />
          </div>
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

      {/* Share Good News */}
      <GoodNewsSubmit profileId={profile.id} />

      {/* Change Password */}
      <ChangePassword />

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

function ChangePassword() {
  const supabase = createClient();
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function handleChange() {
    if (!newPw || newPw.length < 8) { setErr('Password must be at least 8 characters'); return; }
    if (newPw !== confirmPw) { setErr('Passwords do not match'); return; }
    setSaving(true); setErr(''); setMsg('');
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSaving(false);
    if (error) setErr(error.message);
    else { setMsg('Password updated successfully'); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }
  }

  return (
    <div className="pol-card p-6 space-y-4">
      <h2 className="font-semibold text-sm text-stone-500 uppercase tracking-wider">Change Password</h2>
      <div>
        <label className="pol-label">New Password</label>
        <input type="password" className="pol-input" value={newPw} onChange={e => { setNewPw(e.target.value); setErr(''); }} placeholder="Minimum 8 characters" />
      </div>
      <div>
        <label className="pol-label">Confirm New Password</label>
        <input type="password" className="pol-input" value={confirmPw} onChange={e => { setConfirmPw(e.target.value); setErr(''); }} placeholder="Repeat password" />
      </div>
      {err && <p className="text-red-500 text-sm">{err}</p>}
      {msg && <p className="text-green-600 text-sm font-semibold">✓ {msg}</p>}
      <button onClick={handleChange} disabled={saving || !newPw || !confirmPw} className="pol-btn-secondary text-sm">
        {saving ? 'Updating…' : 'Update Password'}
      </button>
    </div>
  );
}

function GoodNewsSubmit({ profileId }: { profileId: string }) {
  const supabase = createClient();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Win');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit() {
    if (!title.trim()) { setErr('Please add a title'); return; }
    setSubmitting(true); setErr('');
    const { error } = await (supabase as any).from('good_news_posts').insert({
      title: title.trim(),
      body: body.trim(),
      category,
      author_profile_id: profileId,
      is_published: false, // goes to admin queue
    });
    setSubmitting(false);
    if (error) setErr(error.message);
    else { setDone(true); setTitle(''); setBody(''); }
  }

  return (
    <div className="pol-card p-6 space-y-4">
      <div>
        <h2 className="font-semibold text-sm text-stone-500 uppercase tracking-wider mb-0.5">Share Good News</h2>
        <p className="text-xs text-stone-400">Did something great happen because of People Of Lisbon? Tell us about it — a deal, collaboration, friendship. Stephen will review and share with the club.</p>
      </div>
      {done ? (
        <div className="bg-green-50 border border-green-200 p-4">
          <p className="text-green-700 font-semibold text-sm">✓ Submitted! Stephen will review and share it with the club.</p>
          <button onClick={() => setDone(false)} className="text-green-600 text-xs mt-2 underline">Submit another</button>
        </div>
      ) : (
        <>
          <div>
            <label className="pol-label">Category</label>
            <select className="pol-input" value={category} onChange={e => setCategory(e.target.value)}>
              {['Win','Deal','Collaboration','Opportunity','Recommendation','Other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="pol-label">Headline</label>
            <input className="pol-input" value={title} onChange={e => { setTitle(e.target.value); setErr(''); }} placeholder="I got a new client through POL…" />
          </div>
          <div>
            <label className="pol-label">Tell us more (optional)</label>
            <textarea className="pol-textarea" rows={3} value={body} onChange={e => setBody(e.target.value)} placeholder="What happened? Who was involved?" />
          </div>
          {err && <p className="text-red-500 text-sm">{err}</p>}
          <button onClick={handleSubmit} disabled={submitting || !title} className="pol-btn-primary text-sm">
            {submitting ? 'Submitting…' : 'Share Good News'}
          </button>
        </>
      )}
    </div>
  );
}
