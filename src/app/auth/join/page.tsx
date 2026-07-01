'use client';

const POL_RED = '#C8102E';
const GOLD = '#E6B75C';
const FF = "'SF UI Display', -apple-system, BlinkMacSystemFont, sans-serif";
const STRIPE_URL = 'https://buy.stripe.com/bIY7tn8AfasP99ebII';

const PERKS = [
  {
    title: 'Member Events',
    desc: 'Join exclusive gatherings, coffee mornings, and more across Lisbon.',
  },
  {
    title: 'Members App',
    desc: 'Full access to the People Of Lisbon members app. Discover members, events, offers, recommendations, and much more.',
  },
  {
    title: 'WhatsApp Community',
    desc: 'Join our lively members WhatsApp community. It\'s where conversations happen, friendships begin, and opportunities appear.',
  },
  {
    title: 'Newsletter',
    desc: 'Stay up to date with the best of People Of Lisbon, upcoming events, member news, and recommendations from around the city.',
  },
  {
    title: 'Digital Membership Card',
    desc: 'Your official People Of Lisbon digital membership card. It unlocks exclusive member discounts and offers from our partners around Lisbon.',
  },
  {
    title: 'Recommendations',
    desc: 'Our favourite cafes, restaurants, walks, experiences, and hidden gems, plus recommendations from fellow members.',
  },
  {
    title: 'Direct Line to Stephen',
    desc: 'Chat directly with Stephen O\'Regan, founder of People Of Lisbon and interviewer of more than 200 fascinating Lisbon stories. Ask questions, share ideas, or just say hello.',
  },
  {
    title: 'Introductions',
    desc: 'Looking for photographers, filmmakers, founders, artists, musicians, investors, or new friends? We\'ll happily help introduce members to one another whenever we can.',
  },
  {
    title: 'Behind the Scenes',
    desc: 'Get early access to rough cuts and exclusive People Of Lisbon content before everyone else.',
  },
];

export default function JoinPage() {
  return (
    <div style={{
      minHeight: '100dvh', background: '#0a0a0a',
      fontFamily: FF, display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 480, padding: '0 0 48px' }}>

        {/* Header */}
        <div style={{ padding: 'max(env(safe-area-inset-top), 20px) 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/auth/login" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
            Back
          </a>
          <img src="/pol-logo.png" alt="People Of Lisbon" style={{ width: 36, height: 36, objectFit: 'contain' }} />
        </div>

        {/* Hero */}
        <div style={{ padding: '32px 24px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, margin: '0 0 10px' }}>
            Club People Of Lisbon
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 7vw, 38px)', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Join The Club
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', margin: '0 0 20px', lineHeight: 1.65 }}>
            Join 100+ members in Lisbon's most unique club. We do gatherings, we build community, and we give you access to the best of the city.
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: GOLD }}>10</span>
            <span style={{ fontSize: 14, color: GOLD }}>/ month</span>
          </div>
        </div>

        {/* Perks */}
        <div style={{ padding: '24px 24px 0' }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 20px' }}>
            What You Get
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {PERKS.map((perk, i) => (
              <div key={i} style={{
                padding: '16px 0',
                borderBottom: i < PERKS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 5px' }}>{perk.title}</p>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.55 }}>{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '32px 24px 0' }}>
          <a href={STRIPE_URL} target="_blank" rel="noopener noreferrer" style={{
            display: 'block', width: '100%', padding: '17px',
            background: GOLD, color: '#1C1C1C', textDecoration: 'none', textAlign: 'center',
            borderRadius: 4, fontSize: 14, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase',
            boxSizing: 'border-box', boxShadow: '0 4px 24px rgba(230,183,92,0.3)',
          }}>
            Join The Club — 10 / month
          </a>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: '12px 0 0', lineHeight: 1.5 }}>
            Secure payment via Stripe. Cancel anytime.
          </p>
        </div>

        {/* Thank You */}
        <div style={{ padding: '36px 24px 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 16px' }}>
            Thank You
          </p>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', margin: '0 0 14px', lineHeight: 1.65 }}>
            By becoming a member, you're helping People Of Lisbon continue doing what we love most: telling the stories of the people who make this city such a special place. Your support helps us create more films, more photographs, more events, and a stronger community.
          </p>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.65 }}>
            We're genuinely grateful to have you with us.
          </p>
        </div>

        {/* Already a member */}
        <div style={{ padding: '28px 24px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: '0 0 8px' }}>Already a member?</p>
          <a href="/auth/member-login" style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>
            Member Sign In
          </a>
        </div>

      </div>
    </div>
  );
}
