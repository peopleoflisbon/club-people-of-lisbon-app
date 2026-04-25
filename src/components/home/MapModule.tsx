import Link from 'next/link';

export default function MapModule() {
  return (
    <Link href="/map" style={{ display: 'block', textDecoration: 'none' }}>
      <div style={{
        background: '#1C1C1C',
        borderLeft: '5px solid #C8102E',
        padding: '20px 20px 20px',
        fontFamily: "'SF UI Display', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        <p style={{
          margin: '0 0 4px',
          fontSize: 10, fontWeight: 900,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: '#C8102E',
        }}>
          People Of Lisbon
        </p>
        <h2 style={{
          margin: '0 0 6px',
          fontSize: 22, fontWeight: 900,
          color: 'white', lineHeight: 1.05,
          letterSpacing: '-0.01em', textTransform: 'uppercase',
        }}>
          Explore Lisbon<br />through the people.
        </h2>
        <p style={{
          margin: '0 0 16px',
          fontSize: 13, color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.5,
        }}>
          200+ stories and videos across the city.
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '11px 18px',
          background: '#C8102E', color: 'white',
          fontSize: 12, fontWeight: 900,
          letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>
          Open the Map →
        </div>
      </div>
    </Link>
  );
}
