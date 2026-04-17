'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import Avatar from '@/components/ui/Avatar';

interface Post {
  id: string;
  content: string;
  created_at: string;
  profiles: { full_name: string; avatar_url: string };
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminBoardClient({ posts: initial }: { posts: Post[] }) {
  const [posts, setPosts] = useState(initial);
  const supabase = createClient();

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return;
    await (supabase as any).from('board_posts').delete().eq('id', id);
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-ink">Message Board</h1>
        <p className="text-stone-400 text-sm mt-0.5">{posts.length} posts</p>
      </div>
      <div className="space-y-2">
        {posts.length === 0 && <p className="text-stone-400 text-sm text-center py-8">No posts yet.</p>}
        {posts.map(post => (
          <div key={post.id} className="pol-card p-4 flex items-start gap-3">
            <Avatar src={post.profiles?.avatar_url} name={post.profiles?.full_name} size="sm" className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <p className="font-semibold text-sm text-ink">{post.profiles?.full_name}</p>
                <span className="text-xs text-stone-400">{timeAgo(post.created_at)}</span>
              </div>
              <p className="text-sm text-stone-600 mt-1 leading-relaxed">{post.content}</p>
            </div>
            <button onClick={() => deletePost(post.id)}
              className="text-xs px-3 py-1.5 border border-red-200 text-red-400 hover:bg-red-50 transition-colors flex-shrink-0">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
