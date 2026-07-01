'use client';

import { StickerDef, BORDER_COLORS, PLATE_COLORS } from '@/lib/stickers';

interface Props {
  sticker: Partial<StickerDef> & { type: 'member' | 'recommendation' | 'landmark'; name: string };
  size?: 'sm' | 'md' | 'lg';
  dimmed?: boolean;
}

const SIZES = {
  sm: { w: 70, h: 98, pad: 4, headerSize: 4.5, nameSize: 5.5, subSize: 4.5, borderInset: 3, imgFontSize: 18 },
  md: { w: 96, h: 135, pad: 6, headerSize: 5.5, nameSize: 7, subSize: 5.5, borderInset: 4, imgFontSize: 26 },
  lg: { w: 160, h: 224, pad: 9, headerSize: 7, nameSize: 11, subSize: 8.5, borderInset: 6, imgFontSize: 42 },
};

const TYPE_EMOJI: Record<string, string> = {
  member: '👤',
  recommendation: '⭐',
  landmark: '🏛',
};

export default function StickerCard({ sticker, size = 'md', dimmed = false }: Props) {
  const s = SIZES[size];
  const borderColor = BORDER_COLORS[sticker.type];
  const plateColor = PLATE_COLORS[sticker.type];
  const number = sticker.number ? String(sticker.number).padStart(3, '0') : '---';

  return (
    <div style={{
      width: s.w,
      height: s.h,
      background: '#F7F3EE',
      borderRadius: 4,
      position: 'relative',
      flexShrink: 0,
      opacity: dimmed ? 0.35 : 1,
      filter: dimmed ? 'grayscale(1)' : 'none',
      border: `${size === 'lg' ? 3 : 2}px solid ${borderColor}`,
      overflow: 'hidden',
    }}>
      {/* Inner inset border */}
      <div style={{
        position: 'absolute',
        inset: s.borderInset,
        border: `1px solid ${borderColor}`,
        borderRadius: 2,
        pointerEvents: 'none',
        zIndex: 2,
      }} />

      <div style={{ padding: s.pad, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: s.pad * 0.6,
        }}>
          <span style={{
            fontSize: s.headerSize, fontWeight: 800, letterSpacing: '.1em',
            textTransform: 'uppercase', color: borderColor, lineHeight: 1,
          }}>
            People Of Lisbon
          </span>
          <span style={{ fontSize: s.headerSize, color: '#9B8A7A', fontWeight: 600, lineHeight: 1 }}>
            #{number}
          </span>
        </div>

        {/* Photo */}
        <div style={{
          flex: 1, borderRadius: 2, overflow: 'hidden', background: '#1a1a1a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', marginBottom: s.pad * 0.6,
        }}>
          {sticker.image_url ? (
            <img
              src={sticker.image_url}
              alt={sticker.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <span style={{ fontSize: s.imgFontSize, lineHeight: 1 }}>
              {TYPE_EMOJI[sticker.type]}
            </span>
          )}
        </div>

        {/* Nameplate */}
        <div style={{
          background: plateColor, borderRadius: 2, padding: `${s.pad * 0.5}px ${s.pad * 0.6}px`,
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: s.nameSize, fontWeight: 800, color: '#fff',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            lineHeight: 1.2,
          }}>
            {sticker.name}
          </div>
          {sticker.subtitle && (
            <div style={{
              fontSize: s.subSize, color: 'rgba(255,255,255,0.6)',
              marginTop: 1.5, lineHeight: 1, whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {sticker.subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
