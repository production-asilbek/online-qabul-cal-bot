alter table public.businesses
  add column if not exists category text not null default 'medical service';
