-- response_signals only referenced assessment_responses; simulation stage
-- responses need the same audit trail. Same nullable + XOR pattern as
-- item_signal_mappings' item_id/stage_id fix.
ALTER TABLE public.response_signals ALTER COLUMN response_id DROP NOT NULL;
ALTER TABLE public.response_signals ADD COLUMN IF NOT EXISTS stage_response_id uuid REFERENCES public.simulation_stage_responses(id) ON DELETE CASCADE;
ALTER TABLE public.response_signals ADD CONSTRAINT response_signals_target_check
  CHECK ((response_id IS NOT NULL) <> (stage_response_id IS NOT NULL));
CREATE INDEX IF NOT EXISTS idx_response_signals_stage_response ON public.response_signals(stage_response_id);
