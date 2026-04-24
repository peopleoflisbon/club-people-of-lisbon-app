-- ============================================================
-- CATEGORIES FOR MAP PINS
-- ============================================================

-- 1. Add filmed_address and google_maps_url to map_pins
alter table map_pins add column if not exists filmed_address text default '';
alter table map_pins add column if not exists google_maps_url text default '';

-- 2. Categories table (admin-managed, not hardcoded)
create table if not exists categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 3. Join table: many pins <-> many categories
create table if not exists map_pin_categories (
  pin_id uuid references map_pins(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade not null,
  primary key (pin_id, category_id)
);

-- 4. RLS
alter table categories enable row level security;
alter table map_pin_categories enable row level security;

create policy "Anyone can read active categories" on categories
  for select using (is_active = true);
create policy "Admins manage categories" on categories
  for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Anyone authenticated can read pin categories" on map_pin_categories
  for select using (auth.uid() is not null);
create policy "Admins manage pin categories" on map_pin_categories
  for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- 5. Seed initial categories
insert into categories (name, slug, sort_order) values
  ('Food & Drink', 'food-drink', 1),
  ('Experiences',  'experiences', 2),
  ('Weird',        'weird', 3),
  ('Music',        'music', 4),
  ('Politics',     'politics', 5),
  ('Sport',        'sport', 6),
  ('Green',        'green', 7),
  ('Art',          'art', 8),
  ('Dance',        'dance', 9),
  ('Film',         'film', 10)
on conflict (slug) do nothing;
