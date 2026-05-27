'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import ScrollPage from '@/components/ui/ScrollPage';
import { MEMBER_INTERESTS, cn } from '@/lib/utils';

type MemberRow = {
  id: string;
  full_name: string;
  headline: string;
  job_title: string;
  neighborhood: string;
  avatar_url: string;
  short_bio: string;
  joined_at: string;
  interests?: string[];
};

export default function MembersClient({ initialMembers }: { initialMembers: MemberRow[] }) {
  const [query, setQuery] = useState('');
  const [activeInterests, setActiveInterests] = useState<string[]>([]);

  // Shuffle once on mount, stable for session
  const shuffled = useMemo(() => {
    return [...initialMembers].sort(() => Math.random() - 0.5);
  }, []); // eslint-disable-line

  // Only show interests that at least one member has
  const usedInterests = useMemo(() => {
    const set = new Set<string>();
    initialMembers.forEach(m => (m.interests || []).forEach(i => set.add(i)));
    return MEMBER_INTERESTS.filter(i => set.has(i));
  }, [initialMembers]);

  function toggleInterest(interest: string) {
    setActiveInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  }

  const filtered = useMemo(() => {
    let list = shuffled;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        m =>
          m.full_name?.toLowerCase().includes(q) ||
          m.headline?.toLowerCase().includes(q) ||
          m.neighborhood?.toLowerCase().includes(q) ||
          m.job_title?.toLowerCase().includes(q)
      );
    }
    if (activeInterests.length > 0) {
      list = list.filter(m =>
        activeInterests.some(i => (m.interests || []).includes(i))
      );
    }
    return list;
  }, [query, shuffled, activeInterests]);

  return (
    <ScrollPage>
      <div className="max-w-5xl mx-auto">
        <PageHeader title="Members" subtitle={`${initialMembers.length} people`} />

        {/* Search */}
        <div className="px-4 lg:px-8 mb-4">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, headline, neighbourhood…"
              className="w-full pl-11 pr-4 py-3 border border-stone-200 bg-white text-sm text-ink placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>
        </div>

        {/* Interest filter pills */}
        {usedInterests.length > 0 && (
          <div className="mb-5">
            <div className="flex gap-2 overflow-x-auto px-4 lg:px-8 pb-1 scrollbar-hide">
              {activeInterests.length > 0 && (
                <button
                  onClick={() => setActiveInterests([])}
                  className="flex-shrink-0 px-4 py-2 text-xs font-bold border border-stone-300 text-stone-500 hover:border-brand hover:text-brand transition-colors whitespace-nowrap"
                >
                  Clear
                </button>
              )}
              {usedInterests.map(interest => {
                const active = activeInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={cn(
                      'flex-shrink-0 px-4 py-2 text-xs font-bold border transition-all whitespace-nowrap',
                      active
                        ? 'bg-brand border-brand text-white'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-brand hover:text-brand'
                    )}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            title="No members found"
            description={
              activeInterests.length > 0
                ? `No members with those interests yet.`
                : query
                ? `No results for "${query}"`
                : 'No members yet.'
            }
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            }
          />
        ) : (
          <div className="px-4 lg:px-8 pb-6 space-y-3">
            {filtered.map((member, i) => (
              <MemberCard key={member.id} member={member} index={i} />
            ))}
          </div>
        )}
      </div>
    </ScrollPage>
  );
}

function MemberCard({ member, index }: { member: MemberRow; index: number }) {
  return (
    <Link
      href={`/members/${member.id}`}
      className="flex items-center gap-4 bg-white border border-stone-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-up"
      style={{ animationDelay: `${index * 0.04}s`, opacity: 0 }}
    >
      <Avatar src={member.avatar_url} name={member.full_name} size="xl" className="flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <h3 style={{ fontFamily: '-apple-system, "SF Pro Display", "SF UI Display", BlinkMacSystemFont, sans-serif', fontWeight: 800, fontSize: '18px', lineHeight: 1.2, color: 'var(--ink)' }}>
          {member.full_name}
        </h3>
        {member.job_title && (
          <p className="text-sm font-semibold mt-0.5" style={{ color: "#C8102E" }}>{member.job_title}</p>
        )}
        {member.headline && (
          <p className="text-stone-500 text-sm mt-0.5 leading-snug line-clamp-1">{member.headline}</p>
        )}
        {member.neighborhood && (
          <p className="text-stone-400 text-sm mt-1">{member.neighborhood}</p>
        )}
        {(member.interests || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {(member.interests || []).slice(0, 3).map(interest => (
              <span key={interest} className="text-2xs px-2 py-0.5 bg-stone-100 text-stone-500 font-semibold">
                {interest}
              </span>
            ))}
            {(member.interests || []).length > 3 && (
              <span className="text-2xs px-2 py-0.5 bg-stone-100 text-stone-400 font-semibold">
                +{(member.interests || []).length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <svg className="w-5 h-5 text-stone-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}
