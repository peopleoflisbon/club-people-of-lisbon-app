# People Of Lisbon — Private Member App

A private invite-only member network for the People Of Lisbon community.

Built with: **Next.js 14 · TypeScript · Tailwind CSS · Supabase · Mapbox · Vercel**

---

## Features

- Invite-only authentication
- Member directory with search
- Direct messaging (real-time)
- Events with RSVP
- Interactive Lisbon video map (Mapbox)
- Updates from Stephen
- Sponsors showcase
- Full admin panel
- Mobile-first design (iPhone/Android/Desktop)

---

## Local Setup

### 1. Clone & install

```bash
git clone <your-repo>
cd people-of-lisbon
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **anon key** from Project Settings → API
3. Copy your **service role key** (keep this secret)

### 3. Run the database migration

In Supabase Dashboard → SQL Editor, paste and run the entire contents of:

```
supabase/migrations/001_initial_schema.sql
```

This creates all tables, RLS policies, triggers, and seed data.

### 4. Create a storage bucket

In Supabase → Storage → New Bucket:
- Name: `media`
- Public: ✅ Yes

Add a storage policy:
```sql
create policy "Authenticated users can upload"
on storage.objects for insert
with check (auth.uid() is not null);

create policy "Public read"
on storage.objects for select
using (true);
```

### 5. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Getting a Mapbox token:**
1. Create account at [mapbox.com](https://mapbox.com)
2. Dashboard → Access Tokens → Create token
3. Paste it as `NEXT_PUBLIC_MAPBOX_TOKEN`

### 6. Create your first admin user

1. In Supabase Auth → Users → Invite User (enter your email)
2. Accept the invite and create your account
3. In Supabase SQL Editor, run:

```sql
update profiles set role = 'admin' where email = 'your@email.com';
```

### 7. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Inviting Members

1. Sign in as admin
2. Go to `/admin/members`
3. Enter the member's email and click Send
4. Copy the invite link and share it with the member
5. They follow the link, set their name and password, and join

---

## Deploying to Vercel

```bash
npm install -g vercel
vercel login
vercel
```

When prompted, set all environment variables from `.env.local`.

Or: push to GitHub and connect the repo in the Vercel dashboard. Add environment variables in Vercel → Project Settings → Environment Variables.

**Update `NEXT_PUBLIC_APP_URL`** to your production URL after deployment.

---

## Supabase Auth Settings

In Supabase Dashboard → Authentication → URL Configuration:

- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth/callback`

Disable "Enable email confirmations" during initial setup if you want users to log in immediately after invite acceptance.

---

## Project Structure

```
src/
  app/
    auth/             Login, invite acceptance, callback
    (app)/            Protected app routes
      members/        Member directory + profiles
      events/         Events + RSVP
      map/            Interactive Lisbon video map
      messages/       Real-time messaging
      updates/        Stephen's updates
      sponsors/       Sponsor showcase
      profile/        Edit own profile
    admin/            Admin panel (admin role only)
      members/        Invite + manage members
      events/         Create + manage events
      sponsors/       Manage sponsors
      pins/           Manage map pins
      updates/        Write Stephen's updates
    api/              Route handlers
  components/
    layout/           AppShell (nav, mobile tabs, sidebar)
    ui/               Avatar, PageHeader, EmptyState
    members/          MembersClient, ProfileForm
    events/           EventsClient
    map/              LisbonMap (Mapbox)
    messages/         MessagesClient (real-time)
    admin/            All admin CRUD clients
  lib/
    supabase.ts       Supabase client helpers
    utils.ts          Utility functions
    database.types.ts Supabase type stubs
  types/
    index.ts          All TypeScript interfaces
  styles/
    globals.css       Global styles + Tailwind
supabase/
  migrations/
    001_initial_schema.sql   Complete DB schema + RLS
middleware.ts         Auth protection
```

---

## Generating Supabase Types

After schema changes, regenerate TypeScript types:

```bash
npx supabase gen types typescript \
  --project-id YOUR_PROJECT_ID \
  > src/lib/database.types.ts
```

---

## Adding New Features

The architecture is modular and database-driven.

**New page:** Add a folder under `src/app/(app)/`  
**New admin section:** Add a folder under `src/app/admin/`  
**New database table:** Add to `supabase/migrations/` and re-run  
**New component:** Add to the appropriate `src/components/` subfolder  

All content is fetched from Supabase — nothing is hardcoded.

---

## Brand Guidelines

- Name: **People Of Lisbon** (P, O, L always capitalised)
- Primary color: `#F4141E`
- Display font: SF UI Display Black (system font, no import needed)
- Body font: SF Pro Text (system font)
- Style: bold, editorial, cinematic, cultural, premium

---

## v3 Updates (Latest)

### New Features
- **Real People Of Lisbon logo** — uploaded asset used throughout app, login, nav, admin
- **Home Screen (Club Lobby)** — first screen after login showing new members, events, good news, latest photo, and Stephen's latest update
- **Share Good News** — members can post wins, deals, collaborations, opportunities, and recommendations; admin can feature/hide/remove posts
- **Navigation updated** — Home, Members, Events, Map, Messages, Good News (6 tabs mobile, sidebar desktop)
- **Login redesigned** — two-panel cinematic layout with real logo, Lisbon background photo

### Database Migrations
Run `supabase/migrations/003_good_news.sql` in Supabase SQL Editor:
- `good_news_posts` table with RLS
- `app_settings` additions (home_welcome_headline, logo_url)

### Admin Panel
New admin routes:
- `/admin/good-news` — moderate member posts, feature/hide/remove
- `/admin/settings` — includes login background, now with real logo preview

### File Structure Changes
```
src/
  app/(app)/home/page.tsx          ← NEW: Club lobby home screen
  app/(app)/good-news/page.tsx     ← NEW: Good News section
  app/admin/good-news/page.tsx     ← NEW: Admin moderation
  components/home/HomeClient.tsx   ← NEW: Home screen UI
  components/goodnews/             ← NEW: Good News components
  components/ui/PolLogo.tsx        ← NEW: Real logo component
public/pol-logo.png                ← NEW: Uploaded logo asset
supabase/migrations/003_good_news.sql ← NEW: DB migration
```
