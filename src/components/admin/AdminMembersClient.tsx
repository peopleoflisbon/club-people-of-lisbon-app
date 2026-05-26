'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import Avatar from '@/components/ui/Avatar';
import { formatDate, cn, LISBON_NEIGHBORHOODS } from '@/lib/utils';

interface MemberRow {
  id: string;
  full_name: string;
  email: string;
  headline: string;
  neighborhood: string;
  role: string;
  is_active: boolean;
  joined_at: string;
  avatar_url: string;
}

interface InviteRow {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

interface Props {
  members: MemberRow[];
  invitations: InviteRow[];
}

export default function AdminMembersClient({ members, invitations }: Props) {
  const [tab, setTab] = useState<'members' | 'invites'>('members');
  const [inviteEmail, setInviteEmail] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedFor, setGeneratedFor] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [localMembers, setLocalMembers] = useState(members);
  const [localInvites, setLocalInvites] = useState(invitations);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<MemberRow | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editUploading, setEditUploading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editSaveMsg, setEditSaveMsg] = useState('');
  const [resetMember, setResetMember] = useState<MemberRow | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetSaving, setResetSaving] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function startEditMember(member: MemberRow) {
    setEditingMember(member);
    setEditAvatarUrl(member.avatar_url || '');
    setEditSaveMsg('');
    setEditLoading(true);
    // Fetch full profile on demand so the list stays fast
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', member.id)
      .single();
    setEditForm({
      full_name: data?.full_name || '',
      headline: data?.headline || '',
      job_title: data?.job_title || '',
      company: data?.company || '',
      neighborhood: data?.neighborhood || '',
      nationality: data?.nationality || '',
      short_bio: data?.short_bio || '',
      personal_story: data?.personal_story || '',
      favorite_spots: data?.favorite_spots || '',
      instagram_handle: data?.instagram_handle || '',
      linkedin_url: data?.linkedin_url || '',
      website_url: data?.website_url || '',
      open_to_feature: data?.open_to_feature || false,
    });
    setEditAvatarUrl(data?.avatar_url || member.avatar_url || '');
    setEditLoading(false);
  }

  async function uploadAvatar(file: File, memberId: string) {
    setEditUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `avatars/${memberId}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(path, file, { upsert: false, contentType: file.type });
      if (uploadError) {
        // Fallback: upsert with fixed name
        const fixedPath = `avatars/${memberId}.${ext}`;
        const { error: upsertError } = await supabase.storage
          .from('media')
          .upload(fixedPath, file, { upsert: true, contentType: file.type });
        if (upsertError) throw upsertError;
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fixedPath);
        setEditAvatarUrl(publicUrl + '?t=' + Date.now());
      } else {
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
        setEditAvatarUrl(publicUrl);
      }
    } catch (err: any) {
      alert(`Photo upload failed: ${err?.message || 'Please try again'}`);
    } finally {
      setEditUploading(false);
    }
  }

  async function saveEditMember() {
    if (!editingMember) return;
    setEditSaving(true);
    setEditSaveMsg('');
    try {
      const res = await fetch('/api/admin-update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: editingMember.id,
          updates: { ...editForm, avatar_url: editAvatarUrl },
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setEditSaveMsg(`Error: ${data.error || 'Save failed'}`);
      } else {
        setLocalMembers(prev => prev.map(m =>
          m.id === editingMember.id
            ? { ...m, ...editForm, avatar_url: editAvatarUrl }
            : m
        ));
        setEditSaveMsg('✓ Saved');
        setTimeout(() => {
          setEditingMember(null);
          setEditSaveMsg('');
        }, 800);
      }
    } catch (err: any) {
      setEditSaveMsg(`Error: ${err.message}`);
    }
    setEditSaving(false);
  }

  async function resetPassword() {
    if (!resetMember || !newPassword || newPassword.length < 8) return;
    setResetSaving(true);
    setResetMsg('');
    try {
      const res = await fetch('/api/admin-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: resetMember.id, password: newPassword }),
      });
      const data = await res.json();
      if (data.error) setResetMsg(`Error: ${data.error}`);
      else { setResetMsg('✓ Password updated'); setNewPassword(''); }
    } catch {
      setResetMsg('Failed. Try again.');
    }
    setResetSaving(false);
  }

  async function generateLink() {
    if (!inviteEmail.trim()) return;
    setGenerating(true);
    setGeneratedLink('');
    setError('');
    setCopied(false);
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to generate link');
      } else {
        setGeneratedLink(data.link);
        setGeneratedFor(inviteEmail.trim());
        const email = inviteEmail.trim();
        const realUserId = data.userId || '';
        setLocalInvites(prev => {
          if (prev.find(i => i.email === email)) return prev;
          return [{ id: Date.now().toString(), email, status: 'pending', created_at: new Date().toISOString() }, ...prev];
        });
        setLocalMembers(prev => {
          if (prev.find(m => m.email === email)) return prev;
          return [{ id: realUserId, email, full_name: '', headline: '', neighborhood: '', role: 'member', is_active: true, joined_at: new Date().toISOString(), avatar_url: '' } as any, ...prev];
        });
        setInviteEmail('');
      }
    } catch {
      setError('Failed to generate. Try again.');
    }
    setGenerating(false);
  }

  async function generateLinkForEmail(email: string) {
    setActionLoading(`gen-${email}`);
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Error: ${data.error}`);
      } else {
        setGeneratedLink(data.link);
        setGeneratedFor(email);
        setCopied(false);
        setTab('invites');
        window.scrollTo(0, 0);
      }
    } catch {
      alert('Failed to generate link.');
    }
    setActionLoading(null);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const el = document.getElementById('invite-link-text') as HTMLInputElement;
      if (el) { el.select(); document.execCommand('copy'); }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  }

  async function deleteUser(memberId: string, memberName: string) {
    if (!confirm(`Delete ${memberName || 'this member'}? They will need to be re-invited.`)) return;
    setActionLoading(`delete-${memberId}`);
    try {
      const res = await fetch('/api/invite', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: memberId }),
      });
      const data = await res.json();
      if (!res.ok) alert(`Error: ${data.error}`);
      else setLocalMembers(prev => prev.filter(m => m.id !== memberId));
    } catch {
      alert('Failed to delete.');
    }
    setActionLoading(null);
  }

  async function toggleMember(id: string, current: boolean) {
    await supabase.from('profiles').update({ is_active: !current }).eq('id', id);
    setLocalMembers(prev => prev.map(m => m.id === id ? { ...m, is_active: !current } : m));
  }

  async function toggleAdmin(id: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    const res = await fetch('/api/admin-set-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, role: newRole }),
    });
    if (res.ok) {
      setLocalMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
      if (newRole === 'admin') {
        alert('Admin rights granted. Ask them to refresh the app or tap any link — they will see Admin access immediately.');
      }
    }
  }

  function exportEmails() {
    const emails = localMembers.filter(m => m.is_active).map(m => m.email).join('\n');
    const blob = new Blob([emails], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pol-members.txt';
    a.click();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-ink">Members</h1>
        <button onClick={exportEmails} className="pol-btn-secondary text-sm">Export Emails</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 mb-6 w-fit">
        {(['members', 'invites'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-4 py-2 text-sm font-semibold capitalize transition-all', tab === t ? 'bg-white text-ink shadow-sm' : 'text-stone-500 hover:text-ink')}>
            {t === 'members' ? `Members (${localMembers.length})` : `Invites (${localInvites.length})`}
          </button>
        ))}
      </div>

      {/* EDIT MEMBER MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white w-full max-w-lg max-h-[92vh] overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
              <h2 className="font-display text-xl text-ink">
                Edit {editingMember.full_name || editingMember.email}
              </h2>
              <button onClick={() => setEditingMember(null)} className="text-stone-400 hover:text-ink text-xl leading-none">✕</button>
            </div>

            {editLoading ? (
              <div className="flex items-center justify-center py-16 text-stone-400 text-sm">Loading profile…</div>
            ) : (
              <div className="px-6 py-5 space-y-5 flex-1">

                {/* Photo */}
                <div>
                  <label className="pol-label">Photo</label>
                  <div className="flex items-center gap-4 mt-1">
                    <div
                      className="relative flex-shrink-0 cursor-pointer group"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Avatar src={editAvatarUrl} name={editForm.full_name || editingMember.email} size="xl" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold">Change</span>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => fileRef.current?.click()}
                        disabled={editUploading}
                        className="pol-btn-primary text-sm"
                      >
                        {editUploading ? 'Uploading…' : editAvatarUrl ? 'Change Photo' : 'Add Photo'}
                      </button>
                      <p className="text-xs text-stone-400 mt-1">JPG or PNG · max 5MB</p>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) { alert('Photo must be under 5MB'); return; }
                          uploadAvatar(file, editingMember.id);
                        }
                        e.target.value = '';
                      }}
                    />
                  </div>
                </div>

                <hr className="border-stone-100" />

                {/* Basic fields */}
                {[
                  { label: 'Full Name', key: 'full_name', placeholder: 'Jane Smith' },
                  { label: 'Headline', key: 'headline', placeholder: 'Filmmaker & Lisbon enthusiast' },
                  { label: 'Job Title', key: 'job_title', placeholder: 'Founder, Writer…' },
                  { label: 'Company / Project', key: 'company', placeholder: 'People Of Lisbon' },
                  { label: 'Nationality', key: 'nationality', placeholder: 'Irish' },
                  { label: 'Instagram', key: 'instagram_handle', placeholder: '@handle' },
                  { label: 'LinkedIn URL', key: 'linkedin_url', placeholder: 'https://linkedin.com/in/…' },
                  { label: 'Website', key: 'website_url', placeholder: 'https://…' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="pol-label">{label}</label>
                    <input
                      className="pol-input"
                      value={editForm[key] || ''}
                      onChange={e => setEditForm((f: any) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                    />
                  </div>
                ))}

                {/* Neighbourhood dropdown */}
                <div>
                  <label className="pol-label">Neighbourhood</label>
                  <select
                    className="pol-input"
                    value={editForm.neighborhood || ''}
                    onChange={e => setEditForm((f: any) => ({ ...f, neighborhood: e.target.value }))}
                  >
                    <option value="">Select neighbourhood</option>
                    {LISBON_NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                {/* Text areas */}
                <div>
                  <label className="pol-label">Short Bio</label>
                  <textarea
                    className="pol-textarea"
                    rows={3}
                    value={editForm.short_bio || ''}
                    onChange={e => setEditForm((f: any) => ({ ...f, short_bio: e.target.value }))}
                    placeholder="A few sentences about them…"
                  />
                </div>
                <div>
                  <label className="pol-label">My Lisbon Story</label>
                  <textarea
                    className="pol-textarea"
                    rows={3}
                    value={editForm.personal_story || ''}
                    onChange={e => setEditForm((f: any) => ({ ...f, personal_story: e.target.value }))}
                    placeholder="How did they end up in Lisbon?"
                  />
                </div>
                <div>
                  <label className="pol-label">Favourite Spots</label>
                  <textarea
                    className="pol-textarea"
                    rows={2}
                    value={editForm.favorite_spots || ''}
                    onChange={e => setEditForm((f: any) => ({ ...f, favorite_spots: e.target.value }))}
                    placeholder="Pastéis de Belém…"
                  />
                </div>

                {/* Open to feature */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.open_to_feature || false}
                    onChange={e => setEditForm((f: any) => ({ ...f, open_to_feature: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 rounded border-stone-300 text-brand focus:ring-brand"
                  />
                  <div>
                    <p className="font-semibold text-sm text-ink">Open to being featured</p>
                    <p className="text-xs text-stone-400 mt-0.5">They may be featured in a People Of Lisbon video.</p>
                  </div>
                </label>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stone-100 sticky bottom-0 bg-white flex items-center gap-3">
              <button
                onClick={saveEditMember}
                disabled={editSaving || editLoading || editUploading}
                className="pol-btn-primary flex-1"
              >
                {editSaving ? 'Saving…' : 'Save Changes'}
              </button>
              <button onClick={() => setEditingMember(null)} className="pol-btn-secondary">Cancel</button>
              {editSaveMsg && (
                <span className={`text-sm font-semibold ${editSaveMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                  {editSaveMsg}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">Reset Password</h2>
              <button onClick={() => { setResetMember(null); setNewPassword(''); setResetMsg(''); }} className="text-stone-400 hover:text-ink text-xl">✕</button>
            </div>
            <p className="text-stone-500 text-sm">Set a new password for <strong>{resetMember.full_name || resetMember.email}</strong>.</p>
            <div>
              <label className="pol-label">New Password</label>
              <input type="password" className="pol-input" value={newPassword} onChange={e => { setNewPassword(e.target.value); setResetMsg(''); }} placeholder="Min 8 characters" />
            </div>
            {resetMsg && <p className={`text-sm font-semibold ${resetMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>{resetMsg}</p>}
            <div className="flex gap-3">
              <button onClick={resetPassword} disabled={resetSaving || newPassword.length < 8} className="pol-btn-primary flex-1">
                {resetSaving ? 'Updating…' : 'Set Password'}
              </button>
              <button onClick={() => { setResetMember(null); setNewPassword(''); setResetMsg(''); }} className="pol-btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* INVITES TAB */}
      {tab === 'invites' && (
        <div className="space-y-5">
          {generatedLink && (
            <div className="bg-emerald-50 border-2 border-emerald-200 p-5">
              <p className="font-bold text-emerald-800 text-sm mb-1">✓ Link ready for {generatedFor}</p>
              <p className="text-emerald-700 text-xs mb-3">Copy and send via WhatsApp, iMessage, or email.</p>
              <div className="flex gap-2">
                <input id="invite-link-text" type="text" value={generatedLink} readOnly
                  className="flex-1 text-xs bg-white border border-emerald-200 px-3 py-2 text-stone-600 truncate" />
                <button onClick={copyLink}
                  className={cn('px-4 py-2 text-sm font-bold transition-all flex-shrink-0', copied ? 'bg-emerald-500 text-white' : 'bg-emerald-700 text-white hover:bg-emerald-800')}>
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
              </div>
              {copied && <p className="text-emerald-700 text-xs mt-2 font-semibold">Paste into WhatsApp or iMessage and send now.</p>}
            </div>
          )}

          <div className="pol-card p-5">
            <h2 className="font-bold text-sm text-ink mb-1">Invite a Member</h2>
            <p className="text-xs text-stone-400 mb-4">Enter their email, copy the link, send it yourself.</p>
            <div className="flex gap-3">
              <input type="email" value={inviteEmail} onChange={e => { setInviteEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && generateLink()}
                placeholder="member@email.com" className="pol-input flex-1" />
              <button onClick={generateLink} disabled={generating || !inviteEmail} className="pol-btn-primary flex-shrink-0">
                {generating ? 'Generating…' : 'Get Link'}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <div className="space-y-2">
            {localInvites.length === 0 && <p className="text-stone-400 text-sm text-center py-8">No invites yet.</p>}
            {localInvites.map(invite => (
              <div key={invite.id} className="pol-card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-ink">{invite.email}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{formatDate(invite.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn('text-xs px-2 py-1 font-semibold', invite.status === 'pending' ? 'bg-amber-100 text-amber-700' : invite.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500')}>
                    {invite.status === 'pending' ? 'Invited' : invite.status}
                  </span>
                  <button onClick={() => generateLinkForEmail(invite.email)} disabled={actionLoading === `gen-${invite.email}`}
                    className="text-xs px-3 py-1.5 border border-brand text-brand hover:bg-brand hover:text-white transition-colors disabled:opacity-40">
                    {actionLoading === `gen-${invite.email}` ? '…' : 'New Link'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEMBERS TAB */}
      {tab === 'members' && (
        <div className="space-y-2">
          {localMembers.map(member => (
            <div key={member.id} className="pol-card p-4">
              <div className="flex items-center gap-4">
                <Avatar src={member.avatar_url} name={member.full_name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-ink">{member.full_name || '(no name yet)'}</p>
                    {member.role === 'admin' && <span className="text-2xs bg-brand/10 text-brand px-2 py-0.5 font-semibold">Admin</span>}
                    {!member.is_active && <span className="text-2xs bg-stone-100 text-stone-400 px-2 py-0.5 font-semibold">Inactive</span>}
                  </div>
                  <p className="text-xs text-stone-400">{member.email}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                  <button onClick={() => startEditMember(member)} className="text-xs px-3 py-1.5 border border-stone-200 hover:border-brand hover:text-brand transition-colors">
                    Edit
                  </button>
                  <button onClick={() => { setResetMember(member); setNewPassword(''); setResetMsg(''); }} className="text-xs px-3 py-1.5 border border-stone-200 hover:border-amber-400 hover:text-amber-600 transition-colors">
                    Password
                  </button>
                  <button onClick={() => toggleAdmin(member.id, member.role)} className="text-xs px-3 py-1.5 border border-stone-200 hover:border-brand hover:text-brand transition-colors">
                    {member.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                  </button>
                  <button onClick={() => toggleMember(member.id, member.is_active)} className={cn('text-xs px-3 py-1.5 border transition-colors', member.is_active ? 'border-stone-200 hover:border-red-300 hover:text-red-500' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50')}>
                    {member.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => deleteUser(member.id, member.full_name)} disabled={actionLoading === `delete-${member.id}`}
                    className="text-xs px-3 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40">
                    {actionLoading === `delete-${member.id}` ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
              <MemberNumberEdit memberId={member.id} current={(member as any).membership_number} supabase={supabase} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MemberNumberEdit({ memberId, current, supabase }: { memberId: string; current?: number; supabase: any }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(current ? String(current) : '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await supabase.from('profiles').update({ membership_number: parseInt(val) || null }).eq('id', memberId);
    setSaving(false);
    setEditing(false);
  }

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="text-xs text-stone-400 hover:text-stone-600 mt-1">
        {current ? `Card #2020 ${current}` : '+ Set card number'} ✎
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-xs text-stone-400">2020</span>
      <input type="number" value={val} onChange={e => setVal(e.target.value)} className="w-24 text-xs border border-stone-200 px-2 py-1" placeholder="1001" />
      <button onClick={save} disabled={saving} className="text-xs px-2 py-1 bg-brand text-white">{saving ? '…' : 'Save'}</button>
      <button onClick={() => setEditing(false)} className="text-xs text-stone-400">Cancel</button>
    </div>
  );
}
