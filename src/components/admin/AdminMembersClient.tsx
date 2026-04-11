'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import Avatar from '@/components/ui/Avatar';
import { formatDate, cn } from '@/lib/utils';

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
  const [editSaving, setEditSaving] = useState(false);
  const [resetMember, setResetMember] = useState<MemberRow | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetSaving, setResetSaving] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const supabase = createClient();

  function startEditMember(member: MemberRow) {
    setEditingMember(member);
    setEditForm({
      full_name: (member as any).full_name || '',
      headline: (member as any).headline || '',
      job_title: (member as any).job_title || '',
      neighborhood: (member as any).neighborhood || '',
      short_bio: (member as any).short_bio || '',
    });
  }

  async function saveEditMember() {
    if (!editingMember) return;
    setEditSaving(true);
    await supabase.from('profiles').update(editForm).eq('id', editingMember.id);
    setLocalMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, ...editForm } : m));
    setEditSaving(false);
    setEditingMember(null);
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
        setLocalInvites(prev => {
          if (prev.find(i => i.email === inviteEmail.trim())) return prev;
          return [{ id: Date.now().toString(), email: inviteEmail.trim(), status: 'pending', created_at: new Date().toISOString() }, ...prev];
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
    await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    setLocalMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
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
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">Edit {editingMember.full_name || 'Member'}</h2>
              <button onClick={() => setEditingMember(null)} className="text-stone-400 hover:text-ink text-xl">✕</button>
            </div>
            {[
              { label: 'Full Name', key: 'full_name', placeholder: 'Jane Smith' },
              { label: 'Headline', key: 'headline', placeholder: 'Filmmaker & Lisbon enthusiast' },
              { label: 'Job Title', key: 'job_title', placeholder: 'Founder, Writer…' },
              { label: 'Neighbourhood', key: 'neighborhood', placeholder: 'Alfama' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="pol-label">{label}</label>
                <input className="pol-input" value={editForm[key] || ''} onChange={e => setEditForm((f: any) => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} />
              </div>
            ))}
            <div>
              <label className="pol-label">Short Bio</label>
              <textarea className="pol-textarea" rows={3} value={editForm.short_bio || ''} onChange={e => setEditForm((f: any) => ({ ...f, short_bio: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={saveEditMember} disabled={editSaving} className="pol-btn-primary flex-1">
                {editSaving ? 'Saving…' : 'Save Changes'}
              </button>
              <button onClick={() => setEditingMember(null)} className="pol-btn-secondary">Cancel</button>
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
