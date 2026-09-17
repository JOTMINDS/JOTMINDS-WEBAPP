-- JotMinds Professional V2 - Sprint 6: Intelligence
--
-- Structured profile, AI interpretation, blind spots and development
-- priorities, per the spec's own sprint grouping. Deliberately NOT
-- included: the Professional Result Experience dashboard UI (screens
-- 26-34) - like every prior sprint, this is backend/data-model only.
--
-- The core property this table pair exists to enforce: a structured
-- profile exists independently of AI narrative ("Professional Profile
-- Engine" epic). structured_summary is assembled entirely from
-- construct_results/domain_results (Sprint 4 output) with zero AI
-- involvement, and remains valid/queryable even if AI interpretation
-- never runs or fails ("AI outage does not destroy scoring/profile
-- availability" - spec QA Critical Tests). profile_insights holds only
-- the AI-generated narrative layered on top, kept in a separate table so
-- the two can never be confused.

CREATE TABLE IF NOT EXISTS public.professional_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_version integer NOT NULL DEFAULT 1,
  scoring_version integer NOT NULL,
  interpretation_version integer,
  overall_confidence text NOT NULL CHECK (overall_confidence IN ('low', 'moderate', 'high')),
  status text NOT NULL DEFAULT 'structured' CHECK (status IN ('structured', 'interpreting', 'interpreted', 'interpretation_failed')),
  structured_summary jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profile_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('domain_narrative', 'blind_spot', 'development_priority')),
  domain_id uuid REFERENCES public.assessment_domains(id),
  construct_ids uuid[] NOT NULL DEFAULT '{}',
  structured_evidence jsonb NOT NULL DEFAULT '{}'::jsonb,  -- the exact evidence this insight is grounded in, for auditability
  generated_text text NOT NULL,
  interpretation_version integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_professional_profiles_user ON public.professional_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_insights_profile ON public.profile_insights(profile_id);

ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY professional_profiles_service_role_only ON public.professional_profiles FOR ALL USING (false);
CREATE POLICY profile_insights_service_role_only ON public.profile_insights FOR ALL USING (false);
