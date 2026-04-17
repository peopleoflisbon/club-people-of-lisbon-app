'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import ScrollPage from '@/components/ui/ScrollPage';
import { formatDateTime, cn } from '@/lib/utils';
import type { Event, RsvpStatus } from '@/types';

interface Props {
  events: (Event & { user_rsvp: RsvpStatus | null; rsvp_count: number })[];
  userId: string;
}

export default function EventsClient({ events: initialEvents, userId }: Props) {
  const [events, setEvents] = useState(initialEvents);
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);
  const supabase = createClient();

  async function handleRsvp(eventId: string, currentStatus: RsvpStatus | null) {
    setRsvpLoading(eventId);
    try {
      if (currentStatus === 'attending') {
        // Cancel RSVP
        await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', userId);
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, user_rsvp: null, rsvp_count: e.rsvp_count - 1 }
              : e
          )
        );
      } else {
        // RSVP attending
        await supabase.from('event_rsvps').upsert({
          event_id: eventId,
          user_id: userId,
          status: 'attending',
        });
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, user_rsvp: 'attending', rsvp_count: e.rsvp_count + 1 }
              : e
          )
        );
      }
    } finally {
      setRsvpLoading(null);
    }
  }

  const upcoming = events.filter((e) => e.status === 'upcoming' || e.status === 'live');
  const past = events.filter((e) => e.status === 'past');

  return (
    <ScrollPage>
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Events" subtitle="People Of Lisbon gatherings" />

      {events.length === 0 ? (
        <EmptyState
          title="No events yet"
          description="Stay tuned for upcoming People Of Lisbon events."
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
        />
      ) : (
        <div className="px-4 lg:px-8 pb-6 space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">Upcoming</h2>
              <div className="space-y-4">
                {upcoming.map((event, i) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={i}
                    onRsvp={handleRsvp}
                    rsvpLoading={rsvpLoading === event.id}
                  />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">Past Events</h2>
              <div className="space-y-4">
                {past.map((event, i) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={i}
                    onRsvp={handleRsvp}
                    rsvpLoading={rsvpLoading === event.id}
                    isPast
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
    </ScrollPage>
  );
}

function EventCard({
  event,
  index,
  onRsvp,
  rsvpLoading,
  isPast = false,
}: {
  event: Event & { user_rsvp: RsvpStatus | null; rsvp_count: number };
  index: number;
  onRsvp: (id: string, status: RsvpStatus | null) => void;
  rsvpLoading: boolean;
  isPast?: boolean;
}) {
  const attending = event.user_rsvp === 'attending';

  return (
    <div
      className={cn('pol-card overflow-hidden animate-fade-up', isPast && 'opacity-60')}
      style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
    >
      {(event.cover_image_url || event.image_url) && (
        <div className="relative h-48 bg-stone-100">
          <Image
            src={event.cover_image_url || event.image_url}
            alt={event.title}
            fill
            className="object-cover"
            unoptimized
          />
          {event.status === 'live' && (
            <div className="absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5" style={{ background: "#2F6DA5" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Live
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {/* Date */}
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#2F6DA5" }}>
          {formatDateTime(event.starts_at)}
        </p>

        {/* Title */}
        <h3 className="font-display text-xl text-ink leading-tight mb-1">{event.title}</h3>

        {/* Location */}
        {event.location_name && (
          <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-3">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {event.location_name}
          </div>
        )}

        {/* Description */}
        {event.description && (
          <p className="text-stone-500 text-sm leading-relaxed mb-4 line-clamp-3">
            {event.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <div className="text-xs text-stone-400">
            {event.rsvp_count} going
            {event.capacity && ` · ${event.capacity - event.rsvp_count} spots left`}
          </div>

          {!isPast && (
            <button
              onClick={() => onRsvp(event.id, event.user_rsvp)}
              disabled={rsvpLoading}
              className={cn(
                'px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50',
                attending
                  ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  : 'text-white'
              )}
              style={!attending ? { background: '#2F6DA5' } : undefined}
            >
              {rsvpLoading ? '…' : attending ? '✓ Going' : 'RSVP'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
