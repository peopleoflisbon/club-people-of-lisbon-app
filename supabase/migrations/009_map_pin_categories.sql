-- Add categories array and filmed_address to map_pins
alter table map_pins add column if not exists categories text[] default '{}';
alter table map_pins add column if not exists filmed_address text default '';
