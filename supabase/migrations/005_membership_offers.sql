-- Membership offers table
create table if not exists membership_offers (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  discount text,
  partner_name text not null,
  partner_url text,
  how_to_redeem text default 'Mention People Of Lisbon',
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamptz default now()
);

alter table membership_offers enable row level security;

create policy "Members can read offers" on membership_offers
  for select using (auth.role() = 'authenticated');

create policy "Admins can manage offers" on membership_offers
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Seed 4 mock offers
insert into membership_offers (title, description, discount, partner_name, partner_url, how_to_redeem, display_order) values
  ('Tennis Lessons', '15% off private and group tennis lessons with Rita Freitas, one of Lisbon''s top coaches.', '15% off', 'Rita Freitas Tennis', 'https://example.com/rita', 'Mention People Of Lisbon when booking', 1),
  ('Wine Tasting', 'Complimentary welcome drink at any tasting session at Lisbon Wine Experience.', 'Free welcome drink', 'Lisbon Wine Experience', 'https://example.com/wine', 'Show your membership card at the door', 2),
  ('Surf Lessons', '20% off beginner and intermediate surf sessions in Cascais.', '20% off', 'Cascais Surf School', 'https://example.com/surf', 'Book online and use code PEOPLEOFLISBON', 3),
  ('Co-working Day Pass', 'One free day pass per month at LX Factory co-working space.', '1 free day/month', 'LX Factory Workspace', 'https://example.com/lx', 'Present your digital membership card at reception', 4);
