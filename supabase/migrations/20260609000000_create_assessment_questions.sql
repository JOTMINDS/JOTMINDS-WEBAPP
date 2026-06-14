-- Assessment Questions Table
-- Unified store for all JotMinds question banks
-- Supports: Kolb, Sternberg, Dual-Process, VARK frameworks
-- Age groups: general (11-14), teen (15-18), tertiary (15-25), organizational, kids (6-10)

create table if not exists assessment_questions (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  assessment_type text not null check (assessment_type in ('learning', 'thinking', 'decision')),
  framework text not null,
  age_group text not null default 'general',
  dimension text not null,
  question_text text not null,
  question_format text not null default 'likert' check (question_format in ('likert', 'multiple-choice')),
  options jsonb default null,
  points integer default 1,
  display_order integer,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for common query patterns
create index if not exists idx_aq_assessment_type on assessment_questions (assessment_type);
create index if not exists idx_aq_age_group on assessment_questions (age_group);
create index if not exists idx_aq_framework on assessment_questions (framework);
create index if not exists idx_aq_dimension on assessment_questions (dimension);
create index if not exists idx_aq_is_active on assessment_questions (is_active);
create index if not exists idx_aq_composite on assessment_questions (assessment_type, age_group, framework, is_active);

-- Row Level Security
alter table assessment_questions enable row level security;

-- Anyone (including anon) can read active questions
create policy "questions_read_active"
  on assessment_questions for select
  using (is_active = true);

-- Only service_role can insert/update/delete (used by seed script)
create policy "questions_service_write"
  on assessment_questions for all
  using (auth.role() = 'service_role');

-- Updated_at trigger
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger assessment_questions_updated_at
  before update on assessment_questions
  for each row execute procedure update_updated_at_column();

-- Summary view for admin
create or replace view assessment_questions_summary as
  select
    assessment_type,
    framework,
    age_group,
    dimension,
    question_format,
    count(*) as question_count,
    count(*) filter (where is_active) as active_count
  from assessment_questions
  group by assessment_type, framework, age_group, dimension, question_format
  order by assessment_type, framework, age_group, dimension;
