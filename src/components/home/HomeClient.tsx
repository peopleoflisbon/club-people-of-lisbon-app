'use client';

import Link from 'next/link';
import Image from 'next/image';
import Avatar from '@/components/ui/Avatar';
import BrandLogo from '@/components/ui/BrandLogo';
import { formatDate, formatDateTime, cn } from '@/lib/utils';
import ScrollPage from '@/components/ui/ScrollPage';

const CATEGORY_COLORS: Record<string, string> = {
  Win: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Deal: 'bg-blue-50 text-blue-700 border-blue-100',
  Collaboration: 'bg-purple-50 text-purple-700 border-purple-100',
  Opportunity: 'bg-amber-50 text-amber-700 border-amber-100',
  Recommendation: 'bg-rose-50 text-rose-700 border-rose-100',
};

interface Props {
  profile: { full_name: string; avatar_url: string; neighborhood: string } | null;
  recentMembers: { id: string; full_name: string; avatar_url: string; headline: string; neighborhood: string }[];
  upcomingEvents: { id: string; title: string; starts_at: string; location_name: string; status: string }[];
  latestPhoto: { id: string; image_url: string; title: string; caption: string } | null;
  latestUpdate: { id: string; title: string; content: string; published_at: string } | null;
  goodNews: {
    id: string;
    title: string;
    body: string;
    category: string;
    is_featured: boolean;
    created_at: string;
    author: { full_name: string; avatar_url: string } | null;
  }[];
  brandLogoUrl?: string;
}

export default function HomeClient({
  profile,
  recentMembers,
  upcomingEvents,
  latestPhoto,
  latestUpdate,
  goodNews,
  brandLogoUrl,
}: Props) {
  const firstName = profile?.full_name?.split(' ')[0] || 'Welcome';

  return (
    <ScrollPage>
    <div className="max-w-4xl mx-auto">

      {/* Hero welcome */}
      <div className="bg-ink px-5 lg:px-8 py-8 lg:py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-stone-500 text-sm mb-1">Good to see you,</p>
            <h1 className="font-display text-white text-3xl lg:text-4xl leading-none">{firstName}</h1>
          </div>
          <BrandLogo src={brandLogoUrl} size={52} radius={13} className="shadow-lg shadow-brand/30 flex-shrink-0" />
        </div>
        <div className="mt-5 h-0.5 bg-gradient-to-r from-brand via-stone-700 to-transparent" />
      </div>

      <div className="px-4 lg:px-8 py-5 space-y-8">

        {/* New Members */}
        {recentMembers.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-ink">New Members</h2>
              <Link href="/members" className="text-xs font-semibold text-brand hover:underline">See all →</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {recentMembers.map((m) => (
                <Link
                  key={m.id}
                  href={`/members/${m.id}`}
                  className="flex-shrink-0 flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-stone-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-[116px]"
                >
                  <Avatar src={m.avatar_url} name={m.full_name} size="lg" />
                  <div className="text-center min-w-0 w-full">
                    <p className="text-xs font-semibold text-ink leading-tight line-clamp-2">{m.full_name}</p>
                    {m.neighborhood && (
                      <p className="text-2xs text-stone-400 mt-1">{m.neighborhood}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-ink">Upcoming Events</h2>
              <Link href="/events" className="text-xs font-semibold text-brand hover:underline">See all →</Link>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href="/events"
                  className="block bg-white rounded-2xl border border-stone-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 text-center">
                      <div className="bg-brand rounded-xl py-2">
                        <p className="text-white text-xs font-bold uppercase leading-none">
                          {new Date(event.starts_at).toLocaleDateString('en', { month: 'short' })}
                        </p>
                        <p className="text-white font-display text-xl leading-none mt-0.5">
                          {new Date(event.starts_at).getDate()}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-ink leading-tight">{event.title}</p>
                      {event.location_name && (
                        <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          {event.location_name}
                        </p>
                      )}
                      <p className="text-xs text-stone-400 mt-0.5">{formatDateTime(event.starts_at)}</p>
                    </div>
                    <svg className="w-4 h-4 text-stone-300 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Good News */}
        {goodNews.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-ink">Good News</h2>
              <Link href="/good-news" className="text-xs font-semibold text-brand hover:underline">See all →</Link>
            </div>
            <div className="space-y-3">
              {goodNews.map((post) => (
                <div
                  key={post.id}
                  className={cn(
                    'bg-white rounded-2xl border p-4',
                    post.is_featured ? 'border-brand/20 bg-brand/[0.015]' : 'border-stone-100'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar src={post.author?.avatar_url || ''} name={post.author?.full_name || '?'} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-xs font-semibold text-ink">{post.author?.full_name}</p>
                        <span className={cn(
                          'text-2xs font-semibold px-2 py-0.5 rounded-full border',
                          CATEGORY_COLORS[post.category] || 'bg-stone-50 text-stone-500 border-stone-100'
                        )}>
                          {post.category}
                        </span>
                        {post.is_featured && <span className="text-2xs font-semibold text-brand">★ Featured</span>}
                      </div>
                      <p className="font-semibold text-sm text-ink leading-tight">{post.title}</p>
                      {post.body && (
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">{post.body}</p>
                      )}
                      <p className="text-2xs text-stone-300 mt-2">{formatDate(post.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Rita + Stephen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {latestPhoto && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-ink">Rita's Photos</h2>
                <Link href="/photos" className="text-xs font-semibold text-brand hover:underline">See all →</Link>
              </div>
              <Link href="/photos" className="block group">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-100">
                  <Image
                    src={latestPhoto.image_url}
                    alt={latestPhoto.title || "Rita's photo"}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                  {latestPhoto.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="font-display text-white text-base leading-tight">{latestPhoto.title}</p>
                      {latestPhoto.caption && (
                        <p className="text-stone-300 text-xs mt-1 line-clamp-1">{latestPhoto.caption}</p>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            </section>
          )}

          {latestUpdate && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-ink">From Stephen</h2>
                <Link href="/updates" className="text-xs font-semibold text-brand hover:underline">See all →</Link>
              </div>
              <Link href="/updates" className="block bg-ink rounded-2xl p-5 group hover:-translate-y-0.5 transition-transform duration-200">
                <div className="flex items-start gap-3 mb-3">
                  <BrandLogo src={brandLogoUrl} size={32} radius={8} />
                  <div>
                    <p className="text-stone-400 text-xs font-semibold">Stephen Clarke</p>
                    <p className="text-stone-500 text-xs">{formatDate(latestUpdate.published_at)}</p>
                  </div>
                </div>
                <p className="font-display text-white text-lg leading-tight mb-2">{latestUpdate.title}</p>
                <p className="text-stone-400 text-xs leading-relaxed line-clamp-3">{latestUpdate.content}</p>
                <p className="text-brand text-xs font-semibold mt-3 group-hover:underline">Read more →</p>
              </Link>
            </section>
          )}
        </div>

        {/* Explore prompt */}
        <div className="bg-stone-100 rounded-2xl p-5 flex items-center gap-4">
          <BrandLogo src={brandLogoUrl} size={40} radius={10} />
          <div className="flex-1">
            <p className="font-semibold text-sm text-ink">Explore the community</p>
            <p className="text-xs text-stone-500 mt-0.5">Browse the map, message members, share good news.</p>
          </div>
          <Link href="/members" className="flex-shrink-0 pol-btn-primary text-xs px-4 py-2">Explore</Link>
        </div>

      </div>
    </div>
  );
}
