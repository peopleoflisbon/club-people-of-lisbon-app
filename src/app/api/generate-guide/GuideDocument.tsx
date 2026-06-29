import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

// ---- Brand palette ----
const RED = '#C8102E';
const INK = '#1C1C1C';
const CREAM = '#F5F1EA';
const MUTED = '#8A7C6E';

const styles = StyleSheet.create({
  page: {
    backgroundColor: CREAM,
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
  },
  eyebrow: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    letterSpacing: 2,
    color: RED,
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 30,
    color: INK,
    marginBottom: 14,
  },
  rule: {
    height: 3,
    backgroundColor: RED,
    width: 64,
    marginBottom: 24,
  },
  coverBadge: {
    backgroundColor: RED,
    color: 'white',
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    letterSpacing: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: 18,
  },
  coverTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 44,
    color: INK,
    lineHeight: 1.05,
    marginBottom: 20,
  },
  body: {
    fontFamily: 'Helvetica',
    fontSize: 11.5,
    color: INK,
    lineHeight: 1.6,
    marginBottom: 12,
  },
  signature: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: RED,
    marginTop: 8,
  },
  signatureRole: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: MUTED,
    marginTop: 2,
  },

  // Contents
  contentsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: '0.5px solid #E0D9CE',
  },
  contentsNum: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: RED,
    width: 48,
  },
  contentsTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 15,
    color: INK,
    marginBottom: 2,
  },
  contentsDesc: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: MUTED,
  },

  // Cover
  coverPage: {
    padding: 0,
    backgroundColor: INK,
  },
  coverWrapper: {
    width: 595.28,
    height: 841.89,
    position: 'relative',
  },
  coverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 595.28,
    height: 841.89,
    objectFit: 'cover',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 595.28,
    height: 420,
    backgroundColor: 'rgba(10,10,10,0.62)',
  },
  coverContent: {
    position: 'absolute',
    bottom: 56,
    left: 48,
    right: 48,
  },
  coverPageBadge: {
    backgroundColor: RED,
    color: 'white',
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    letterSpacing: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  coverPageTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 46,
    color: 'white',
    marginBottom: 10,
    lineHeight: 1.05,
  },
  coverPageSubtitle: {
    fontFamily: 'Helvetica',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: MUTED,
  },

  // Events
  eventRow: {
    flexDirection: 'row',
    marginBottom: 18,
    paddingBottom: 18,
    borderBottom: '0.5px solid #E0D9CE',
  },
  dateBadge: {
    width: 52,
    height: 52,
    backgroundColor: RED,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  dateDay: { fontFamily: 'Helvetica-Bold', fontSize: 18, color: 'white', lineHeight: 1 },
  dateMonth: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: 'white', letterSpacing: 1, marginTop: 2 },
  eventTitle: { fontFamily: 'Helvetica-Bold', fontSize: 14, color: INK, marginBottom: 3 },
  eventMeta: { fontFamily: 'Helvetica', fontSize: 9.5, color: MUTED, marginBottom: 4 },
  eventDesc: { fontFamily: 'Helvetica', fontSize: 10, color: INK, lineHeight: 1.4 },

  // Recommendations
  catHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: INK,
    marginTop: 18,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: `1.5px solid ${RED}`,
  },
  recRow: { marginBottom: 12 },
  recName: { fontFamily: 'Helvetica-Bold', fontSize: 12, color: INK, marginBottom: 2 },
  recDesc: { fontFamily: 'Helvetica', fontSize: 10, color: INK, lineHeight: 1.4, marginBottom: 2 },
  recMeta: { fontFamily: 'Helvetica-Oblique', fontSize: 9, color: MUTED },

  // Offers
  offerRow: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottom: '0.5px solid #E0D9CE',
  },
  offerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  offerTitle: { fontFamily: 'Helvetica-Bold', fontSize: 13, color: INK, flex: 1 },
  discountPill: {
    backgroundColor: RED,
    color: 'white',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  offerPartner: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: MUTED, marginBottom: 3 },
  offerDesc: { fontFamily: 'Helvetica', fontSize: 10, color: INK, lineHeight: 1.4, marginBottom: 3 },
  offerRedeem: { fontFamily: 'Helvetica-Oblique', fontSize: 9, color: MUTED },

  // Directory
  memberRow: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottom: '0.5px solid #E0D9CE',
  },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 14 },
  avatarPlaceholder: {
    width: 56, height: 56, borderRadius: 28, marginRight: 14,
    backgroundColor: RED, alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { fontFamily: 'Helvetica-Bold', fontSize: 16, color: 'white' },
  memberName: { fontFamily: 'Helvetica-Bold', fontSize: 13, color: INK, marginBottom: 2 },
  memberHeadline: { fontFamily: 'Helvetica-Bold', fontSize: 9.5, color: RED, marginBottom: 2 },
  memberMeta: { fontFamily: 'Helvetica', fontSize: 9, color: MUTED, marginBottom: 4 },
  memberBio: { fontFamily: 'Helvetica', fontSize: 9.5, color: INK, lineHeight: 1.4 },
});

