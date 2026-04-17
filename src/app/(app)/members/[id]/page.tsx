import { createServerClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import { getInitials } from '@/lib/utils';
import KudosButton from '@/components/members/KudosButton';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data } = await (supabase as any).from('profiles').select('full_name, avatar_url, headline').eq('id', params.id).single();
  const name = data?.full_name || 'Member';
  const image = data?.avatar_url || '/pol-logo.png';
  return {
    title: `${name} · People Of Lisbon`,
    openGraph: {
      title: `${name} · People Of Lisbon`,
      description: data?.headline || 'Member of Club People Of Lisbon',
      images: [{ url: image, width: 400, height: 400 }],
    },
    twitter: {
      card: 'summary',
      title: `${name} · People Of Lisbon`,
      images: [image],
    },
  };
}

function nationalityToFlag(nationality: string): string {
  const map: Record<string, string> = {
    'Irish': '🇮🇪', 'British': '🇬🇧', 'American': '🇺🇸', 'Portuguese': '🇵🇹',
    'French': '🇫🇷', 'Spanish': '🇪🇸', 'Italian': '🇮🇹', 'German': '🇩🇪',
    'Brazilian': '🇧🇷', 'Australian': '🇦🇺', 'Canadian': '🇨🇦', 'Dutch': '🇳🇱',
    'Belgian': '🇧🇪', 'Swedish': '🇸🇪', 'Norwegian': '🇳🇴', 'Danish': '🇩🇰',
    'Finnish': '🇫🇮', 'Polish': '🇵🇱', 'Russian': '🇷🇺', 'Ukrainian': '🇺🇦',
    'Greek': '🇬🇷', 'Turkish': '🇹🇷', 'Israeli': '🇮🇱', 'South African': '🇿🇦',
    'Indian': '🇮🇳', 'Chinese': '🇨🇳', 'Japanese': '🇯🇵', 'Korean': '🇰🇷',
    'Mexican': '🇲🇽', 'Argentine': '🇦🇷', 'Colombian': '🇨🇴', 'Chilean': '🇨🇱',
    'Venezuelan': '🇻🇪', 'Latvian': '🇱🇻', 'Lithuanian': '🇱🇹', 'Estonian': '🇪🇪',
    'Romanian': '🇷🇴', 'Hungarian': '🇭🇺', 'Czech': '🇨🇿', 'Slovak': '🇸🇰',
    'Croatian': '🇭🇷', 'Serbian': '🇷🇸', 'Swiss': '🇨🇭', 'Austrian': '🇦🇹',
    'New Zealander': '🇳🇿', 'Singaporean': '🇸🇬', 'Malaysian': '🇲🇾',
    'Nigerian': '🇳🇬', 'Ghanaian': '🇬🇭', 'Kenyan': '🇰🇪', 'Ethiopian': '🇪🇹',
    'Egyptian': '🇪🇬', 'Moroccan': '🇲🇦', 'Pakistani': '🇵🇰', 'Bangladeshi': '🇧🇩',
  };
  return map[nationality] || '🌍';
}

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('is_active', true)
    .single();

  if (!profile) notFound();

  const { data: { session } } = await supabase.auth.getSession();
  const isOwnProfile = session?.user?.id === params.id;

  const { count: kudosCount } = await (supabase as any)
    .from('kudos')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', params.id);

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain">
      <div className="max-w-3xl mx-auto animate-fade-up">
        {/* Back */}
        <div className="px-4 lg:px-8 pt-6 pb-4">
          <Link href="/members" className="inline-flex items-center gap-2 text-stone-500 text-sm hover:text-ink transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Members
          </Link>
        </div>

        {/* Profile hero */}
        <div className="px-4 lg:px-8 py-8" style={{ backgroundImage: 'url(/sidebar-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>

            {/* Avatar + info row */}
            <div className="flex items-start gap-4 mb-4">
              <Avatar src={profile.avatar_url} name={profile.full_name} size="xl" className="flex-shrink-0 ring-2 ring-white/10" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-2xl lg:text-3xl text-white leading-tight">{profile.full_name}</h1>
                  {profile.nationality && <span className="text-2xl">{nationalityToFlag(profile.nationality)}</span>}
                </div>
                {profile.job_title && <p className="text-sm font-semibold mt-1" style={{ color: "#2F6DA5" }}>{profile.job_title}{(profile as any).company ? ` · ${(profile as any).company}` : ''}</p>}
                {profile.headline && <p className="text-stone-400 text-sm mt-0.5 leading-snug">{profile.headline}</p>}
                {profile.neighborhood && (
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {profile.neighborhood}
                  </div>
                )}
              </div>
            </div>

            {/* Actions + Kudos row */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <>
                    <Link href="/profile" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors">
                      Edit Profile
                    </Link>
                    <Link href={`/messages?with=${params.id}`} className="inline-flex items-center gap-2 px-4 py-2 text-white text-xs font-semibold transition-colors" style={{ background: "#2F6DA5" }}>
                      Message
                    </Link>
                  </>
                ) : (
                  <Link href={`/messages?with=${params.id}`} className="inline-flex items-center gap-2 px-4 py-2 text-white text-xs font-semibold transition-colors" style={{ background: "#2F6DA5" }}>
                    Send Message
                  </Link>
                )}
              </div>
              <div className="flex flex-col items-end">
                {!isOwnProfile && <p className="text-white/50 text-xs italic mb-1">Vote for {profile.full_name?.split(' ')[0]} (just for fun)</p>}
                <KudosButton recipientId={params.id} initialCount={kudosCount || 0} isOwnProfile={isOwnProfile} inline />
              </div>
            </div>

          </div>
        </div>

        {/* Content */}
        <div className="px-4 lg:px-8 py-6 space-y-6">

          {profile.short_bio && (
            <div>
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">About</h3>
              <p className="text-ink text-base leading-relaxed font-medium">{profile.short_bio}</p>
            </div>
          )}

          {profile.personal_story && (
            <div>
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Story</h3>
              <p className="text-ink text-base leading-relaxed font-medium">{profile.personal_story}</p>
            </div>
          )}

          {profile.favorite_spots && (
            <div>
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Favourite Lisbon Spots</h3>
              <p className="text-ink text-base leading-relaxed font-medium">{profile.favorite_spots}</p>
            </div>
          )}

          {(profile.linkedin_url || profile.instagram_handle || profile.website_url) && (
            <div>
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Links</h3>
              <div className="flex flex-wrap gap-3">
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-stone-500 transition-colors font-medium px-3 py-2 rounded-xl" style={{ background: "#EEF4FA", color: "#2F6DA5" }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                )}
                {profile.instagram_handle && (
                  <a href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-stone-500 transition-colors font-medium px-3 py-2 rounded-xl" style={{ background: "#EEF4FA", color: "#2F6DA5" }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                    @{profile.instagram_handle.replace('@', '')}
                  </a>
                )}
                {profile.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-stone-500 transition-colors font-medium px-3 py-2 rounded-xl" style={{ background: "#EEF4FA", color: "#2F6DA5" }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    Website
                  </a>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
