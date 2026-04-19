-- Add map_user to the user_role enum
-- This must be run in Supabase SQL Editor

alter type user_role add value if not exists 'map_user';

-- Update the trigger to set role from user metadata if provided
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    case 
      when new.raw_user_meta_data->>'role' = 'map_user' then 'map_user'::user_role
      else 'member'::user_role
    end
  )
  on conflict (id) do update set
    role = case 
      when new.raw_user_meta_data->>'role' = 'map_user' then 'map_user'::user_role
      else profiles.role
    end;
  return new;
end;
$$ language plpgsql security definer;

-- Fix any existing map_users who have role='member' incorrectly
-- (You may need to run this manually after checking who should be map_user)
-- update profiles set role = 'map_user' where id in (
--   select id from auth.users where raw_user_meta_data->>'role' = 'map_user'
-- );
