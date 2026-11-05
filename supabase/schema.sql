-- KUBUS: Tabellen, Rechte (RLS) und Trigger. Im Supabase SQL-Editor einmal ausführen.
-- Marktdaten: alle lesen, schreiben nur mit Secret Key (Pipeline; umgeht RLS).
-- Konto-Daten: nur die eigene Person.

create table if not exists public.companies (
  ticker text primary key,
  name text not null,
  sector text not null,
  sector_de text not null,
  index text not null check (index in ('SP500', 'SMI', 'SMIM')),
  country text,
  currency text,
  market_cap_usd double precision,
  size_class text check (size_class in ('Large', 'Mid', 'Small')),
  is_financial boolean not null default false,
  fiscal_year int,
  as_of date
);

create table if not exists public.financials (
  ticker text references public.companies on delete cascade,
  year int,
  raw jsonb not null,
  primary key (ticker, year)
);

create table if not exists public.kpis (
  ticker text references public.companies on delete cascade,
  year int,
  kpi_id text,
  value double precision,
  ampel text check (ampel in ('green', 'yellow', 'red', 'grey')),
  primary key (ticker, year, kpi_id)
);

-- Branchen-Ampel (docs/BRANCHEN_RICHTWERTE.md); idempotent, auch für bestehende Datenbanken
alter table public.kpis add column if not exists ampel_branche text check (ampel_branche in ('green', 'yellow', 'red', 'grey'));

create table if not exists public.scores (
  ticker text references public.companies on delete cascade,
  year int,
  liquiditaet double precision,
  rentabilitaet double precision,
  sicherheit double precision,
  primary key (ticker, year)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  investor_profile text not null default 'ausgewogen'
    check (investor_profile in ('konservativ', 'ausgewogen', 'renditeorientiert'))
);

create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  client_name text,
  investor_profile text not null default 'ausgewogen'
    check (investor_profile in ('konservativ', 'ausgewogen', 'renditeorientiert')),
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.watchlist_items (
  watchlist_id uuid references public.watchlists on delete cascade,
  ticker text references public.companies on delete cascade,
  added_at timestamptz not null default now(),
  primary key (watchlist_id, ticker)
);

-- Tabellen ausdrücklich freigeben; welche Zeilen sichtbar sind, regelt danach RLS.
grant usage on schema public to anon, authenticated, service_role;
grant select on public.companies, public.financials, public.kpis, public.scores to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.watchlists, public.watchlist_items to authenticated;
grant all on all tables in schema public to service_role;

alter table public.companies enable row level security;
alter table public.financials enable row level security;
alter table public.kpis enable row level security;
alter table public.scores enable row level security;
alter table public.profiles enable row level security;
alter table public.watchlists enable row level security;
alter table public.watchlist_items enable row level security;

drop policy if exists "alle lesen" on public.companies;
create policy "alle lesen" on public.companies for select using (true);
drop policy if exists "alle lesen" on public.financials;
create policy "alle lesen" on public.financials for select using (true);
drop policy if exists "alle lesen" on public.kpis;
create policy "alle lesen" on public.kpis for select using (true);
drop policy if exists "alle lesen" on public.scores;
create policy "alle lesen" on public.scores for select using (true);

drop policy if exists "eigenes Profil" on public.profiles;
create policy "eigenes Profil" on public.profiles for all
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "eigene Watchlists" on public.watchlists;
create policy "eigene Watchlists" on public.watchlists for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Items eigener Watchlists" on public.watchlist_items;
create policy "Items eigener Watchlists" on public.watchlist_items for all
  using (exists (select 1 from public.watchlists w where w.id = watchlist_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.watchlists w where w.id = watchlist_id and w.user_id = auth.uid()));

-- Eigene Anlegerprofile: Gewichte der drei Achsen, zusammen 100 %. Die Vorlagen stehen in config/kpis.json.
create table if not exists public.investor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  liquiditaet double precision not null check (liquiditaet between 0 and 1),
  rentabilitaet double precision not null check (rentabilitaet between 0 and 1),
  sicherheit double precision not null check (sicherheit between 0 and 1),
  created_at timestamptz not null default now(),
  check (abs(liquiditaet + rentabilitaet + sicherheit - 1) < 0.001)
);

grant select, insert, update, delete on public.investor_profiles to authenticated;
grant all on public.investor_profiles to service_role;
alter table public.investor_profiles enable row level security;

drop policy if exists "eigene Anlegerprofile" on public.investor_profiles;
create policy "eigene Anlegerprofile" on public.investor_profiles for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Watchlist mit eigenem Anlegerprofil; leer = es gilt die Vorlage aus investor_profile. is_active wird nicht mehr genutzt.
alter table public.watchlists
  add column if not exists investor_profile_id uuid references public.investor_profiles on delete set null;

-- Beim Registrieren: Profil und erste Watchlist anlegen.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  insert into public.watchlists (user_id, name, is_active)
  values (new.id, 'Meine Favoriten', true);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
