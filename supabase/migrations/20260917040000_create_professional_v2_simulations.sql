-- JotMinds Professional V2 - Sprint 5: Micro-Simulations
--
-- Generic multi-stage simulation infrastructure. A simulation is still one
-- assessment_items row (item_type='simulation') and therefore still one
-- session_item in Sprint 2's top-level session flow - "item N of the
-- total items" - but internally it has its own stage sequence with
-- optional branching, tracked separately so stage-level state survives a
-- pause/resume ("simulation-state preservation" - spec Connectivity &
-- Recovery epic).
--
-- Branching: simulation_stage_options.next_stage_key overrides the default
-- (stage_order-based) next stage when set. This is how "new information"
-- causing a scenario to diverge (spec UI screens 16-18) is implemented -
-- not a different question, but potentially a different next stage
-- depending on the choice made.

CREATE TABLE IF NOT EXISTS public.simulation_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.assessment_items(id) ON DELETE CASCADE,
  stage_key text NOT NULL,
  stage_order integer NOT NULL,
  stage_type text NOT NULL CHECK (stage_type IN (
    'forced_choice', 'situational_judgment', 'ranking', 'multi_select',
    'confidence_slider', 'timed_task', 'open_response', 'information_selection',
    'resource_allocation'
  )),
  prompt_text text NOT NULL,
  construct_ids uuid[] NOT NULL DEFAULT '{}',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, stage_key)
);

CREATE TABLE IF NOT EXISTS public.simulation_stage_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id uuid NOT NULL REFERENCES public.simulation_stages(id) ON DELETE CASCADE,
  option_code text NOT NULL,
  text text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  next_stage_key text,  -- overrides default stage_order progression when this option is chosen
  UNIQUE (stage_id, option_code)
);

-- One row per simulation instance within a session (i.e. per session_item
-- whose item is a simulation), tracking which stage the user is currently on.
CREATE TABLE IF NOT EXISTS public.session_simulation_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_item_id uuid NOT NULL UNIQUE REFERENCES public.session_items(id) ON DELETE CASCADE,
  current_stage_id uuid REFERENCES public.simulation_stages(id),
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.simulation_stage_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_item_id uuid NOT NULL REFERENCES public.session_items(id) ON DELETE CASCADE,
  stage_id uuid NOT NULL REFERENCES public.simulation_stages(id) ON DELETE CASCADE,
  response jsonb NOT NULL,
  response_time_ms integer,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_item_id, stage_id)
);

-- Signal mappings can now optionally target a specific stage rather than a
-- whole item. Nullable, so Sprint 4's item-level mappings are unaffected.
ALTER TABLE public.item_signal_mappings ADD COLUMN IF NOT EXISTS stage_id uuid REFERENCES public.simulation_stages(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_simulation_stages_item ON public.simulation_stages(item_id);
CREATE INDEX IF NOT EXISTS idx_simulation_stage_options_stage ON public.simulation_stage_options(stage_id);
CREATE INDEX IF NOT EXISTS idx_simulation_stage_responses_session_item ON public.simulation_stage_responses(session_item_id);
CREATE INDEX IF NOT EXISTS idx_item_signal_mappings_stage ON public.item_signal_mappings(stage_id);

ALTER TABLE public.simulation_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_stage_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_simulation_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_stage_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY simulation_stages_service_role_only ON public.simulation_stages FOR ALL USING (false);
CREATE POLICY simulation_stage_options_service_role_only ON public.simulation_stage_options FOR ALL USING (false);
CREATE POLICY session_simulation_state_service_role_only ON public.session_simulation_state FOR ALL USING (false);
CREATE POLICY simulation_stage_responses_service_role_only ON public.simulation_stage_responses FOR ALL USING (false);
