-- ============================================================
-- Migration 002: Rita's Photos + App Settings + QA improvements
-- ============================================================

-- APP SETTINGS (login background, etc.)
create table if not exists app_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

alter table app_settings enable row level security;

create policy "Members read settings" on app_settings
  for select using (auth.uid() is not null);

create policy "Admins manage settings" on app_settings
  for all using (is_admin());

-- Default login background (can be updated by admin)
insert into app_settings (key, value) values
  ('login_background_image_url', ''),
  ('login_background_overlay_opacity', '0.55')
on conflict (key) do nothing;

-- RITA'S PHOTOS
create table if not exists rita_photos (
  id uuid default uuid_generate_v4() primary key,
  image_url text not null,
  title text default '',
  caption text default '',
  date_taken date,
  is_published boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger rita_photos_updated_at
  before update on rita_photos
  for each row execute function update_updated_at();

alter table rita_photos enable row level security;

create policy "Members read published photos" on rita_photos
  for select using (auth.uid() is not null and is_published = true);

create policy "Admins manage rita photos" on rita_photos
  for all using (is_admin());

-- Sample photos (using Unsplash Lisbon photos for demo)
insert into rita_photos (image_url, title, caption, date_taken, sort_order) values
  ('https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80', 'Morning in Alfama', 'The streets quiet before the city wakes. Alfama at 7am.', '2025-01-15', 1),
  ('https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?w=1200&q=80', 'Yellow Tram No. 28', 'An icon of Lisbon. Caught between Graça and Chiado.', '2025-01-20', 2),
  ('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', 'Miradouro da Graça', 'Sunset from the viewpoint. The whole city laid out below.', '2025-02-03', 3),
  ('https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80', 'Azulejos of Mouraria', 'The tiles tell stories older than the buildings they cover.', '2025-02-10', 4),
  ('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80', 'LX Factory Sunday', 'The old factory alive with market noise and music.', '2025-02-15', 5)
on conflict do nothing;
