-- ============================================================
-- Migration 004: Brand settings
-- ============================================================

insert into app_settings (key, value) values
  ('brand_square_image_url', '/pol-logo.png')
on conflict (key) do nothing;

-- Ensure all prior settings exist
insert into app_settings (key, value) values
  ('login_background_image_url', ''),
  ('home_welcome_headline', 'Welcome to the Club'),
  ('home_welcome_subline', 'People Of Lisbon'),
  ('logo_url', '/pol-logo.png')
on conflict (key) do nothing;
