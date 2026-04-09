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
  expires_at: string;
  created_at: string;
  token: string;
}

interface Props {
  members: MemberRow[];
  invitations: InviteRow[];
}

export default function AdminMembersClient({ members, invitations }: Props) {
  const [tab, setTab] = useState<'members' | 'invites'>('members');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [localInvites, setLocalInvites] = useState(invitations);
  const [localMembers, setLocalMembers] = useState(members);
  const [resending, setResending] = useState<string | null>(null);
  const supabase = createClient();

  async function sendInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteMsg('');
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteMsg(`Error: ${data.error}`);
      } else {
        setInviteMsg(`✓ Invitation sent to ${inviteEmail.trim()}`);
        setInviteEmail('');
      }
    } catch {
      setInviteMsg('Failed to send. Please try again.');
    }
    setInviting(false);
  }

  async function resendInvite(email: string) {
    setResending(email);
    try {
      const res = await fetch('/api/invite', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Error: ${data.error}`);
      } else {
        alert(`✓ New invite link sent to ${email}`);
      }
    } catch {
      alert('Failed to resend. Please try again.');
    }
    setResending(null);
  }

  async function revokeInvite(id: string) {
    await supabase.from('invitations').update({ status: 'revoked' }).eq('id', id);
    setLocalInvites((prev) => prev.map((i) => i.id === id ? { ...i, status: 'revoked' } : i));
  }

  async function toggleMember(id: string, current: boolean) {
    await supabase.from('profiles').update({ is_active: !current }).eq('id', id);
    setLocalMembers((prev) => prev.map((m) => m.id === id ? { ...m, is_active: !current } : m));
  }

  async function toggleAdmin(id: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    setLocalMembers((prev) => prev.map((m) => m.id === id ? { ...m, role: newRole } : m));
  }

  function exportEmails() {
    const emails = localMembers.filter((m) => m.is_active).map((m) => m.email).join('\n');
    const blob = new Blob([emails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pol-members.txt';
    a.click();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-ink">Members</h1>
        <button onClick={exportEmails} className="pol-btn-secondary text-sm">
          Export Emails
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-6 w-fit">
        {(['members', 'invites'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all',
              tab === t ? 'bg-white text-ink shadow-sm' : 'text-stone-500 hover:text-ink'
            )}
          >
            {t === 'members' ? `Members (${localMembers.length})` : `Invites (${localInvites.length})`}
          </button>
        ))}
      </div>

      {tab === 'members' && (
        <div className="space-y-2">
          {localMembers.map((member) => (
            <div key={member.id} className="pol-card p-4 flex items-center gap-4">
              <Avatar src={member.avatar_url} name={member.full_name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-ink">{member.full_name || '(no name)'}</p>
                  {member.role === 'admin' && (
                    <span className="text-2xs bg-brand/10 text-brand px-2 py-0.5 rounded-full font-semibold">Admin</span>
                  )}
                  {!member.is_active && (
                    <span className="text-2xs bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full font-semibold">Inactive</span>
                  )}
                </div>
                <p className="text-xs text-stone-400">{member.email}</p>
                {member.neighborhood && <p className="text-xs text-stone-400">{member.neighborhood}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleAdmin(member.id, member.role)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 hover:border-brand hover:text-brand transition-colors"
                >
                  {member.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                </button>
                <button
                  onClick={() => toggleMember(member.id, member.is_active)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-lg border transition-colors',
                    member.is_active
                      ? 'border-stone-200 hover:border-red-300 hover:text-red-500'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  )}
                >
                  {member.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'invites' && (
        <div className="space-y-4">
          {/* Send invite */}
          <div className="pol-card p-5">
            <h2 className="font-semibold text-sm text-stone-500 uppercase tracking-wider mb-3">Send Invite</h2>
            <div className="flex gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
                placeholder="member@email.com"
                className="pol-input flex-1"
              />
              <button onClick={sendInvite} disabled={inviting || !inviteEmail} className="pol-btn-primary">
                {inviting ? '…' : 'Send'}
              </button>
            </div>
            {inviteMsg && <p className="text-sm mt-2 text-emerald-600">{inviteMsg}</p>}
          </div>

          {/* Invite list */}
          <div className="space-y-2">
            {localInvites.length === 0 && (
              <p className="text-stone-400 text-sm text-center py-8">No invites sent yet.</p>
            )}
            {localInvites.map((invite) => (
              <div key={invite.id} className="pol-card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-ink">{invite.email}</p>
                  <p className="text-xs text-stone-400 mt-0.5">Invited {formatDate(invite.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn(
                    'text-xs px-2 py-1 font-semibold capitalize',
                    invite.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    invite.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-stone-100 text-stone-500'
                  )}>
                    {invite.status === 'pending' ? 'Invited' : invite.status}
                  </span>
                  <button
                    onClick={() => resendInvite(invite.email)}
                    disabled={resending === invite.email}
                    className="text-xs px-3 py-1.5 border border-brand text-brand hover:bg-brand hover:text-white transition-colors disabled:opacity-40"
                  >
                    {resending === invite.email ? '…' : 'Resend'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
