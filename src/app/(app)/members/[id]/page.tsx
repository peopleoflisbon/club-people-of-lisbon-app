import { createServerClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import { getInitials } from '@/lib/utils';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data } = await supabase.from('profiles').select('full_name').eq('id', params.id).single();
  return { title: `${data?.full_name || 'Member'} · People Of Lisbon` };
}

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('is_active', true)
    .single();

  if (!profile) notFound();

  const { data: { session } } = await supabase.auth.getSession();
  const isOwnProfile = session?.user?.id === params.id;

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain"><div className="max-w-2xl mx-auto px-4 py-6 lg:px-8 animate-fade-up">
      {/* Back */}
      <Link href="/members" className="inline-flex items-center gap-2 text-stone-500 text-sm hover:text-ink transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Members
      </Link>

      {/* Profile card */}
      <div className="pol-card overflow-hidden">
        {/* Hero banner */}
        <div className="h-24 bg-gradient-to-br from-ink via-ink-soft to-stone-700 relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #F4141E, transparent 60%)' }}
          />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-10 mb-4">
            <Avatar src={profile.avatar_url} name={profile.full_name} size="xl"
              className="ring-4 ring-white" />
          </div>

          {/* Name & meta */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl text-ink">{profile.full_name}</h1>
              {profile.headline && (
                <p className="text-stone-500 text-sm mt-0.5">{profile.headline}</p>
              )}
              {profile.neighborhood && (
                <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {profile.neighborhood}
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {isOwnProfile ? (
                <Link href="/profile" className="pol-btn-secondary text-xs px-4 py-2">
                  Edit Profile
                </Link>
              ) : (
                <Link
                  href={`/messages?with=${params.id}`}
                  className="pol-btn-primary text-xs px-4 py-2"
                >
                  Message
                </Link>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.short_bio && (
            <div className="mt-5 pt-5 border-t border-stone-100">
              <p className="text-stone-600 text-sm leading-relaxed">{profile.short_bio}</p>
            </div>
          )}

          {/* Personal story */}
          {profile.personal_story && (
            <div className="mt-5 pt-5 border-t border-stone-100">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Story</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{profile.personal_story}</p>
            </div>
          )}

          {/* Favourite spots */}
          {profile.favorite_spots && (
            <div className="mt-5 pt-5 border-t border-stone-100">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Favourite Lisbon Spots</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{profile.favorite_spots}</p>
            </div>
          )}

          {/* Social links */}
          {(profile.linkedin_url || profile.instagram_handle || profile.website_url) && (
            <div className="mt-5 pt-5 border-t border-stone-100 flex flex-wrap gap-3">
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-brand transition-colors font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
              )}
              {profile.instagram_handle && (
                <a
                  href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-brand transition-colors font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                  @{profile.instagram_handle.replace('@', '')}
                </a>
              )}
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-brand transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  Website
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div></div>
  );
}
