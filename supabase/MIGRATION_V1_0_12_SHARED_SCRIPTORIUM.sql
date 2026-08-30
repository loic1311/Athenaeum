-- Athenaeum V1.0.12 — shared Scriptorium metadata catalog
-- ALREADY APPLIED to the linked Supabase project.
create table if not exists public.athenaeum_scriptorium_shared_catalog (
  owner_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  owner_label text not null default 'Athenaeum-gebruiker',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, item_id)
);
alter table public.athenaeum_scriptorium_shared_catalog enable row level security;
create policy "shared catalog read authenticated" on public.athenaeum_scriptorium_shared_catalog
for select to authenticated using (true);
create policy "shared catalog insert own" on public.athenaeum_scriptorium_shared_catalog
for insert to authenticated with check (auth.uid()=owner_id);
create policy "shared catalog update own" on public.athenaeum_scriptorium_shared_catalog
for update to authenticated using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy "shared catalog delete own" on public.athenaeum_scriptorium_shared_catalog
for delete to authenticated using (auth.uid()=owner_id);
grant select,insert,update,delete on public.athenaeum_scriptorium_shared_catalog to authenticated;
