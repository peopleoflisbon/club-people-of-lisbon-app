'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import ScrollPage from '@/components/ui/ScrollPage';
import { formatDate, cn } from '@/lib/utils';
import type { GoodNewsPost, GoodNewsCategory, GoodNewsFormData } from '@/types';

const CATEGORIES: GoodNewsCategory[] = ['Win', 'Deal', 'Collaboration', 'Opportunity', 'Recommendation'];

const CATEGORY_STYLES: Record<string, string> = {
  Win: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Deal: 'bg-blue-50 text-blue-700 border-blue-100',
  Collaboration: 'bg-purple-50 text-purple-700 border-purple-100',
  Opportunity: 'bg-amber-50 text-amber-700 border-amber-100',
  Recommendation: 'bg-rose-50 text-rose-700 border-rose-100',
};

const CATEGORY_EMOJI: Record<string, string> = {
  Win: '🎉', Deal: '🤝', Collaboration: '✨', Opportunity: '🚀', Recommendation: '⭐',
};

interface Post extends GoodNewsPost {
  author: { id: string; full_name: string; avatar_url: string; headline: string } | null;
}

interface Props {
  posts: Post[];
  userId: string;
}

const EMPTY_FORM: GoodNewsFormData = { title: '', body: '', category: 'Win', link_url: '' };

export default function GoodNewsClient({ posts: initialPosts, userId }: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GoodNewsFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

  async function submitPost() {
    if (!form.title.trim()) { setError('Please add a title.'); return; }
    setSaving(true);
    setError('');

    // Posts go to pending (is_published: false) for admin approval
    const { error: err } = await supabase
      .from('good_news_posts')
      .insert({ ...form, author_profile_id: userId, is_published: false, is_featured: false });

    if (err) {
      setError('Failed to post. Please try again.');
    } else {
      setForm(EMPTY_FORM);
      setShowForm(false);
      setSubmitted(true);
    }
    setSaving(false);
  }

  const featured = posts.filter((p) => p.is_featured);
  const regular = posts.filter((p) => !p.is_featured);

  return (
    <ScrollPage>
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-4 lg:px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl text-ink leading-none">Good News</h1>
            <p className="text-stone-500 text-sm mt-1.5">
              Wins, deals, and opportunities from the People Of Lisbon community.
            </p>
          </div>
        </div>
        <div className="mt-4 h-0.5 bg-gradient-to-r from-brand via-stone-200 to-transparent" />
      </div>

      {/* Post form */}
      {showForm && (
        <div className="mx-4 lg:mx-8 mb-6 bg-white rounded-2xl border border-stone-100 p-5 shadow-sm animate-fade-up">
          <h3 className="font-semibold text-sm text-ink mb-4">Share your good news</h3>

          {/* Category picker */}
          <div className="mb-4">
            <label className="pol-label">Category</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                    form.category === cat
                      ? CATEGORY_STYLES[cat]
                      : 'border-stone-200 text-stone-400 hover:border-stone-300'
                  )}
                >
                  {CATEGORY_EMOJI[cat]} {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="pol-label">Title *</label>
              <input
                className="pol-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="We closed our first deal through the club!"
                maxLength={120}
              />
            </div>
            <div>
              <label className="pol-label">Details (optional)</label>
              <textarea
                className="pol-textarea"
                rows={3}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="A little context about what happened…"
              />
            </div>
            <div>
              <label className="pol-label">Link (optional)</label>
              <input
                className="pol-input"
                type="url"
                value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                placeholder="https://…"
              />
            </div>
          </div>

          {error && <p className="text-brand text-sm mt-3">{error}</p>}

          <div className="flex gap-3 mt-4">
            <button onClick={submitPost} disabled={saving || !form.title.trim()} className="pol-btn-primary">
              {saving ? 'Posting…' : 'Share Good News'}
            </button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setError(''); }} className="pol-btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Posts */}
      {posts.length === 0 ? (
        <EmptyState
          title="No good news yet"
          description="Be the first to share a win, deal, or collaboration."
          action={
            <button onClick={() => setShowForm(true)} className="pol-btn-primary">
              Share Good News
            </button>
          }
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          }
        />
      ) : (
        <div className="px-4 lg:px-8 pb-6 space-y-4">

          {/* Featured posts */}
          {featured.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Featured</p>
              {featured.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} userId={userId} />
              ))}
            </div>
          )}

          {/* Regular posts */}
          {regular.length > 0 && (
            <div className="space-y-3">
              {featured.length > 0 && (
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider pt-2">Recent</p>
              )}
              {regular.map((post, i) => (
                <PostCard key={post.id} post={post} index={i + featured.length} userId={userId} />
              ))}
            </div>
          )}

          {/* Share button at bottom */}
          <div className="pt-2">
            {submitted ? (
              <div className="w-full py-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-center">
                <p className="text-emerald-700 text-sm font-semibold">✓ Submitted for review</p>
                <p className="text-emerald-600 text-xs mt-1">Your post will appear once approved by the team.</p>
                <button onClick={() => setSubmitted(false)} className="text-xs text-emerald-600 underline mt-2">Share another</button>
              </div>
            ) : (
              <button
                onClick={() => setShowForm(!showForm)}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 text-sm font-semibold hover:border-brand hover:text-brand transition-colors"
              >
                + Share your good news
              </button>
            )}
          </div>
        </div>
      )}
    </div>
    </ScrollPage>
  );
}

function PostCard({ post, index, userId }: { post: Post; index: number; userId: string }) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border p-5 animate-fade-up',
        post.is_featured ? 'border-brand/15 shadow-sm' : 'border-stone-100'
      )}
      style={{ animationDelay: `${index * 0.04}s`, opacity: 0 }}
    >
      {post.is_featured && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-brand">★</span>
          <span className="text-xs font-semibold text-brand">Featured by People Of Lisbon</span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <Avatar src={post.author?.avatar_url || ''} name={post.author?.full_name || '?'} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-semibold text-sm text-ink leading-none">{post.author?.full_name}</p>
              {post.author?.headline && (
                <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{post.author.headline}</p>
              )}
            </div>
            <span className={cn(
              'text-2xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0',
              CATEGORY_STYLES[post.category] || 'bg-stone-50 text-stone-500 border-stone-100'
            )}>
              {CATEGORY_EMOJI[post.category]} {post.category}
            </span>
          </div>

          <h3 className="font-semibold text-base text-ink mt-3 leading-snug">{post.title}</h3>

          {post.body && (
            <p className="text-stone-500 text-sm mt-1.5 leading-relaxed">{post.body}</p>
          )}

          {post.link_url && (
            <a
              href={post.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-brand font-semibold mt-2 hover:underline"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
              View link
            </a>
          )}

          <p className="text-2xs text-stone-300 mt-3">{formatDate(post.created_at)}</p>
        </div>
      </div>
    </div>
  );
}
