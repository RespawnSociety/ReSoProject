-- FlowBoard – shared team workspace schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query)

-- ── PROFILES (auto-created on signup) ───────────────────────────────────────

create table if not exists public.profiles (
  id         uuid        references auth.users on delete cascade primary key,
  name       text,
  email      text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_readable" on public.profiles;
create policy "profiles_readable" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── PROJECTS ────────────────────────────────────────────────────────────────

create table if not exists public.projects (
  id          text        primary key,
  name        text        not null,
  key         text        not null,
  description text        default '',
  color       text        default '#6366F1',
  emoji       text        default '🚀',
  columns     text[]      default array['backlog','todo','inprogress','review','done']::text[],
  created_at  timestamptz default now()
);

-- ── TASKS ────────────────────────────────────────────────────────────────────

create table if not exists public.tasks (
  id          text        primary key,
  project_id  text        references public.projects(id) on delete cascade not null,
  column_id   text        not null,
  title       text        not null,
  description text        default '',
  priority    text        default 'medium' check (priority in ('urgent','high','medium','low')),
  labels      text[]      default '{}'::text[],
  assignee_id uuid        references public.profiles(id) on delete set null,
  start_date  date,
  due_date    date,
  position    integer     default 0,
  created_at  timestamptz default now()
);

create index if not exists tasks_project_id_idx      on public.tasks(project_id);
create index if not exists tasks_column_position_idx on public.tasks(column_id, position);
create index if not exists tasks_assignee_idx        on public.tasks(assignee_id);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

alter table public.projects enable row level security;
alter table public.tasks     enable row level security;

drop policy if exists "team_projects" on public.projects;
create policy "team_projects" on public.projects
  for all to authenticated using (true) with check (true);

drop policy if exists "team_tasks" on public.tasks;
create policy "team_tasks" on public.tasks
  for all to authenticated using (true) with check (true);

-- ── REALTIME ─────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.profiles;
