-- JotMinds Professional V2 - Sprint 2: Assessment Delivery
--
-- Sessions, core interaction types, and resume, per the product spec's own
-- sprint grouping ("2. Assessment Delivery - Sessions, core interaction
-- types and resume"). Deliberately NOT included here:
-- - behavioural_events (Sprint 3 - "Behavioural events, timing, changes and
--   information opening" is a distinct, finer-grained instrumentation
--   layer than basic response capture).
-- - Anything under Measurement/Simulations/Intelligence (Sprint 4-6).
--
-- Session item order and per-session option order are materialized in full
-- at session creation time ("controlled item and option randomisation with
-- exact presentation order retained" - spec Randomisation epic), not
-- regenerated on each request.

CREATE TABLE IF NOT EXISTS public.assessment_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.professional_assessments(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'paused', 'completed', 'abandoned')),
  current_position integer NOT NULL DEFAULT 0,
  total_items integer NOT NULL,
  scoring_version integer,             -- reserved for Sprint 4 - not populated yet
  device_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  paused_at timestamptz,
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.session_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.assessment_items(id) ON DELETE RESTRICT,
  presentation_order integer NOT NULL,
  option_order jsonb NOT NULL DEFAULT '[]'::jsonb,  -- array of option ids in this session's display order
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'served', 'completed', 'skipped')),
  served_at timestamptz,
  completed_at timestamptz,
  UNIQUE (session_id, presentation_order),
  UNIQUE (session_id, item_id)
);

CREATE TABLE IF NOT EXISTS public.assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  session_item_id uuid NOT NULL REFERENCES public.session_items(id) ON DELETE CASCADE,
  initial_response jsonb NOT NULL,
  final_response jsonb NOT NULL,
  change_count integer NOT NULL DEFAULT 0,
  response_time_ms integer,
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_item_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_sessions_user ON public.assessment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_items_session ON public.session_items(session_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_session ON public.assessment_responses(session_id);

-- Service-role-only, same posture as the item bank tables: a test-taker must
-- never be able to read another user's session, or read session_items
-- directly (which would expose true item/construct linkage bypassing the
-- edge function's field filtering). All access goes through
-- assessment-session-routes.tsx, which checks session.user_id against the
-- authenticated caller.
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY assessment_sessions_service_role_only ON public.assessment_sessions FOR ALL USING (false);
CREATE POLICY session_items_service_role_only ON public.session_items FOR ALL USING (false);
CREATE POLICY assessment_responses_service_role_only ON public.assessment_responses FOR ALL USING (false);
