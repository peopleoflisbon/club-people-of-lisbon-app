// ============================================================
// People Of Lisbon — TypeScript Types
// ============================================================

export type UserRole = 'member' | 'admin';
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked';
export type EventStatus = 'upcoming' | 'live' | 'past' | 'cancelled';
export type RsvpStatus = 'attending' | 'waitlist' | 'cancelled';
export type MessageStatus = 'sent' | 'read';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  headline: string;
  short_bio: string;
  neighborhood: string;
  avatar_url: string;
  linkedin_url: string;
  instagram_handle: string;
  website_url: string;
  favorite_spots: string;
  personal_story: string;
  open_to_feature: boolean;
  role: UserRole;
  is_active: boolean;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  email: string;
  token: string;
  invited_by: string | null;
  status: InviteStatus;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  inviter?: Pick<Profile, 'full_name' | 'avatar_url'>;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location_name: string;
  location_address: string;
  location_lat: number | null;
  location_lng: number | null;
  starts_at: string;
  ends_at: string | null;
  image_url: string;
  capacity: number | null;
  status: EventStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  rsvp_count?: number;
  user_rsvp?: RsvpStatus | null;
}

export interface EventRsvp {
  id: string;
  event_id: string;
  user_id: string;
  status: RsvpStatus;
  created_at: string;
  updated_at: string;
  profile?: Pick<Profile, 'full_name' | 'avatar_url' | 'email' | 'headline'>;
}

export interface Sponsor {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  website_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MapPin {
  id: string;
  title: string;
  featured_person: string;
  neighborhood: string;
  description: string;
  thumbnail_url: string;
  youtube_url: string;
  latitude: number;
  longitude: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Update {
  id: string;
  title: string;
  content: string;
  image_url: string;
  is_published: boolean;
  published_at: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  participant_a: string;
  participant_b: string;
  last_message_at: string;
  created_at: string;
  other_profile?: Profile;
  last_message?: Pick<Message, 'content' | 'created_at' | 'sender_id'>;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  status: MessageStatus;
  created_at: string;
  updated_at: string;
}

// Form types
export interface ProfileFormData {
  full_name: string;
  headline: string;
  short_bio: string;
  neighborhood: string;
  linkedin_url: string;
  instagram_handle: string;
  website_url: string;
  favorite_spots: string;
  personal_story: string;
  open_to_feature: boolean;
}

export interface EventFormData {
  title: string;
  description: string;
  location_name: string;
  location_address: string;
  location_lat?: number;
  location_lng?: number;
  starts_at: string;
  ends_at?: string;
  capacity?: number;
  status: EventStatus;
}

export interface MapPinFormData {
  title: string;
  featured_person: string;
  neighborhood: string;
  description: string;
  youtube_url: string;
  latitude: number;
  longitude: number;
  thumbnail_url: string;
}

export interface UpdateFormData {
  title: string;
  content: string;
  image_url?: string;
  is_published: boolean;
}

export interface SponsorFormData {
  name: string;
  description: string;
  logo_url: string;
  website_url: string;
  display_order: number;
}

export interface RitaPhoto {
  id: string;
  image_url: string;
  title: string;
  caption: string;
  date_taken: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RitaPhotoFormData {
  image_url: string;
  title: string;
  caption: string;
  date_taken?: string;
  is_published: boolean;
  sort_order: number;
}

export interface AppSetting {
  key: string;
  value: string;
  updated_at: string;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
}

export type GoodNewsCategory = 'Win' | 'Deal' | 'Collaboration' | 'Opportunity' | 'Recommendation';

export interface GoodNewsPost {
  id: string;
  author_profile_id: string;
  title: string;
  body: string;
  category: GoodNewsCategory;
  link_url: string;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  author?: Pick<Profile, 'full_name' | 'avatar_url' | 'headline'>;
}

export interface GoodNewsFormData {
  title: string;
  body: string;
  category: GoodNewsCategory;
  link_url: string;
}
