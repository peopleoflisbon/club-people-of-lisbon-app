export type StickerType = 'member' | 'recommendation' | 'landmark';

export interface StickerDef {
  type: StickerType;
  source_id: string;
  name: string;
  subtitle: string;
  image_url: string | null;
  number: number;
}

export interface CollectedSticker extends StickerDef {
  collected_at: string;
}

// Lisbon landmarks — curated by POL. Image URLs can be updated via admin.
export const LANDMARKS: Array<{ id: string; name: string; subtitle: string; image_url: string }> = [
  {
    id: 'castelo-sao-jorge',
    name: 'Castelo de São Jorge',
    subtitle: 'Alfama · Lisbon Landmark',
    image_url: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=600&q=80',
  },
  {
    id: 'torre-belem',
    name: 'Torre de Belém',
    subtitle: 'Belém · Lisbon Landmark',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  {
    id: 'praca-comercio',
    name: 'Praça do Comércio',
    subtitle: 'Baixa · Lisbon Landmark',
    image_url: 'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=600&q=80',
  },
  {
    id: 'tram-28',
    name: 'Electrico 28',
    subtitle: 'Alfama · Lisbon Landmark',
    image_url: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=80',
  },
  {
    id: 'miradouro-graca',
    name: 'Miradouro da Graça',
    subtitle: 'Graça · Lisbon Landmark',
    image_url: 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=600&q=80',
  },
  {
    id: 'ponte-25-abril',
    name: 'Ponte 25 de Abril',
    subtitle: 'Alcântara · Lisbon Landmark',
    image_url: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&q=80',
  },
  {
    id: 'jeronimos',
    name: 'Mosteiro dos Jerónimos',
    subtitle: 'Belém · Lisbon Landmark',
    image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
  },
  {
    id: 'elevador-santa-justa',
    name: 'Elevador de Santa Justa',
    subtitle: 'Baixa · Lisbon Landmark',
    image_url: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=600&q=80',
  },
  {
    id: 'alfama-rooftops',
    name: 'Alfama Rooftops',
    subtitle: 'Alfama · Lisbon Landmark',
    image_url: 'https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?w=600&q=80',
  },
  {
    id: 'pastel-belem',
    name: 'Pastéis de Belém',
    subtitle: 'Belém · Lisbon Landmark',
    image_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80',
  },
];

// Sticker number ranges:
// Members:        #001 – #200
// Landmarks:      #201 – #220
// Recommendations: #221 – #400

export function landmarkToSticker(lm: typeof LANDMARKS[0], index: number): StickerDef {
  return {
    type: 'landmark',
    source_id: lm.id,
    name: lm.name,
    subtitle: lm.subtitle,
    image_url: lm.image_url,
    number: 201 + index,
  };
}

export function memberToSticker(m: any, rank: number): StickerDef {
  return {
    type: 'member',
    source_id: m.id,
    name: m.full_name,
    subtitle: [m.job_title || m.headline, m.neighborhood].filter(Boolean).join(' · '),
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
    image_url: r.image_url || null,
    number: 221 + rank,
  };
}

export const BORDER_COLORS: Record<StickerType, string> = {
  member: '#C8A84B',
  recommendation: '#C8102E',
  landmark: '#2B6CB0',
};

export const PLATE_COLORS: Record<StickerType, string> = {
  member: '#1C1C1C',
  recommendation: '#C8102E',
  landmark: '#2B6CB0',
};
