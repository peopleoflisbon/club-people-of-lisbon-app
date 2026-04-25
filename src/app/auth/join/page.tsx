'use client';

const POL_RED = '#C8102E';
const GOLD = '#E6B75C';
const FF = "'SF UI Display', -apple-system, BlinkMacSystemFont, sans-serif";
const STRIPE_URL = 'https://buy.stripe.com/bIY7tn8AfasP99ebII';

const PERKS = [
  { icon: '🎟️', title: 'Member Events',              desc: 'Exclusive gatherings, meetups and experiences across Lisbon.' },
  { icon: '📱', title: 'Members App',                 desc: 'Access to the full People Of Lisbon members app.' },
  { icon: '💬', title: 'WhatsApp Group',              desc: 'Join the members WhatsApp group — the real conversation.' },
  { icon: '📬', title: 'Newsletter',                  desc: 'Our curated newsletter with the best of Lisbon, delivered to you.' },
  { icon: '💳', title: 'Digital Membership Card',     desc: 'Your official People Of Lisbon digital membership card.' },
  { icon: '🎁', title: 'Offers & Discounts',          desc: 'Member-only deals at restaurants, bars, and experiences across the city.' },
  { icon: '📍', title: 'Recommendations',             desc: "Curated picks from the POL team — the city's best kept secrets." },
  { icon: '✉️', title: 'Direct Line to Stephen',     desc: 'Direct communication with Stephen, the founder of People Of Lisbon.' },
  { icon: '🌐', title: 'The POL Network',             desc: 'Access to Lisbon\'s most interesting community of people.' },
];

export default function JoinPage() {
  return (
    <div style={{
      minHeight: '100dvh', background: '#0a0a0a',
      fontFamily: FF, display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 480, padding: '0 0 48px' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/auth/login" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
            ← Back
          </a>
          <img src="/pol-logo.png" alt="People Of Lisbon" style={{ width: 36, height: 36, objectFit: 'contain' }} />
        </div>

        {/* Hero */}
        <div style={{ padding: '32px 24px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, margin: '0 0 10px' }}>
            Club People Of Lisbon
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 7vw, 38px)', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Join the Club
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', margin: '0 0 20px', lineHeight: 1.65 }}>
            Join 100+ members in Lisbon's most unique club. We do gatherings, we build community, and we give you access to the best of the city.
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>€10</span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>/ month</span>
          </div>
        </div>

        {/* Perks */}
        <div style={{ padding: '24px 24px 0' }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 16px' }}>
            What you get
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {PERKS.map((perk, i) => (
              <div key={i} style={{
                display: 'flex', gap: 14, padding: '14px 0',
                borderBottom: i < PERKS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <span style={{ fontSize: 22, flexShrink: 0, width: 32, textAlign: 'center' }}>{perk.icon}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 3px' }}>{perk.title}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '28px 24px 0' }}>
          <a href={STRIPE_URL} target="_blank" rel="noopener noreferrer" style={{
            display: 'block', width: '100%', padding: '17px',
            background: GOLD, color: '#1C1C1C', textDecoration: 'none', textAlign: 'center',
            borderRadius: 4, fontSize: 14, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase',
            boxSizing: 'border-box', boxShadow: '0 4px 24px rgba(230,183,92,0.3)',
          }}>
            Join the Club — €10 / month →
          </a>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: '12px 0 0', lineHeight: 1.5 }}>
            Secure payment via Stripe. Cancel anytime.
          </p>
        </div>

        {/* Already a member */}
        <div style={{ padding: '24px 24px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: '0 0 8px' }}>Already a member?</p>
          <a href="/auth/member-login" style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>
            Member Sign In →
          </a>
        </div>

      </div>
    </div>
  );
}
