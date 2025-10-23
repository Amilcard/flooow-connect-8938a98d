-- Fonction d'insertion profil (mise à jour pour cohérence)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, profile_json, created_at, updated_at)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data, '{}'::jsonb),
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger sur création d'utilisateur
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS policies pour profiles (ajout INSERT)
drop policy if exists "profiles_insert_owner" on public.profiles;
create policy "profiles_insert_owner"
  on public.profiles 
  for insert
  with check (auth.uid() = id);