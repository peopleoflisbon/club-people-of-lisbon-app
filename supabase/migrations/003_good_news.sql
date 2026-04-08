-- ============================================================
-- Migration 003: Good News Posts + Home Screen
-- ============================================================

-- GOOD NEWS POSTS
create table if not exists good_news_posts (
  id uuid default uuid_generate_v4() primary key,
  author_profile_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  body text default '',
  category text default 'Win' check (category in ('Win','Deal','Collaboration','Opportunity','Recommendation')),
  link_url text default '',
  is_published boolean default true,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger good_news_updated_at
  before update on good_news_posts
  for each row execute function update_updated_at();

alter table good_news_posts enable row level security;

create policy "Members read published good news" on good_news_posts
  for select using (auth.uid() is not null and is_published = true);

create policy "Members create own good news" on good_news_posts
  for insert with check (auth.uid() = author_profile_id);

create policy "Members update own good news" on good_news_posts
  for update using (auth.uid() = author_profile_id);

create policy "Admins manage good news" on good_news_posts
  for all using (is_admin());

-- Sample good news posts (will use placeholder author — update with real UUIDs)
-- These are illustrative; real posts need real profile IDs

-- Add home screen settings
insert into app_settings (key, value) values
  ('home_welcome_headline', 'Welcome to the Club'),
  ('home_welcome_subline', 'People Of Lisbon')
on conflict (key) do nothing;

-- Add logo setting
insert into app_settings (key, value) values
  ('logo_url', '/pol-logo.png')
on conflict (key) do nothing;