function getInitials(name: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

function formatDateBadge(iso: string) {
  try {
    const d = new Date(iso);
    const day = d.getDate();
    const month = d.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
    return { day: String(day), month };
  } catch {
    return { day: '--', month: '' };
  }
}

function formatEventMeta(iso: string, location?: string) {
  try {
    const d = new Date(iso);
    const dateStr = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} · ${timeStr}${location ? ' · ' + location : ''}`;
  } catch {
    return location || '';
  }
}

const Footer = () => (
  <View style={styles.footer} fixed>
    <Text>PEOPLE OF LISBON</Text>
    <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
  </View>
);

const INTRO_TEXT = `Hello, and welcome to the People Of Lisbon Guide.

This guide is a simple companion for members of our community. It isn't trying to be the ultimate guide to Lisbon—there are plenty of those already. Instead, think of it as a living collection of useful things that we think will make life in this wonderful city a little easier and a little more connected.

Inside you'll find recommendations for places to eat, drink, explore and discover, along with our members directory, special offers from fellow members and partners, upcoming events, and other useful bits and pieces. We'll continue adding to it and updating it regularly, so hopefully it becomes something you come back to time and time again.

People Of Lisbon has always been about connecting people. My hope is that this guide helps you discover somewhere new, meet someone interesting, save a little money, or simply gives you another reason to get out and enjoy this incredible city. If it does even one of those things, then it's doing its job.

See you around Lisbon.`;

const STORY_TEXT = `People Of Lisbon began with a simple idea.

When I moved to Lisbon in 2020, I was fascinated by the people I kept meeting. Artists, entrepreneurs, chefs, musicians, scientists, activists, immigrants, locals—everyone seemed to have an incredible story to tell. I realised that while travel guides celebrate cities, they rarely celebrate the people who truly make those cities special.

So I picked up a camera and started asking one simple question: "Tell me your story."

That first interview led to another. Then another. Before long, People Of Lisbon had become a weekly documentary series, with every episode introducing someone who calls Lisbon home. Each film explores not only what they do, but why they do it, how they arrived here, and what this remarkable city means to them.

Since then, we've produced over 200 documentaries and photo stories featuring people from every walk of life. Along the way we've expanded into podcasts, photography, community events, newsletters, partnerships with local organisations, and now this members community. What began as a filmmaking project has grown into something much bigger—a network of curious, creative and welcoming people who believe that the best way to understand a city is through the people who live in it.

Everything we do is built around one simple belief: interesting people make interesting places.

Thank you for being part of the journey. Whether you've appeared in one of our films, attended an event, joined the club, supported a sponsor, or simply watched a video online, you've helped make People Of Lisbon what it is today.

And we're only just getting started.`;

const CONTENTS_ITEMS = [
  { num: '01', title: 'Welcome', desc: 'A letter from our founder' },
  { num: '02', title: 'The Story of People Of Lisbon', desc: 'How it all began' },
  { num: '03', title: 'Latest From Stephen', desc: "What's new with the club" },
  { num: '04', title: 'Upcoming Events', desc: "What's on for members" },
  { num: '05', title: 'Recommendations', desc: 'Places we love in Lisbon' },
  { num: '06', title: 'Member Offers', desc: 'Discounts from fellow members' },
  { num: '07', title: 'Members Directory', desc: 'The people behind the club' },
];

function formatUpdateDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

export interface GuideData {
  events: any[];
  recsByCategory: Record<string, any[]>;
  offers: any[];
  members: any[];
  avatarBuffers: (Buffer | null)[];
  coverImageBuffer: Buffer | null;
  latestUpdate: { title: string; content: string; published_at: string } | null;
}

export function GuideDocument({ events, recsByCategory, offers, members, avatarBuffers, coverImageBuffer, latestUpdate }: GuideData) {
  return (
    <Document title="People Of Lisbon Guide">
      {/* Cover */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverWrapper}>
          {coverImageBuffer && <Image src={coverImageBuffer as any} style={styles.coverImage} />}
          <View style={styles.coverOverlay} />
          <View style={styles.coverContent}>
            <Text style={styles.coverPageBadge}>PEOPLE OF LISBON</Text>
            <Text style={styles.coverPageTitle}>The Guide</Text>
            <Text style={styles.coverPageSubtitle}>Lisbon's most interesting people, all in one place.</Text>
          </View>
        </View>
      </Page>

      {/* Welcome */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>WELCOME</Text>
        <View style={styles.rule} />
        {INTRO_TEXT.split('\n\n').map((para, i) => (
          <Text key={i} style={styles.body}>{para}</Text>
        ))}
        <Text style={styles.signature}>Stephen O'Regan</Text>
        <Text style={styles.signatureRole}>Founder, People Of Lisbon</Text>
        <Footer />
      </Page>

      {/* Contents */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>IN THIS GUIDE</Text>
        <Text style={styles.sectionTitle}>Contents</Text>
        <View style={styles.rule} />
        {CONTENTS_ITEMS.map((item) => (
          <View key={item.num} style={styles.contentsRow}>
            <Text style={styles.contentsNum}>{item.num}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.contentsTitle}>{item.title}</Text>
              <Text style={styles.contentsDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
        <Footer />
      </Page>

      {/* The Story */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>OUR STORY</Text>
        <Text style={styles.sectionTitle}>The Story of People Of Lisbon</Text>
        <View style={styles.rule} />
        {STORY_TEXT.split('\n\n').map((para, i) => (
          <Text key={i} style={styles.body}>{para}</Text>
        ))}
        <Footer />
      </Page>

      {/* Latest From Stephen */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>FROM THE FOUNDER</Text>
        <Text style={styles.sectionTitle}>Latest From Stephen</Text>
        <View style={styles.rule} />
        {latestUpdate ? (
          <>
            <Text style={styles.eventTitle}>{latestUpdate.title}</Text>
            <Text style={styles.eventMeta}>{formatUpdateDate(latestUpdate.published_at)}</Text>
            {latestUpdate.content.split('\n\n').map((para, i) => (
              <Text key={i} style={[styles.body, { marginTop: i === 0 ? 12 : 0 }]}>{para}</Text>
            ))}
          </>
        ) : (
          <Text style={styles.body}>No updates yet — check back soon.</Text>
        )}
        <Footer />
      </Page>

      {/* Upcoming Events */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>WHAT'S ON</Text>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <View style={styles.rule} />
        {events.length === 0 && <Text style={styles.body}>No upcoming events at the moment.</Text>}
        {events.map((e: any, i: number) => {
          const { day, month } = formatDateBadge(e.starts_at);
          return (
            <View key={i} style={styles.eventRow} wrap={false}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateDay}>{day}</Text>
                <Text style={styles.dateMonth}>{month}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle}>{e.title}</Text>
                <Text style={styles.eventMeta}>{formatEventMeta(e.starts_at, e.location_name)}</Text>
                {e.description && <Text style={styles.eventDesc}>{e.description}</Text>}
              </View>
            </View>
          );
        })}
        <Footer />
      </Page>

      {/* Recommendations */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>OUR PICKS</Text>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        <View style={styles.rule} />
        {Object.keys(recsByCategory).length === 0 && <Text style={styles.body}>No recommendations yet.</Text>}
        {Object.entries(recsByCategory).map(([category, items]) => (
          <View key={category}>
            <Text style={styles.catHeader}>{category}</Text>
            {items.map((r: any, i: number) => (
              <View key={i} style={styles.recRow} wrap={false}>
                <Text style={styles.recName}>{r.name}</Text>
                {r.description && <Text style={styles.recDesc}>{r.description}</Text>}
                <Text style={styles.recMeta}>
                  {[r.neighbourhood, r.address].filter(Boolean).join(' · ')}
                  {r.recommended_by ? `  —  Recommended by ${r.recommended_by}` : ''}
                </Text>
              </View>
            ))}
          </View>
        ))}
        <Footer />
      </Page>

      {/* Offers */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>FOR MEMBERS</Text>
        <Text style={styles.sectionTitle}>Member Offers</Text>
        <View style={styles.rule} />
        {offers.length === 0 && <Text style={styles.body}>No active offers right now.</Text>}
        {offers.map((o: any, i: number) => (
          <View key={i} style={styles.offerRow} wrap={false}>
            <View style={styles.offerTopRow}>
              <Text style={styles.offerTitle}>{o.title}</Text>
              {o.discount && <Text style={styles.discountPill}>{o.discount}</Text>}
            </View>
            {o.partner_name && <Text style={styles.offerPartner}>{o.partner_name}</Text>}
            {o.description && <Text style={styles.offerDesc}>{o.description}</Text>}
            {o.how_to_redeem && <Text style={styles.offerRedeem}>How to redeem: {o.how_to_redeem}</Text>}
          </View>
        ))}
        <Footer />
      </Page>

      {/* Members Directory */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>THE PEOPLE</Text>
        <Text style={styles.sectionTitle}>Members Directory</Text>
        <View style={styles.rule} />
        {members.map((m: any, i: number) => {
          const buf = avatarBuffers[i];
          const bioParts = [m.short_bio, m.personal_story, m.favorite_spots ? `Favourite spots: ${m.favorite_spots}` : null]
            .filter(Boolean);
          return (
            <View key={m.id} style={styles.memberRow} wrap={false}>
              {buf ? (
                <Image src={buf as any} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{getInitials(m.full_name)}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{m.full_name}</Text>
                {(m.headline || m.job_title) && (
                  <Text style={styles.memberHeadline}>{m.headline || m.job_title}</Text>
                )}
                {m.neighborhood && <Text style={styles.memberMeta}>{m.neighborhood}</Text>}
                {bioParts.map((b, bi) => (
                  <Text key={bi} style={styles.memberBio}>{b}</Text>
                ))}
              </View>
            </View>
          );
        })}
        <Footer />
      </Page>
    </Document>
  );
}
