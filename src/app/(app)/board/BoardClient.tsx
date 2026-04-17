'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import Avatar from '@/components/ui/Avatar';
import Link from 'next/link';

interface Post {
  id: string;
  content: string;
  created_at: string;
  profiles: { id: string; full_name: string; avatar_url: string; job_title: string };
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function BoardClient({ posts: initial, profile }: { posts: Post[]; profile: any }) {
  const [posts, setPosts] = useState(initial);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const supabase = createClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Real-time subscription — new posts pop up instantly at the top
  useEffect(() => {
    const channel = supabase
      .channel('board-posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'board_posts' }, async (payload) => {
        // Skip if we already added this optimistically (same author posting)
        const { data } = await (supabase as any)
          .from('board_posts')
          .select('id, content, created_at, profiles(id, full_name, avatar_url, job_title)')
          .eq('id', payload.new.id)
          .single();
        if (data) {
          setPosts(prev => {
            // Replace any temp post with same content, or add if from someone else
            const hasDuplicate = prev.some(p => p.id === data.id);
            if (hasDuplicate) return prev;
            const tempIdx = prev.findIndex(p => p.id.startsWith('temp-') && p.content === data.content);
            if (tempIdx !== -1) {
              const updated = [...prev];
              updated[tempIdx] = data;
              return updated;
            }
            return [data, ...prev];
          });
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'board_posts' }, (payload) => {
        setPosts(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []); // eslint-disable-line

  async function post() {
    if (!text.trim() || posting) return;
    setPosting(true);
    const content = text.trim();
    setText('');

    // Optimistically add to top immediately
    const optimistic: Post = {
      id: `temp-${Date.now()}`,
      content,
      created_at: new Date().toISOString(),
      profiles: { id: profile.id, full_name: profile.full_name, avatar_url: profile.avatar_url, job_title: profile.job_title || '' },
    };
    setPosts(prev => [optimistic, ...prev]);

    // Insert to DB — realtime will update other users
    const { data } = await (supabase as any)
      .from('board_posts')
      .insert({ content, author_id: profile.id })
      .select('id, content, created_at, profiles(id, full_name, avatar_url, job_title)')
      .single();

    // Replace optimistic post with real one
    if (data) {
      setPosts(prev => prev.map(p => p.id === optimistic.id ? data : p));
    }

    setPosting(false);
    textareaRef.current?.focus();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); post(); }
  }

  const remaining = 180 - text.length;

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-white border-b border-stone-100 flex-shrink-0">
        <h1 className="font-display text-2xl text-ink">Message Board</h1>
        <p className="text-stone-400 text-xs mt-0.5 leading-snug">Post your very quick thought, events, happenings. Keep it simple folks. This is not a chat board.</p>
      </div>

      {/* Composer */}
      <div className="px-4 py-3 bg-white border-b border-stone-100 flex-shrink-0">
        <div className="flex gap-3">
          <Avatar src={profile?.avatar_url} name={profile?.full_name} size="sm" className="flex-shrink-0 mt-1" />
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value.slice(0, 180))}
              onKeyDown={handleKey}
              placeholder="What's happening?"
              rows={2}
              className="w-full text-sm text-ink placeholder-stone-400 resize-none focus:outline-none leading-relaxed"
            />
            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs ${remaining < 20 ? 'text-red-400' : 'text-stone-300'}`}>{remaining}</span>
              <button onClick={post} disabled={posting || !text.trim()}
                className="pol-btn-primary text-xs px-4 py-1.5 disabled:opacity-40">
                {posting ? '…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts — latest at top */}
      <div className="flex-1 overflow-y-auto">
        {posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-stone-400 text-sm">Nothing posted yet — be the first.</p>
          </div>
        )}
        {posts.map(post => (
          <div key={post.id} className="px-4 py-4 border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
            <div className="flex gap-3">
              <Link href={`/members/${post.profiles?.id}`} className="flex-shrink-0">
                <Avatar src={post.profiles?.avatar_url} name={post.profiles?.full_name} size="sm" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <Link href={`/members/${post.profiles?.id}`} className="font-semibold text-sm text-ink hover:underline">
                    {post.profiles?.full_name}
                  </Link>
                  {post.profiles?.job_title && (
                    <span className="text-xs text-stone-400">{post.profiles.job_title}</span>
                  )}
                  <span className="text-xs text-stone-300">{timeAgo(post.created_at)}</span>
                </div>
                <p className="text-sm text-ink mt-1 leading-relaxed" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {post.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
