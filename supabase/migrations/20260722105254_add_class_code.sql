-- Add class_code to public.classes

alter table public.classes add column if not exists class_code text;

-- Add a unique constraint if we want, but since they are per-institution maybe it's fine without it for now.
-- Or we can add it to ensure global uniqueness since codes are typically used for joining across the platform.
alter table public.classes add constraint classes_class_code_key unique (class_code);
