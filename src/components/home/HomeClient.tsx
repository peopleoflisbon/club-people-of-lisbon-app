'use client';

import Link from 'next/link';
import Image from 'next/image';
import Avatar from '@/components/ui/Avatar';
import BrandLogo from '@/components/ui/BrandLogo';
import LisbonWeather from '@/components/home/LisbonWeather';
import LisbonNews from '@/components/home/LisbonNews';
import PortuguesePhrase from '@/components/home/PortuguesePhrase';
import LatestPodcast from '@/components/home/LatestPodcast';
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
  recentMembers: { id: string; full_name: string; avatar_url: string; headline: string; neighborhood: string; joined_at: string }[];
  upcomingEvents: { id: string; title: string; starts_at: string; location_name: string; status: string }[];
  latestPhoto: { id: string; image_url: string; title: string; caption: string } | null;
  latestUpdate: { id: string; title: string; content: string; published_at: string } | null;
  goodNews: {
    id: string; title: string; body: string; category: string;
    is_featured: boolean; created_at: string;
    author: { full_name: string; avatar_url: string } | null;
  }[];
  brandLogoUrl?: string;
}

export default function HomeClient({ profile, recentMembers, upcomingEvents, latestPhoto, latestUpdate, goodNews, brandLogoUrl }: Props) {
  const firstName = profile?.full_name?.split(' ')[0] || 'Welcome';
  const newestMember = recentMembers[0] || null;

  return (
    <ScrollPage>
    <div className="max-w-4xl mx-auto">

      {/* Hero */}
      <div className="bg-ink px-5 lg:px-8 py-8 lg:py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-stone-500 text-sm mb-1">Good to see you,</p>
            <h1 className="font-display text-white text-3xl lg:text-4xl leading-none">{firstName}</h1>
          </div>
          <BrandLogo src={brandLogoUrl} size={52} radius={0} className="shadow-lg shadow-brand/30 flex-shrink-0" />
        </div>
        <div className="mt-5 h-0.5 bg-gradient-to-r from-brand via-stone-700 to-transparent" />
      </div>

      <div className="px-4 lg:px-8 py-5 space-y-6">

        {/* 1. WEATHER */}
        <LisbonWeather />

        {/* 2. LISBON NEWS */}
        <LisbonNews />

        {/* 3. LATEST FROM STEPHEN */}
        {latestUpdate && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl text-ink">Latest from Stephen</h2>
              <Link href="/updates" className="text-sm font-semibold text-brand hover:underline">See all →</Link>
            </div>
            <Link href="/updates" className="block bg-ink p-5 group hover:-translate-y-0.5 transition-transform duration-200">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 bg-brand flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-display text-sm leading-none">S</span>
                </div>
                <div>
                  <p className="text-white text-base font-semibold">Stephen O'Regan</p>
                  <p className="text-stone-500 text-sm">{formatDate(latestUpdate.published_at)}</p>
                </div>
              </div>
              <p className="font-display text-white text-xl leading-tight mb-2">{latestUpdate.title}</p>
              <p className="text-stone-400 text-sm leading-relaxed line-clamp-3">{latestUpdate.content}</p>
              <p className="text-brand text-sm font-semibold mt-3 group-hover:underline">Read more →</p>
            </Link>
          </section>
        )}

        {/* 3. EVENTS */}
        {upcomingEvents.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl text-ink">Upcoming Events</h2>
              <Link href="/events" className="text-sm font-semibold text-brand hover:underline">See all →</Link>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="block bg-white border border-stone-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 text-center">
                      <div className="bg-brand py-2">
                        <p className="text-white text-xs font-bold uppercase leading-none">{new Date(event.starts_at).toLocaleDateString('en', { month: 'short' })}</p>
                        <p className="text-white font-display text-xl leading-none mt-0.5">{new Date(event.starts_at).getDate()}</p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base text-ink leading-tight">{event.title}</p>
                      {event.location_name && <p className="text-sm text-stone-400 mt-1">{event.location_name}</p>}
                      <p className="text-sm text-stone-400 mt-0.5">{formatDateTime(event.starts_at)}</p>
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

        {/* 4. NEW MEMBERS */}
        {newestMember && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl text-ink">New Member</h2>
              <Link href="/members" className="text-sm font-semibold text-brand hover:underline">All members →</Link>
            </div>
            <Link href={`/members/${newestMember.id}`} className="flex items-center gap-4 bg-white border border-stone-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <Avatar src={newestMember.avatar_url} name={newestMember.full_name} size="xl" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-display text-xl text-ink leading-tight">{newestMember.full_name}</p>
                {newestMember.headline && <p className="text-stone-500 text-sm mt-0.5 line-clamp-1">{newestMember.headline}</p>}
                {newestMember.neighborhood && <p className="text-sm text-brand font-medium mt-1">{newestMember.neighborhood}</p>}
              </div>
              <span className="flex-shrink-0 inline-block bg-brand text-white text-xs font-semibold px-3 py-1">New</span>
            </Link>
          </section>
        )}

        {/* 5. PORTUGUESE PHRASE */}
        <PortuguesePhrase />

        {/* 6. GOOD NEWS */}
        {goodNews.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl text-ink">Good News</h2>
              <Link href="/good-news" className="text-sm font-semibold text-brand hover:underline">See all →</Link>
            </div>
            <div className="space-y-3">
              {goodNews.map((post) => (
                <Link key={post.id} href="/good-news" className={cn('block bg-white border p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200', post.is_featured ? 'border-brand/20 bg-brand/[0.015]' : 'border-stone-100')}>
                  <div className="flex items-start gap-3">
                    <Avatar src={post.author?.avatar_url || ''} name={post.author?.full_name || '?'} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-semibold text-ink">{post.author?.full_name}</p>
                        <span className={cn('text-xs font-semibold px-2 py-0.5 border', CATEGORY_COLORS[post.category] || 'bg-stone-50 text-stone-500 border-stone-100')}>{post.category}</span>
                        {post.is_featured && <span className="text-xs font-semibold text-brand">★ Featured</span>}
                      </div>
                      <p className="font-semibold text-base text-ink leading-tight">{post.title}</p>
                      {post.body && <p className="text-sm text-stone-500 mt-1 leading-relaxed line-clamp-2">{post.body}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 7. PODCAST */}
        <LatestPodcast />

        {/* 8. RITA'S PHOTOS */}
        {latestPhoto && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl text-ink">Rita's Latest Photos</h2>
              <Link href="/photos" className="text-sm font-semibold text-brand hover:underline">See all →</Link>
            </div>
            <Link href="/photos" className="block group">
              <div className="relative overflow-hidden aspect-[4/3] bg-stone-100">
                <Image src={latestPhoto.image_url} alt={latestPhoto.title || "Rita's photo"} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-500" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                {latestPhoto.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-display text-white text-xl leading-tight">{latestPhoto.title}</p>
                    {latestPhoto.caption && <p className="text-stone-300 text-sm mt-1 line-clamp-1">{latestPhoto.caption}</p>}
                  </div>
                )}
              </div>
            </Link>
          </section>
        )}

      </div>
    </div>
    </ScrollPage>
  );
}
