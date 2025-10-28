-- Ensure extensions required
create extension if not exists pgcrypto;

-- 1) search_logs table
create table if not exists public.search_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid null,
  search_query text null,
  filters_applied jsonb null default '{}'::jsonb,
  results_count integer null,
  session_id text null
);

-- Enable RLS
alter table public.search_logs enable row level security;

-- Policies (create only if missing)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='search_logs' AND policyname='Admins can view all searches'
  ) THEN
    CREATE POLICY "Admins can view all searches"
    ON public.search_logs FOR SELECT
    USING (
      public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'territory_admin')
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='search_logs' AND policyname='Users can insert their own searches'
  ) THEN
    CREATE POLICY "Users can insert their own searches"
    ON public.search_logs FOR INSERT
    WITH CHECK ((auth.uid() = user_id) OR (auth.uid() IS NULL));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='search_logs' AND policyname='Users can view their own searches'
  ) THEN
    CREATE POLICY "Users can view their own searches"
    ON public.search_logs FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Indexes
create index if not exists idx_search_logs_user_id on public.search_logs(user_id);
create index if not exists idx_search_logs_created_at on public.search_logs(created_at);


-- 2) activity_views table
create table if not exists public.activity_views (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  activity_id uuid null,
  user_id uuid null,
  source text null,
  session_id text null,
  view_duration_seconds integer null
);

-- Enable RLS
alter table public.activity_views enable row level security;

-- Policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='activity_views' AND policyname='Admins can view all activity views'
  ) THEN
    CREATE POLICY "Admins can view all activity views"
    ON public.activity_views FOR SELECT
    USING (
      public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'territory_admin')
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='activity_views' AND policyname='Structures can view views for their activities'
  ) THEN
    CREATE POLICY "Structures can view views for their activities"
    ON public.activity_views FOR SELECT
    USING (
      public.has_role(auth.uid(), 'structure') AND EXISTS (
        SELECT 1
        FROM public.activities a
        JOIN public.structures s ON a.structure_id = s.id
        WHERE a.id = activity_views.activity_id
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='activity_views' AND policyname='Users can insert their own activity views'
  ) THEN
    CREATE POLICY "Users can insert their own activity views"
    ON public.activity_views FOR INSERT
    WITH CHECK ((auth.uid() = user_id) OR (auth.uid() IS NULL));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='activity_views' AND policyname='Users can view their own activity views'
  ) THEN
    CREATE POLICY "Users can view their own activity views"
    ON public.activity_views FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Indexes
create index if not exists idx_activity_views_activity_id on public.activity_views(activity_id);
create index if not exists idx_activity_views_user_id on public.activity_views(user_id);
create index if not exists idx_activity_views_created_at on public.activity_views(created_at);


-- 3) Ensure booking columns exist (idempotent)
alter table public.bookings
  add column if not exists participation_confirmed boolean,
  add column if not exists participation_confirmed_at timestamptz,
  add column if not exists participation_confirmed_by uuid;

-- Helpful index for participation status
create index if not exists idx_bookings_participation on public.bookings(participation_confirmed, participation_confirmed_at);
