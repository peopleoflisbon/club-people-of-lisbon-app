'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import Avatar from '@/components/ui/Avatar';
import { formatDate, cn } from '@/lib/utils';

interface Post {
  id: string;
  title: string;
  body: string;
  category: string;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  author: { full_name: string; avatar_url: string } | null;
}

const CATEGORY_STYLES: Record<string, string> = {
  Win: 'bg-emerald-50 text-emerald-700',
  Deal: 'bg-blue-50 text-blue-700',
  Collaboration: 'bg-purple-50 text-purple-700',
  Opportunity: 'bg-amber-50 text-amber-700',
  Recommendation: 'bg-rose-50 text-rose-700',
};

export default function AdminGoodNewsClient({ posts: initial }: { posts: Post[] }) {
  const [posts, setPosts] = useState(initial);
  const supabase = createClient();

  async function togglePublish(id: string, current: boolean) {
    await supabase.from('good_news_posts').update({ is_published: !current }).eq('id', id);
    setPosts((p) => p.map((post) => post.id === id ? { ...post, is_published: !current } : post));
  }

  async function toggleFeature(id: string, current: boolean) {
    await supabase.from('good_news_posts').update({ is_featured: !current }).eq('id', id);
    setPosts((p) => p.map((post) => post.id === id ? { ...post, is_featured: !current } : post));
  }

  async function deletePost(id: string) {
    if (!confirm('Remove this post?')) return;
    await supabase.from('good_news_posts').delete().eq('id', id);
    setPosts((p) => p.filter((post) => post.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-ink">Good News</h1>
          <p className="text-stone-500 text-sm mt-1">Review and moderate member posts.</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="text-stone-400 text-sm">No posts yet.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className={cn('pol-card p-4', !post.is_published && 'opacity-55')}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {post.author && (
                      <span className="text-xs font-semibold text-stone-500">{post.author.full_name}</span>
                    )}
                    <span className={cn('text-2xs px-2 py-0.5 rounded-full font-semibold', CATEGORY_STYLES[post.category] || 'bg-stone-100 text-stone-500')}>
                      {post.category}
                    </span>
                    {post.is_featured && <span className="text-2xs font-bold text-brand">★ Featured</span>}
                    {!post.is_published && <span className="text-2xs bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full font-semibold">Hidden</span>}
                  </div>
                  <p className="font-semibold text-sm text-ink">{post.title}</p>
                  {post.body && <p className="text-xs text-stone-400 mt-1 line-clamp-2">{post.body}</p>}
                  <p className="text-xs text-stone-300 mt-2">{formatDate(post.created_at)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                  <button
                    onClick={() => toggleFeature(post.id, post.is_featured)}
                    className={cn('text-xs px-3 py-1.5 rounded-lg border transition-colors',
                      post.is_featured ? 'border-brand/30 text-brand bg-brand/5' : 'border-stone-200 text-stone-500 hover:border-brand hover:text-brand'
                    )}
                  >
                    {post.is_featured ? '★ Featured' : 'Feature'}
                  </button>
                  <button
                    onClick={() => togglePublish(post.id, post.is_published)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-400 transition-colors"
                  >
                    {post.is_published ? 'Hide' : 'Publish'}
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
