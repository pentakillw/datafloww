alter table public.profiles
add column if not exists full_name text,
add column if not exists avatar_url text;

-- Policy to allow users to update their own profile
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);
