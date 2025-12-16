-- Create projects table
create table public.projects (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text not null,
  description text null,
  user_id uuid not null references auth.users (id) on delete cascade,
  constraint projects_pkey primary key (id)
);

-- Add project_id to user_files table
alter table public.user_files
add column project_id uuid null references public.projects (id) on delete set null;

-- Enable RLS for projects
alter table public.projects enable row level security;

-- Policies for projects
create policy "Users can view their own projects" on public.projects
  for select using (auth.uid() = user_id);

create policy "Users can create their own projects" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own projects" on public.projects
  for update using (auth.uid() = user_id);

create policy "Users can delete their own projects" on public.projects
  for delete using (auth.uid() = user_id);

-- Update user_files policies if necessary to allow updating project_id
-- (Assuming existing policies on user_files allow update for owner)
