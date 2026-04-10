-- ============================================================
-- People Of Lisbon — Complete Database Schema
-- Run this in your Supabase SQL editor or via migration
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for fuzzy search

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('member', 'admin');
create type invite_status as enum ('pending', 'accepted', 'expired', 'revoked');
create type event_status as enum ('upcoming', 'live', 'past', 'cancelled');
create type rsvp_status as enum ('attending', 'waitlist', 'cancelled');
create type message_status as enum ('sent', 'read');

-- ============================================================
-- PROFILES
-- ============================================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null default '',
  headline text default '',
  short_bio text default '',
  neighborhood text default '',
  avatar_url text default '',
  linkedin_url text default '',
  instagram_handle text default '',
  website_url text default '',
  favorite_spots text default '',
  personal_story text default '',
  open_to_feature boolean default false,
  role user_role default 'member',
  is_active boolean default true,
  joined_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Full-text search index on profiles
create index profiles_search_idx on profiles using gin(
  (to_tsvector('english', coalesce(full_name,'') || ' ' || coalesce(headline,'') || ' ' || coalesce(neighborhood,'')))
);

-- ============================================================
-- INVITATIONS
-- ============================================================
create table invitations (
  id uuid default uuid_generate_v4() primary key,
  email text not null,
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  invited_by uuid references profiles(id),
  status invite_status default 'pending',
  expires_at timestamptz default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- EVENTS
-- ============================================================
create table events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text default '',
  location_name text default '',
  location_address text default '',
  location_lat numeric(10, 7),
  location_lng numeric(10, 7),
  starts_at timestamptz not null,
  ends_at timestamptz,
  image_url text default '',
  capacity integer,
  status event_status default 'upcoming',
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- EVENT RSVPs
-- ============================================================
create table event_rsvps (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  status rsvp_status default 'attending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(event_id, user_id)
);

-- ============================================================
-- SPONSORS
-- ============================================================
create table sponsors (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text default '',
  logo_url text default '',
  website_url text default '',
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- MAP PINS (video locations)
-- ============================================================
create table map_pins (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  featured_person text default '',
  neighborhood text default '',
  description text default '',
  thumbnail_url text default '',
  youtube_url text not null,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- UPDATES (Stephen's updates)
-- ============================================================
create table updates (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  image_url text default '',
  is_published boolean default true,
  published_at timestamptz default now(),
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
create table conversations (
  id uuid default uuid_generate_v4() primary key,
  participant_a uuid references profiles(id) on delete cascade not null,
  participant_b uuid references profiles(id) on delete cascade not null,
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(participant_a, participant_b),
  check (participant_a < participant_b) -- enforce consistent ordering
);

-- ============================================================
-- MESSAGES
-- ============================================================
create table messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  status message_status default 'sent',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index messages_conversation_idx on messages(conversation_id, created_at desc);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles for each row execute function update_updated_at();
create trigger invitations_updated_at before update on invitations for each row execute function update_updated_at();
create trigger events_updated_at before update on events for each row execute function update_updated_at();
create trigger event_rsvps_updated_at before update on event_rsvps for each row execute function update_updated_at();
create trigger sponsors_updated_at before update on sponsors for each row execute function update_updated_at();
create trigger map_pins_updated_at before update on map_pins for each row execute function update_updated_at();
create trigger updates_updated_at before update on updates for each row execute function update_updated_at();
create trigger conversations_updated_at before update on conversations for each row execute function update_updated_at();
create trigger messages_updated_at before update on messages for each row execute function update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGN UP
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table invitations enable row level security;
alter table events enable row level security;
alter table event_rsvps enable row level security;
alter table sponsors enable row level security;
alter table map_pins enable row level security;
alter table updates enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- Helper function
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- PROFILES policies
create policy "Members can read active profiles" on profiles
  for select using (auth.uid() is not null and is_active = true);

create policy "Members update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Admins can update any profile" on profiles
  for update using (is_admin());

create policy "Admins can insert profiles" on profiles
  for insert with check (is_admin());

-- INVITATIONS policies
create policy "Admins manage invitations" on invitations
  for all using (is_admin());

create policy "Public can read own invitation by token" on invitations
  for select using (true); -- token-based lookup, filtered in app

-- EVENTS policies
create policy "Members read events" on events
  for select using (auth.uid() is not null);

create policy "Admins manage events" on events
  for all using (is_admin());

-- EVENT RSVPs policies
create policy "Members read rsvps for events" on event_rsvps
  for select using (auth.uid() is not null);

create policy "Members manage own rsvp" on event_rsvps
  for all using (auth.uid() = user_id);

create policy "Admins manage all rsvps" on event_rsvps
  for all using (is_admin());

-- SPONSORS policies
create policy "Members read active sponsors" on sponsors
  for select using (auth.uid() is not null and is_active = true);

create policy "Admins manage sponsors" on sponsors
  for all using (is_admin());

-- MAP PINS policies
create policy "Members read published pins" on map_pins
  for select using (auth.uid() is not null and is_published = true);

create policy "Admins manage map pins" on map_pins
  for all using (is_admin());

-- UPDATES policies
create policy "Members read published updates" on updates
  for select using (auth.uid() is not null and is_published = true);

create policy "Admins manage updates" on updates
  for all using (is_admin());

-- CONVERSATIONS policies
create policy "Members read own conversations" on conversations
  for select using (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "Members create conversations" on conversations
  for insert with check (auth.uid() = participant_a or auth.uid() = participant_b);

-- MESSAGES policies
create policy "Members read messages in their conversations" on messages
  for select using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
      and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

create policy "Members send messages in their conversations" on messages
  for insert with check (
    auth.uid() = sender_id and
    exists (
      select 1 from conversations c
      where c.id = conversation_id
      and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

-- ============================================================
-- SAMPLE SEED DATA (for development)
-- ============================================================

-- Sample map pins for Lisbon
insert into map_pins (title, featured_person, neighborhood, description, thumbnail_url, youtube_url, latitude, longitude) values
('Alfama Stories', 'Ana Rodrigues', 'Alfama', 'A journey through the oldest neighborhood in Lisbon, where fado was born.', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 38.7139, -9.1334),
('Belém by the River', 'Miguel Santos', 'Belém', 'The iconic waterfront district where explorers once set sail.', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 38.6972, -9.2063),
('LX Factory Life', 'Sofia Mendes', 'Alcântara', 'The creative hub that transformed an old industrial complex into Lisbon''s cultural heart.', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 38.7043, -9.1758),
('Mouraria Soul', 'Carlos Ferreira', 'Mouraria', 'The multicultural neighborhood at the foot of São Jorge Castle.', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 38.7157, -9.1358),
('Príncipe Real Stories', 'Inês Costa', 'Príncipe Real', 'Lisbon''s most elegant neighborhood, full of antique shops and garden squares.', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 38.7156, -9.1488);

-- Sample sponsors
insert into sponsors (name, description, logo_url, website_url, display_order) values
('Lisbon Creative', 'The premier creative agency in Lisbon, supporting local culture and art.', '', 'https://example.com', 1),
('NOS', 'Portugal''s leading telecommunications company, connecting communities.', '', 'https://example.com', 2),
('Turismo de Lisboa', 'Promoting the best of Lisbon to the world.', '', 'https://example.com', 3);

-- Kudos / points system
create table if not exists kudos (
  id uuid default gen_random_uuid() primary key,
  recipient_id uuid references profiles(id) on delete cascade not null,
  giver_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

alter table kudos enable row level security;

create policy "Members can give kudos" on kudos for insert with check (auth.uid() = giver_id);
create policy "Anyone can read kudos" on kudos for select using (true);
