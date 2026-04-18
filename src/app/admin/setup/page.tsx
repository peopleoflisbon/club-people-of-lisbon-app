'use client';

import { useState } from 'react';

const SQL_OFFERS = `create table if not exists membership_offers (
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
drop policy if exists "Admins can insert offers" on membership_offers;
drop policy if exists "Admins can update offers" on membership_offers;
drop policy if exists "Admins can delete offers" on membership_offers;
create policy "Members can read offers" on membership_offers
  for select using (auth.role() = 'authenticated');
create policy "Admins can insert offers" on membership_offers
  for insert with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can update offers" on membership_offers
  for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can delete offers" on membership_offers
  for delete using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));`;

const SQL_RECS = `create table if not exists recommendations (
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
drop policy if exists "Admins can insert recommendations" on recommendations;
drop policy if exists "Admins can update recommendations" on recommendations;
drop policy if exists "Admins can delete recommendations" on recommendations;
create policy "Members can read recommendations" on recommendations
  for select using (auth.role() = 'authenticated');
create policy "Admins can insert recommendations" on recommendations
  for insert with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can update recommendations" on recommendations
  for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can delete recommendations" on recommendations
  for delete using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));`;

function CopyBlock({ label, sql }: { label: string; sql: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="pol-card overflow-hidden mb-6">
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #EDE7DC' }}>
        <p className="text-sm font-semibold" style={{ color: '#1C1C1C' }}>{label}</p>
        <button
          onClick={() => { navigator.clipboard.writeText(sql); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-xs font-bold px-3 py-1.5 rounded-lg"
          style={{ background: copied ? '#EEF4FA' : '#2F6DA5', color: copied ? '#2F6DA5' : 'white' }}>
          {copied ? '✓ Copied!' : 'Copy SQL'}
        </button>
      </div>
      <pre className="px-5 py-4 text-xs overflow-x-auto" style={{ color: '#4E4239', lineHeight: '1.6', fontFamily: 'monospace', background: '#FAF8F4' }}>
        {sql}
      </pre>
    </div>
  );
}

export default function AdminSetupPage() {
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#F5F1EA' }}>
      <div className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#1C1C1C' }}>Database Setup</h1>
        <p className="text-sm mb-6" style={{ color: '#A89A8C' }}>
          Run these SQL statements in your{' '}
          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
            className="font-semibold underline" style={{ color: '#2F6DA5' }}>
            Supabase SQL Editor
          </a>
          {' '}to create the missing tables. Go to your project → SQL Editor → New Query → paste → Run.
        </p>

        <div className="p-4 rounded-xl mb-6" style={{ background: '#FFF8EE', border: '1px solid #E6B75C' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: '#C49A3A' }}>⚠️ Run both blocks below</p>
          <p className="text-xs" style={{ color: '#8A7C6E' }}>Copy each one separately and run them one at a time in the Supabase SQL Editor.</p>
        </div>

        <CopyBlock label="1. Create membership_offers table" sql={SQL_OFFERS} />
        <CopyBlock label="2. Create recommendations table" sql={SQL_RECS} />

        <div className="pol-card p-5">
          <p className="text-sm font-semibold mb-2" style={{ color: '#1C1C1C' }}>After running both:</p>
          <ol className="text-sm space-y-1" style={{ color: '#6B5E52' }}>
            <li>1. Go to Admin → Member Offers to add offers</li>
            <li>2. Go to Admin → Recommendations to add places</li>
            <li>3. Offers appear below the Membership Card</li>
            <li>4. Recommendations appear on the Recommendations page</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
