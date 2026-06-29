-- Create role_profiles table for Cognitive Role Fit System
-- Note: org_id is a free-form text identifier (not a FK to institutions) so the
-- same table can back both educational institutions and corporate organizations.
-- Access is enforced at the edge-function layer (service role), so RLS is permissive.
create table if not exists public.role_profiles (
  id uuid primary key default gen_random_uuid(),
  org_id text,
  created_by uuid references auth.users(id),
  title text not null,
  description text,
  cognitive_demands jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.role_profiles enable row level security;

-- Permissive policy: authorization handled by the edge function (service role)
create policy "role_profiles_all" on public.role_profiles for all
  using (true);

-- Create cognitive_role_fit_scores table to cache candidate match scores
create table if not exists public.cognitive_role_fit_scores (
  id uuid primary key default gen_random_uuid(),
  role_id uuid references public.role_profiles(id) on delete cascade,
  candidate_id uuid references auth.users(id) on delete cascade,
  fit_score integer not null,
  fit_category text not null,
  risk_flags jsonb default '[]'::jsonb,
  gap_map jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  unique (role_id, candidate_id)
);

-- Enable RLS
alter table public.cognitive_role_fit_scores enable row level security;

-- Permissive policy: authorization handled by the edge function (service role)
create policy "fit_scores_all" on public.cognitive_role_fit_scores for all
  using (true);
