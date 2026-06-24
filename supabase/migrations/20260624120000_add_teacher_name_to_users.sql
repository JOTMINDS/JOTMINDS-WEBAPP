-- Add teacher_name column to public.users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS teacher_name text;
