export type StickerType = 'member' | 'recommendation' | 'landmark' | 'rita';

export interface StickerDef {
  type: StickerType;
  source_id: string;
  name: string;
  subtitle: string;
  description: string;
  image_url: string | null;
  number: number;
}

export interface CollectedSticker extends StickerDef {
  collected_at: string;
}

// Sticker number ranges:
// Members:         #001 – #200
// Landmarks:       #201 – #250
// Recommendations: #251 – #450
// Rita's Series:   #451 – #600

export function customToSticker(row: any, baseNumber: number, index: number): StickerDef {
  return {
    type: row.type as StickerType,
    source_id: row.id,
    name: row.name,
    subtitle: row.subtitle || '',
    description: row.description || '',
    image_url: row.image_url || null,
    number: baseNumber + index,
  };
}

export function memberToSticker(m: any, rank: number): StickerDef {
  return {
    type: 'member',
    source_id: m.id,
    name: m.full_name,
    subtitle: m.job_title || m.headline || '',
    description: '',
    image_url: m.avatar_url || null,
    number: 1 + rank,
  };
}

export function recToSticker(r: any, rank: number): StickerDef {
  return {
    type: 'recommendation',
    source_id: r.id,
    name: r.name,
    subtitle: [r.category, r.neighbourhood].filter(Boolean).join(' · '),
    description: '',
    image_url: r.image_url || null,
    number: 251 + rank,
  };
}

export const BORDER_COLORS: Record<StickerType, string> = {
  member: '#C8A84B',
  recommendation: '#C8102E',
  landmark: '#2B6CB0',
  rita: '#7B3F8C',
};

export const PLATE_COLORS: Record<StickerType, string> = {
  member: '#1C1C1C',
  recommendation: '#C8102E',
  landmark: '#2B6CB0',
  rita: '#7B3F8C',
};

export const TYPE_LABELS: Record<StickerType, string> = {
  member: 'Member',
  recommendation: 'Recommendation',
  landmark: 'Lisbon Landmark',
  rita: "Rita's Series",
};
