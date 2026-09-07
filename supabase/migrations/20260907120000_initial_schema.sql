create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null unique,
  first_name text not null,
  last_name text,
  username text,
  language_code text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('clinic', 'dental', 'beauty', 'barber', 'fitness', 'massage', 'repair', 'other')),
  timezone text not null default 'Asia/Tashkent',
  currency text not null default 'USD',
  phone text,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'staff')),
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  color text not null default '#187ACC'
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text not null,
  telegram_id bigint,
  telegram_username text,
  date_of_birth date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_tags (
  client_id uuid not null references public.clients(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (client_id, tag_id)
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12, 2) not null default 0,
  duration_min integer not null,
  active boolean not null default true,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  first_name text not null,
  last_name text not null,
  title text not null,
  color text not null default '#187ACC',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_services (
  staff_id uuid not null references public.staff(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (staff_id, service_id)
);

create table if not exists public.working_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  staff_id uuid references public.staff(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  is_closed boolean not null default false,
  ranges jsonb not null default '[]'::jsonb,
  breaks jsonb not null default '[]'::jsonb
);

create table if not exists public.holidays (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  staff_id uuid references public.staff(id) on delete cascade,
  date date not null,
  name text not null
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'confirmed', 'arrived', 'completed', 'cancelled', 'no_show')),
  notes text,
  reminder_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointment_notes (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.appointment_status_history (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  from_status text,
  to_status text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  channel text not null check (channel in ('sms', 'telegram', 'whatsapp')),
  content text not null,
  is_system boolean not null default false
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  channel text not null check (channel in ('sms', 'telegram', 'whatsapp')),
  template_id uuid references public.message_templates(id) on delete set null,
  content text not null,
  status text not null default 'queued' check (status in ('draft', 'queued', 'sent', 'delivered', 'failed')),
  provider text not null default 'mock-sms',
  provider_message_id text,
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.message_logs (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  status text not null,
  detail text,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  channel text not null check (channel in ('sms', 'telegram', 'whatsapp')),
  type text not null check (type in ('appointment_reminder', 'appointment_confirmation', 'follow_up', 'custom')),
  content text not null,
  run_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  message_id uuid references public.messages(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  entity_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  reminder_offsets_min integer[] not null default '{1440,60}',
  default_channel text not null default 'sms' check (default_channel in ('sms', 'telegram', 'whatsapp'))
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create index if not exists clients_business_id_idx on public.clients(business_id);
create index if not exists clients_phone_idx on public.clients(phone);
create index if not exists appointments_business_start_idx on public.appointments(business_id, start_at);
create index if not exists appointments_client_id_idx on public.appointments(client_id);
create index if not exists messages_business_id_idx on public.messages(business_id, created_at desc);
create index if not exists notification_jobs_due_idx on public.notification_jobs(status, run_at);
create index if not exists business_members_user_id_idx on public.business_members(user_id);

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at before update on public.businesses
for each row execute function public.set_updated_at();

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at before update on public.services
for each row execute function public.set_updated_at();

drop trigger if exists staff_set_updated_at on public.staff;
create trigger staff_set_updated_at before update on public.staff
for each row execute function public.set_updated_at();

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at before update on public.appointments
for each row execute function public.set_updated_at();

create or replace function public.current_app_user_id()
returns uuid
language sql
stable
as $$
  select coalesce(
    nullif(auth.jwt() ->> 'app_user_id', '')::uuid,
    (
      select users.id
      from public.users
      where users.telegram_id = nullif(auth.jwt() ->> 'telegram_id', '')::bigint
      limit 1
    )
  );
$$;

create or replace function public.accessible_business_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select business_id
  from public.business_members
  where user_id = public.current_app_user_id();
$$;

alter table public.users enable row level security;
alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.tags enable row level security;
alter table public.clients enable row level security;
alter table public.client_tags enable row level security;
alter table public.services enable row level security;
alter table public.staff enable row level security;
alter table public.staff_services enable row level security;
alter table public.working_hours enable row level security;
alter table public.holidays enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_notes enable row level security;
alter table public.appointment_status_history enable row level security;
alter table public.message_templates enable row level security;
alter table public.messages enable row level security;
alter table public.message_logs enable row level security;
alter table public.notification_jobs enable row level security;
alter table public.analytics_events enable row level security;
alter table public.settings enable row level security;
alter table public.subscriptions enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

create policy "users read self" on public.users for select using (id = public.current_app_user_id());
create policy "users update self" on public.users for update using (id = public.current_app_user_id());

create policy "businesses member select" on public.businesses for select
using (id in (select public.accessible_business_ids()));
create policy "businesses owner update" on public.businesses for update
using (id in (
  select business_id from public.business_members
  where user_id = public.current_app_user_id() and role = 'owner'
));

create policy "members select" on public.business_members for select
using (business_id in (select public.accessible_business_ids()));

create policy "tags scoped" on public.tags for all
using (business_id in (select public.accessible_business_ids()))
with check (business_id in (select public.accessible_business_ids()));

create policy "clients scoped" on public.clients for all
using (business_id in (select public.accessible_business_ids()))
with check (business_id in (select public.accessible_business_ids()));

create policy "client_tags scoped" on public.client_tags for all
using (client_id in (select id from public.clients where business_id in (select public.accessible_business_ids())))
with check (client_id in (select id from public.clients where business_id in (select public.accessible_business_ids())));

create policy "services scoped" on public.services for all
using (business_id in (select public.accessible_business_ids()))
with check (business_id in (select public.accessible_business_ids()));

create policy "staff scoped" on public.staff for all
using (business_id in (select public.accessible_business_ids()))
with check (business_id in (select public.accessible_business_ids()));

create policy "staff_services scoped" on public.staff_services for all
using (staff_id in (select id from public.staff where business_id in (select public.accessible_business_ids())))
with check (staff_id in (select id from public.staff where business_id in (select public.accessible_business_ids())));

create policy "working_hours scoped" on public.working_hours for all
using (business_id in (select public.accessible_business_ids()))
with check (business_id in (select public.accessible_business_ids()));

create policy "holidays scoped" on public.holidays for all
using (business_id in (select public.accessible_business_ids()))
with check (business_id in (select public.accessible_business_ids()));

create policy "appointments scoped" on public.appointments for all
using (business_id in (select public.accessible_business_ids()))
with check (
  business_id in (select public.accessible_business_ids())
  and exists (select 1 from public.clients c where c.id = client_id and c.business_id = appointments.business_id)
);

create policy "appointment_notes scoped" on public.appointment_notes for all
using (appointment_id in (select id from public.appointments where business_id in (select public.accessible_business_ids())))
with check (appointment_id in (select id from public.appointments where business_id in (select public.accessible_business_ids())));

create policy "appointment_status_history scoped" on public.appointment_status_history for all
using (appointment_id in (select id from public.appointments where business_id in (select public.accessible_business_ids())))
with check (appointment_id in (select id from public.appointments where business_id in (select public.accessible_business_ids())));

create policy "templates scoped" on public.message_templates for all
using (business_id in (select public.accessible_business_ids()))
with check (business_id in (select public.accessible_business_ids()));

create policy "messages scoped" on public.messages for all
using (business_id in (select public.accessible_business_ids()))
with check (business_id in (select public.accessible_business_ids()));

create policy "message_logs scoped" on public.message_logs for all
using (message_id in (select id from public.messages where business_id in (select public.accessible_business_ids())))
with check (message_id in (select id from public.messages where business_id in (select public.accessible_business_ids())));

create policy "notification_jobs scoped" on public.notification_jobs for all
using (business_id in (select public.accessible_business_ids()))
with check (business_id in (select public.accessible_business_ids()));

create policy "analytics scoped" on public.analytics_events for all
using (business_id in (select public.accessible_business_ids()))
with check (business_id in (select public.accessible_business_ids()));

create policy "settings scoped" on public.settings for all
using (business_id in (select public.accessible_business_ids()))
with check (business_id in (select public.accessible_business_ids()));

create policy "subscriptions scoped" on public.subscriptions for all
using (business_id in (select public.accessible_business_ids()))
with check (business_id in (select public.accessible_business_ids()));

create policy "users insert self" on public.users for insert
with check (id = public.current_app_user_id() or telegram_id = nullif(auth.jwt() ->> 'telegram_id', '')::bigint);

create policy "businesses insert" on public.businesses for insert
with check (true);

create policy "members insert self" on public.business_members for insert
with check (user_id = public.current_app_user_id());

grant execute on function public.current_app_user_id() to authenticated;
grant execute on function public.accessible_business_ids() to authenticated;
