-- MailCraft AI — initial schema
-- Run via `supabase db push` or the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: 1:1 extension of auth.users with personalization data
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  designation text,
  phone text,
  email text,
  website text,
  linkedin text,
  address text,
  language text not null default 'auto',
  tone text not null default 'professional',
  signature text,
  active_company_id uuid,
  plan text not null default 'free' check (plan in ('free', 'pro', 'business')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Per-user profile and personalization defaults.';

-- ---------------------------------------------------------------------------
-- companies: Brand Brain — one user can have multiple company profiles
-- ---------------------------------------------------------------------------
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  industry text,
  description text,
  products text,
  services text,
  usp text,
  target_audience text,
  customer_type text,
  website text,
  brand_voice text,
  achievements text,
  differentiators text,
  contact_information text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists companies_user_id_idx on public.companies (user_id);

alter table public.profiles
  add constraint profiles_active_company_fk
  foreign key (active_company_id) references public.companies (id) on delete set null;

-- ---------------------------------------------------------------------------
-- email_generations: history of AI-generated emails
-- ---------------------------------------------------------------------------
create table if not exists public.email_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid references public.companies (id) on delete set null,
  prompt text not null,
  intent text,
  recipient_type text,
  objective text,
  tone text,
  language text,
  length text,
  mode text,
  subject text,
  subject_options jsonb not null default '[]'::jsonb,
  body text not null,
  structured_output jsonb,
  quality_score integer,
  quality_breakdown jsonb,
  created_at timestamptz not null default now()
);

create index if not exists email_generations_user_id_idx on public.email_generations (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- saved_templates: reusable templates
-- ---------------------------------------------------------------------------
create table if not exists public.saved_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid references public.companies (id) on delete set null,
  name text not null,
  category text not null default 'other',
  subject text,
  body text not null,
  tone text,
  language text,
  favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_templates_user_id_idx on public.saved_templates (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- email_connections: OAuth-connected mailboxes (tokens stored encrypted)
-- ---------------------------------------------------------------------------
create table if not exists public.email_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('gmail', 'outlook')),
  provider_account_id text,
  email_address text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  scopes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

-- ---------------------------------------------------------------------------
-- usage_daily: coarse per-day generation counters for rate limiting
-- ---------------------------------------------------------------------------
create table if not exists public.usage_daily (
  user_id uuid not null references auth.users (id) on delete cascade,
  usage_date date not null default current_date,
  generations_count integer not null default 0,
  primary key (user_id, usage_date)
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on public.companies;
create trigger set_updated_at before update on public.companies
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on public.saved_templates;
create trigger set_updated_at before update on public.saved_templates
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on public.email_connections;
create trigger set_updated_at before update on public.email_connections
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- auto-create a profile row whenever a new auth user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.email_generations enable row level security;
alter table public.saved_templates enable row level security;
alter table public.email_connections enable row level security;
alter table public.usage_daily enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can view their own companies"
  on public.companies for select using (auth.uid() = user_id);
create policy "Users can insert their own companies"
  on public.companies for insert with check (auth.uid() = user_id);
create policy "Users can update their own companies"
  on public.companies for update using (auth.uid() = user_id);
create policy "Users can delete their own companies"
  on public.companies for delete using (auth.uid() = user_id);

create policy "Users can view their own generations"
  on public.email_generations for select using (auth.uid() = user_id);
create policy "Users can insert their own generations"
  on public.email_generations for insert with check (auth.uid() = user_id);
create policy "Users can update their own generations"
  on public.email_generations for update using (auth.uid() = user_id);
create policy "Users can delete their own generations"
  on public.email_generations for delete using (auth.uid() = user_id);

create policy "Users can view their own templates"
  on public.saved_templates for select using (auth.uid() = user_id);
create policy "Users can insert their own templates"
  on public.saved_templates for insert with check (auth.uid() = user_id);
create policy "Users can update their own templates"
  on public.saved_templates for update using (auth.uid() = user_id);
create policy "Users can delete their own templates"
  on public.saved_templates for delete using (auth.uid() = user_id);

create policy "Users can view their own connections"
  on public.email_connections for select using (auth.uid() = user_id);
create policy "Users can insert their own connections"
  on public.email_connections for insert with check (auth.uid() = user_id);
create policy "Users can update their own connections"
  on public.email_connections for update using (auth.uid() = user_id);
create policy "Users can delete their own connections"
  on public.email_connections for delete using (auth.uid() = user_id);

create policy "Users can view their own usage"
  on public.usage_daily for select using (auth.uid() = user_id);
create policy "Users can insert their own usage"
  on public.usage_daily for insert with check (auth.uid() = user_id);
create policy "Users can update their own usage"
  on public.usage_daily for update using (auth.uid() = user_id);
