-- A signal mapping applies to either a whole item OR a simulation stage,
-- never neither/both. item_id was left NOT NULL when stage_id was added in
-- the previous migration - fixing that here rather than amending it, since
-- it's already applied to the linked project.
ALTER TABLE public.item_signal_mappings ALTER COLUMN item_id DROP NOT NULL;
ALTER TABLE public.item_signal_mappings ADD CONSTRAINT item_signal_mappings_target_check
  CHECK ((item_id IS NOT NULL) <> (stage_id IS NOT NULL));
