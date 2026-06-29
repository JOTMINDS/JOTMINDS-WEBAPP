-- Create role_profiles table for Cognitive Role Fit System
create table if not exists public.role_profiles (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions(id) on delete cascade,
  title text not null,
  description text,
  cognitive_demands jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.role_profiles enable row level security;

-- Policies
create policy "role_profiles_read_all" on public.role_profiles for select
  using (
    exists (
      select 1 from public.institution_members
      where institution_id = role_profiles.institution_id and user_id = auth.uid()
    )
    or
    public.is_institution_admin(role_profiles.institution_id)
  );

create policy "role_profiles_admin_all" on public.role_profiles for all
  using (
    public.is_institution_admin(institution_id)
  );

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

-- Policies for fit scores
create policy "fit_scores_read_admin" on public.cognitive_role_fit_scores for select
  using (
    exists (
      select 1 from public.role_profiles rp
      where rp.id = role_id and public.is_institution_admin(rp.institution_id)
    )
  );

create policy "fit_scores_read_candidate" on public.cognitive_role_fit_scores for select
  using (candidate_id = auth.uid());

create policy "fit_scores_write_admin" on public.cognitive_role_fit_scores for all
  using (
    exists (
      select 1 from public.role_profiles rp
      where rp.id = role_id and public.is_institution_admin(rp.institution_id)
    )
  );
