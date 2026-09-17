-- JotMinds Professional V2 - Sprint 4: Measurement
--
-- Signals, scoring, preference/capability separation, cross-validation and
-- confidence, per the spec's own sprint grouping. Deliberately NOT included
-- (Sprint 6 per the doc's phasing): professional_profiles/profile_insights
-- (the structured profile object) and AI interpretation - this sprint stops
-- at "construct/domain evidence exists", not "a profile has been published".
--
-- All scoring here is a baseline heuristic, explicitly not a final
-- psychometric model - the spec itself repeatedly calls every mapping in
-- Part V "provisional pilot hypotheses pending expert review and empirical
-- calibration". Thresholds (evidence counts -> confidence level, etc.) are
-- documented in code comments in scoring-engine.tsx as exactly that: a
-- starting point, not a calibrated model.

CREATE TABLE IF NOT EXISTS public.assessment_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_key text NOT NULL UNIQUE,
  construct_id uuid NOT NULL REFERENCES public.assessment_constructs(id) ON DELETE RESTRICT,
  name text NOT NULL,
  signal_type text NOT NULL CHECK (signal_type IN ('preference', 'capability', 'behavioral', 'meta')),
  description text,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'retired')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- response_condition shape depends on item_type:
--   forced_choice / situational_judgment: {"optionCode": "A"}
--   confidence_slider (identity capture, not a competing signal):
--     {"sliderIdentity": true}
CREATE TABLE IF NOT EXISTS public.item_signal_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.assessment_items(id) ON DELETE CASCADE,
  response_condition jsonb NOT NULL,
  signal_id uuid NOT NULL REFERENCES public.assessment_signals(id) ON DELETE RESTRICT,
  evidence_value numeric NOT NULL DEFAULT 1,
  mapping_version integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.response_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid NOT NULL REFERENCES public.assessment_responses(id) ON DELETE CASCADE,
  signal_id uuid NOT NULL REFERENCES public.assessment_signals(id) ON DELETE RESTRICT,
  evidence_value numeric NOT NULL,
  scoring_version integer NOT NULL DEFAULT 1,
  generated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.construct_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  construct_id uuid NOT NULL REFERENCES public.assessment_constructs(id) ON DELETE RESTRICT,
  construct_type text NOT NULL,
  preference_signal_key text,
  preference_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  capability_level text CHECK (capability_level IN ('insufficient', 'emerging', 'moderate', 'strong')),
  meta_value jsonb,
  evidence_count integer NOT NULL DEFAULT 0,
  supporting_count integer NOT NULL DEFAULT 0,
  contradicting_count integer NOT NULL DEFAULT 0,
  confidence text NOT NULL DEFAULT 'low' CHECK (confidence IN ('low', 'moderate', 'high')),
  scoring_version integer NOT NULL DEFAULT 1,
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, construct_id)
);

CREATE TABLE IF NOT EXISTS public.domain_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  domain_id uuid NOT NULL REFERENCES public.assessment_domains(id) ON DELETE RESTRICT,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence text NOT NULL DEFAULT 'low' CHECK (confidence IN ('low', 'moderate', 'high')),
  scoring_version integer NOT NULL DEFAULT 1,
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, domain_id)
);

CREATE INDEX IF NOT EXISTS idx_item_signal_mappings_item ON public.item_signal_mappings(item_id);
CREATE INDEX IF NOT EXISTS idx_response_signals_response ON public.response_signals(response_id);
CREATE INDEX IF NOT EXISTS idx_construct_results_session ON public.construct_results(session_id);
CREATE INDEX IF NOT EXISTS idx_domain_results_session ON public.domain_results(session_id);

ALTER TABLE public.assessment_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_signal_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construct_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY assessment_signals_service_role_only ON public.assessment_signals FOR ALL USING (false);
CREATE POLICY item_signal_mappings_service_role_only ON public.item_signal_mappings FOR ALL USING (false);
CREATE POLICY response_signals_service_role_only ON public.response_signals FOR ALL USING (false);
CREATE POLICY construct_results_service_role_only ON public.construct_results FOR ALL USING (false);
CREATE POLICY domain_results_service_role_only ON public.domain_results FOR ALL USING (false);
