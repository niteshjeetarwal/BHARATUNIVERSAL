create table if not exists sites (
  slug text primary key,
  name text not null,
  tagline text not null default '',
  accent_color text not null default '#0f766e',
  footer_text text not null default '',
  sections jsonb not null default '[]'::jsonb,
  articles jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table if exists sites
  add column if not exists footer_text text default '',
  add column if not exists sections jsonb default '[]'::jsonb;

alter table sites enable row level security;

drop policy if exists "Public read sites" on sites;
create policy "Public read sites"
  on sites for select
  using (true);

drop policy if exists "Anon upsert sites" on sites;
create policy "Anon upsert sites"
  on sites for insert
  with check (true);

drop policy if exists "Anon update sites" on sites;
create policy "Anon update sites"
  on sites for update
  using (true)
  with check (true);
