-- JotMinds Professional V2 - Sprint 3: Evidence Capture
--
-- Behavioural events, timing, changes and information opening, per the
-- spec's own sprint grouping. This is a distinct, finer-grained log from
-- Sprint 2's assessment_responses.change_count (an aggregate) - here every
-- individual viewed/selected/changed/opened/ranked/reallocated interaction
-- gets its own timestamped row, which is what "unusually fast response",
-- "pause frequency" etc. (Part V's uncalculated behavioural signals) would
-- eventually be computed from.
--
-- client_sequence exists because these events are necessarily generated
-- and buffered client-side (a user viewing/hovering/reordering options is
-- not a server round-trip); it lets out-of-order network delivery still be
-- reconstructed in the order they actually happened on the client.

CREATE TABLE IF NOT EXISTS public.behavioural_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  session_item_id uuid REFERENCES public.session_items(id) ON DELETE CASCADE,  -- null for session-level events
  event_type text NOT NULL CHECK (event_type IN ('viewed', 'selected', 'changed', 'opened', 'ranked', 'reallocated', 'simulation_stage')),
  event_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  client_timestamp timestamptz NOT NULL,
  client_sequence integer NOT NULL,
  server_received_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_behavioural_events_session ON public.behavioural_events(session_id);
CREATE INDEX IF NOT EXISTS idx_behavioural_events_session_item ON public.behavioural_events(session_item_id);

ALTER TABLE public.behavioural_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY behavioural_events_service_role_only ON public.behavioural_events FOR ALL USING (false);
