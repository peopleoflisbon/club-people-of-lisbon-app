create table if not exists recommendations (
  id uuid default gen_random_uuid() primary key,
  category text not null default 'Restaurant',
  name text not null,
  description text not null default '',
  address text default '',
  neighbourhood text default '',
  recommended_by text not null default 'Stephen O''Regan',
  recommender_role text default 'Founder, People Of Lisbon',
  website_url text default '',
  google_maps_url text default '',
  image_url text default '',
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamptz default now()
);

alter table recommendations enable row level security;

drop policy if exists "Members can read recommendations" on recommendations;
drop policy if exists "Admins can manage recommendations" on recommendations;
drop policy if exists "Admins can insert recommendations" on recommendations;
drop policy if exists "Admins can update recommendations" on recommendations;
drop policy if exists "Admins can delete recommendations" on recommendations;

create policy "Members can read recommendations" on recommendations
  for select using (auth.role() = 'authenticated');

create policy "Admins can insert recommendations" on recommendations
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update recommendations" on recommendations
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete recommendations" on recommendations
  for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Seed 3 recommendations (only if table is empty)
insert into recommendations (category, name, description, neighbourhood, recommended_by, recommender_role, display_order)
select * from (values
  ('Restaurant', 'Tasca do Chico', 'The best petiscos in Lisbon. No menu, no fuss — the owner decides what you eat and it''s always perfect. Book ahead, it fills up fast.', 'Bairro Alto', 'Stephen O''Regan', 'Founder, People Of Lisbon', 1),
  ('Coffee', 'Landeau Chocolate', 'One slice of their chocolate cake will genuinely change your week. The Príncipe Real location has a beautiful courtyard out back.', 'Príncipe Real', 'Rita Freitas', 'Photographer, People Of Lisbon', 2),
  ('Experience', 'Miradouro da Graça', 'Skip Alfama viewpoint. Come here at sunset with a beer from the kiosk. Locals, not tourists. That''s the Lisbon we love.', 'Graça', 'Stephen O''Regan', 'Founder, People Of Lisbon', 3)
) as v(category, name, description, neighbourhood, recommended_by, recommender_role, display_order)
where not exists (select 1 from recommendations limit 1);
