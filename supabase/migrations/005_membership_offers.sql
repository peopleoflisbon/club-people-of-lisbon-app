create table if not exists membership_offers (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null default '',
  discount text default '',
  partner_name text not null,
  partner_url text default '',
  how_to_redeem text default 'Mention People Of Lisbon',
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamptz default now()
);

alter table membership_offers enable row level security;

drop policy if exists "Members can read offers" on membership_offers;
drop policy if exists "Admins can manage offers" on membership_offers;

create policy "Members can read offers" on membership_offers
  for select using (auth.role() = 'authenticated');

create policy "Admins can insert offers" on membership_offers
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update offers" on membership_offers
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete offers" on membership_offers
  for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Seed 3 mock offers (only if table is empty)
insert into membership_offers (title, description, discount, partner_name, partner_url, how_to_redeem, display_order)
select * from (values
  ('Tennis Lessons', '15% off private and group tennis lessons with Rita Freitas, one of Lisbon''s top coaches based in Estoril.', '15% off', 'Rita Freitas Tennis', '', 'Mention People Of Lisbon when booking', 1),
  ('Wine Tasting', 'Complimentary welcome drink at any tasting session at Lisbon Wine Experience on Rua das Flores.', 'Free welcome drink', 'Lisbon Wine Experience', '', 'Show your membership card at the door', 2),
  ('Co-working Day Pass', 'One free day pass per month at the LX Factory co-working space. Great light, great coffee, great people.', '1 free day/month', 'LX Factory Workspace', '', 'Present your digital membership card at reception', 3)
) as v(title, description, discount, partner_name, partner_url, how_to_redeem, display_order)
where not exists (select 1 from membership_offers limit 1);
