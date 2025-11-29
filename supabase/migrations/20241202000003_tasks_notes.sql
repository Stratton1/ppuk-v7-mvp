-- Tasks and Notes tables + RPCs + policies

create table public.property_tasks (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  assigned_to_user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open','in_progress','awaiting_docs','resolved','cancelled')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.property_notes (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content text not null,
  note_type text not null default 'general' check (note_type in ('general','inspection','maintenance','legal','system')),
  is_private boolean not null default false,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.property_tasks enable row level security;
alter table public.property_notes enable row level security;

-- Policies for tasks
-- Select: any user with role on property
drop policy if exists select_property_tasks on public.property_tasks;
create policy select_property_tasks on public.property_tasks
  for select using (
    public.has_property_role(property_id, array['owner','admin','agent','surveyor','conveyancer','buyer','tenant','viewer'])
  );

-- Insert: owner/admin/agent/surveyor/conveyancer
drop policy if exists insert_property_tasks on public.property_tasks;
create policy insert_property_tasks on public.property_tasks
  for insert with check (
    public.has_property_role(property_id, array['owner','admin','agent','surveyor','conveyancer'])
  );

-- Update/Delete: same as insert
drop policy if exists update_property_tasks on public.property_tasks;
create policy update_property_tasks on public.property_tasks
  for update using (
    public.has_property_role(property_id, array['owner','admin','agent','surveyor','conveyancer'])
  );
drop policy if exists delete_property_tasks on public.property_tasks;
create policy delete_property_tasks on public.property_tasks
  for delete using (
    public.has_property_role(property_id, array['owner','admin','agent','surveyor','conveyancer'])
  );

-- Policies for notes
-- Select: if role on property AND (note is not private OR user has elevated role)
drop policy if exists select_property_notes on public.property_notes;
create policy select_property_notes on public.property_notes
  for select using (
    public.has_property_role(property_id, array['owner','admin','agent','surveyor','conveyancer','buyer','tenant','viewer'])
    and (
      is_private = false
      or public.has_property_role(property_id, array['owner','admin','agent','surveyor','conveyancer'])
    )
  );

-- Insert: owner/admin/agent/surveyor/conveyancer
drop policy if exists insert_property_notes on public.property_notes;
create policy insert_property_notes on public.property_notes
  for insert with check (
    public.has_property_role(property_id, array['owner','admin','agent','surveyor','conveyancer'])
  );

-- Update/Delete: same elevated roles
drop policy if exists update_property_notes on public.property_notes;
create policy update_property_notes on public.property_notes
  for update using (
    public.has_property_role(property_id, array['owner','admin','agent','surveyor','conveyancer'])
  );
drop policy if exists delete_property_notes on public.property_notes;
create policy delete_property_notes on public.property_notes
  for delete using (
    public.has_property_role(property_id, array['owner','admin','agent','surveyor','conveyancer'])
  );

-- RPCs
create or replace function public.get_property_tasks(property_id uuid)
returns setof public.property_tasks
language sql
stable
security definer
as $$
  select * from public.property_tasks where property_id = get_property_tasks.property_id;
$$;
grant execute on function public.get_property_tasks(uuid) to authenticated;

create or replace function public.get_property_notes(property_id uuid)
returns setof public.property_notes
language sql
stable
security definer
as $$
  select * from public.property_notes where property_id = get_property_notes.property_id order by pinned desc, created_at desc;
$$;
grant execute on function public.get_property_notes(uuid) to authenticated;

-- updated_at trigger for tasks
create or replace function public.set_updated_at_generic()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_property_tasks on public.property_tasks;
create trigger set_updated_at_property_tasks
before update on public.property_tasks
for each row execute procedure public.set_updated_at_generic();
