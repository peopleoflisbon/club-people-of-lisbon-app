'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PolLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  square?: boolean;
}

const SIZE_MAP = { xs: 24, sm: 32, md: 44, lg: 64, xl: 96 };

// Inline SVG fallback — always renders, zero network requests
function PolLogoFallback({ px }: { px: number }) {
  const r = px <= 32 ? 6 : px <= 44 ? 8 : 12;
  const fs = Math.round(px * 0.22);
  return (
    <svg width={px} height={px} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx={r * (100 / px)} fill="#C8102E" />
      <text x="50" y="38" textAnchor="middle" fill="white" fontSize={fs * (100 / px)} fontWeight="900" fontFamily="Arial, sans-serif">PEOPLE</text>
      <text x="50" y="55" textAnchor="middle" fill="white" fontSize={fs * (100 / px)} fontWeight="900" fontFamily="Arial, sans-serif">OF</text>
      <text x="50" y="72" textAnchor="middle" fill="white" fontSize={fs * (100 / px)} fontWeight="900" fontFamily="Arial, sans-serif">LISBON</text>
    </svg>
  );
}

export default function PolLogo({ size = 'md', className, square = true }: PolLogoProps) {
  const px = SIZE_MAP[size];
  const radius = px <= 32 ? 7 : px <= 44 ? 10 : px <= 64 ? 14 : 20;
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn('flex-shrink-0 overflow-hidden', className)}
      style={{ width: px, height: px, borderRadius: radius }}
    >
      {failed ? (
        <PolLogoFallback px={px} />
      ) : (
        <img
          src="/pol-logo.png"
          alt="People Of Lisbon"
          width={px}
          height={px}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
