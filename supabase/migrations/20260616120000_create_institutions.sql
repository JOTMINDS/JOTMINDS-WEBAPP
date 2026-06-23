-- Create institutions table
create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  address text,
  region text,
  district text,
  email text,
  phone text,
  website text,
  logo text,
  tagline text,
  teacher_size text,
  student_size text,
  admin_id uuid references auth.users(id) on delete cascade,
  admin_name text,
  admin_email text,
  admin_phone text,
  code text unique not null,
  code_generated_at timestamptz default now() not null,
  code_expiry_days integer,
  is_active boolean default true not null,
  email_verified boolean default false not null,
  phone_verified boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create institution_members table
create table if not exists public.institution_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  user_name text not null,
  user_email text not null,
  user_phone text,
  role text not null check (role in ('admin', 'teacher', 'student')),
  institution_id uuid references public.institutions(id) on delete cascade,
  joined_at timestamptz default now() not null,
  joined_via_code text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  unique (user_id, institution_id)
);

-- Create institution_invitations table
create table if not exists public.institution_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  institution_id uuid references public.institutions(id) on delete cascade,
  role text not null check (role in ('teacher', 'student')),
  invited_at timestamptz default now() not null,
  token text unique not null,
  expires_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked'))
);

-- Enable RLS
alter table public.institutions enable row level security;
alter table public.institution_members enable row level security;
alter table public.institution_invitations enable row level security;

-- Policies for institutions:
-- 1. Anyone can select an institution to validate a code (or signup)
create policy "institutions_read_all" on public.institutions for select using (true);
-- 2. Only the admin can modify their own institution record
create policy "institutions_admin_all" on public.institutions for all using (admin_id = auth.uid());

-- Policies for institution_members:
-- 1. Users can view their own membership
create policy "members_read_own" on public.institution_members for select using (user_id = auth.uid());
-- 2. Admins can view/modify all members in their institution
create policy "members_admin_all" on public.institution_members for all
  using (exists (
    select 1 from public.institutions
    where id = institution_members.institution_id and admin_id = auth.uid()
  ));

-- Policies for institution_invitations:
-- 1. Users can select an invitation matching their email (during registration)
create policy "invitations_read_matching" on public.institution_invitations for select using (email = auth.email());
-- 2. Admins can manage all invitations in their institution
create policy "invitations_admin_all" on public.institution_invitations for all
  using (exists (
    select 1 from public.institutions
    where id = institution_invitations.institution_id and admin_id = auth.uid()
  ));
