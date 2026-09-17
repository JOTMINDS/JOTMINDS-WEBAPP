-- JotMinds Professional V2 - Sprint 1: Foundation
--
-- Domains, constructs, and a versioned item bank, per the "JotMinds
-- Professional V2" product spec (Part IV - Developer Build Package).
-- This is schema + admin-CRUD only: no session/response/event tables
-- (Sprint 2/3), no signal/scoring engine (Sprint 4), no simulations
-- (Sprint 5). Building those before this foundation exists would mean
-- building against a data model that doesn't exist yet.
--
-- Versioning approach: items and constructs carry (row_id, item_id,
-- version) rather than being mutated in place, so a live assessment can
-- keep referencing a frozen item_id+version while new revisions are
-- authored - this is a hard requirement from the spec's QA section
-- ("Active items require a new version rather than silent overwrite",
-- "New scoring model does not overwrite historical scoring version").

CREATE TABLE IF NOT EXISTS public.assessment_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_key text NOT NULL UNIQUE,            -- e.g. 'decision_making', stable across renames
  name text NOT NULL,
  description text,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assessment_constructs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  construct_key text NOT NULL UNIQUE,          -- e.g. 'risk_orientation', stable across versions
  domain_id uuid NOT NULL REFERENCES public.assessment_domains(id) ON DELETE RESTRICT,
  name text NOT NULL,
  definition text NOT NULL,
  construct_type text NOT NULL CHECK (construct_type IN ('preference', 'capability', 'behavioral', 'meta', 'validation')),
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.professional_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_key text NOT NULL,                -- stable across versions, e.g. 'professional_v2'
  version integer NOT NULL DEFAULT 1,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pilot', 'active', 'suspended', 'retired')),
  min_items integer,
  max_items integer,
  expected_duration_minutes integer,
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assessment_key, version)
);

-- item_key is stable across versions of the same conceptual item (e.g. "AL-001");
-- (item_key, version) is the versioned identity a session/pool references.
CREATE TABLE IF NOT EXISTS public.assessment_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_key text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  item_type text NOT NULL CHECK (item_type IN (
    'forced_choice', 'situational_judgment', 'ranking', 'multi_select',
    'confidence_slider', 'timed_task', 'open_response', 'information_selection',
    'resource_allocation', 'simulation'
  )),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'pilot', 'active', 'suspended', 'retired')),
  prompt_text text NOT NULL,
  construct_ids uuid[] NOT NULL DEFAULT '{}',
  validation_group text,                       -- links cross-validation pairs, e.g. 'AL-01'
  evidence_type text CHECK (evidence_type IN ('preference', 'capability', 'behavioral', 'meta', 'validation')),
  time_limit_seconds integer,
  manipulation_risk text CHECK (manipulation_risk IN ('low', 'medium', 'high')),
  ai_answerability_risk text CHECK (ai_answerability_risk IN ('low', 'medium', 'high')),
  randomization_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,    -- item-type-specific config (task data, rubric, etc.)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE (item_key, version)
);

CREATE TABLE IF NOT EXISTS public.assessment_item_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.assessment_items(id) ON DELETE CASCADE,
  option_code text NOT NULL,                   -- e.g. 'A', 'B' - stable within the item
  text text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, option_code)
);

-- Which items belong to which assessment version, and how.
CREATE TABLE IF NOT EXISTS public.assessment_item_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.professional_assessments(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.assessment_items(id) ON DELETE CASCADE,
  required boolean NOT NULL DEFAULT true,
  weight numeric NOT NULL DEFAULT 1,
  position_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_constructs_domain ON public.assessment_constructs(domain_id);
CREATE INDEX IF NOT EXISTS idx_assessment_items_key ON public.assessment_items(item_key);
CREATE INDEX IF NOT EXISTS idx_assessment_items_status ON public.assessment_items(status);
CREATE INDEX IF NOT EXISTS idx_assessment_item_options_item ON public.assessment_item_options(item_id);
CREATE INDEX IF NOT EXISTS idx_assessment_item_pools_assessment ON public.assessment_item_pools(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_item_pools_item ON public.assessment_item_pools(item_id);

-- All five tables are service-role-only, same posture as kv_store and
-- platform_admins: item content (correct-weighted options, construct
-- mappings, scoring hints) must never be readable directly by an
-- authenticated client, since that would leak exactly what the spec calls
-- "hidden construct labels" and defeat manipulation-resistance. Every read
-- (delivery to a test-taker, or the future Admin Studio) goes through an
-- edge function that filters what's exposed.
ALTER TABLE public.assessment_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_constructs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_item_pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY assessment_domains_service_role_only ON public.assessment_domains FOR ALL USING (false);
CREATE POLICY assessment_constructs_service_role_only ON public.assessment_constructs FOR ALL USING (false);
CREATE POLICY professional_assessments_service_role_only ON public.professional_assessments FOR ALL USING (false);
CREATE POLICY assessment_items_service_role_only ON public.assessment_items FOR ALL USING (false);
CREATE POLICY assessment_item_options_service_role_only ON public.assessment_item_options FOR ALL USING (false);
CREATE POLICY assessment_item_pools_service_role_only ON public.assessment_item_pools FOR ALL USING (false);
