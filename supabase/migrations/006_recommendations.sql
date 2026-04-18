create table if not exists recommendations (
  id uuid default gen_random_uuid() primary key,
  category text not null default 'Restaurant',
  name text not null,
  description text not null,
  address text,
  neighbourhood text,
  recommended_by text not null default 'Stephen O''Regan',
  recommender_role text default 'Founder, People Of Lisbon',
  website_url text,
  google_maps_url text,
  image_url text,
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamptz default now()
);

alter table recommendations enable row level security;

create policy "Members can read recommendations" on recommendations
  for select using (auth.role() = 'authenticated');

create policy "Admins can manage recommendations" on recommendations
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 3 seeded recommendations
insert into recommendations (category, name, description, address, neighbourhood, recommended_by, recommender_role, display_order) values
  ('Restaurant', 'Tasca do Chico', 'The best petiscos in Lisbon. No menus, no fuss. The owner decides what you eat and it's always perfect. Book ahead.', 'Rua do Diário de Notícias 39', 'Bairro Alto', 'Stephen O''Regan', 'Founder, People Of Lisbon', 1),
  ('Coffee', 'Landeau Chocolate', 'One slice of their chocolate cake will genuinely change your week. The Príncipe Real location has a beautiful courtyard.', 'Rua das Flores 70', 'Príncipe Real', 'Rita Freitas', 'Photographer, People Of Lisbon', 2),
  ('Experience', 'Miradouro da Graça', 'Skip Alfama viewpoint. Come here at sunset with a beer from the kiosk. Locals, not tourists. That''s the Lisbon we love.', 'Largo da Graça', 'Graça', 'Stephen O''Regan', 'Founder, People Of Lisbon', 3);
