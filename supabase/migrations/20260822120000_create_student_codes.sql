-- Student Codes Table
-- Enables teacher-driven student enrollment and code-based authentication.
-- Each enrolled student gets a unique code (e.g. JM-7K42-XP91) that serves as
-- their login credential instead of email/password.

CREATE TABLE IF NOT EXISTS public.student_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_dob TEXT,
  teacher_id TEXT NOT NULL,
  class_id TEXT REFERENCES public.classes(id) ON DELETE SET NULL,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_sc_code ON public.student_codes (code);
CREATE INDEX IF NOT EXISTS idx_sc_user_id ON public.student_codes (user_id);
CREATE INDEX IF NOT EXISTS idx_sc_teacher_id ON public.student_codes (teacher_id);
CREATE INDEX IF NOT EXISTS idx_sc_institution_id ON public.student_codes (institution_id);
CREATE INDEX IF NOT EXISTS idx_sc_class_id ON public.student_codes (class_id);
CREATE INDEX IF NOT EXISTS idx_sc_active ON public.student_codes (is_active) WHERE is_active = TRUE;

-- Composite index for duplicate detection
CREATE INDEX IF NOT EXISTS idx_sc_duplicate_check
  ON public.student_codes (student_name, student_dob, institution_id)
  WHERE is_active = TRUE;

-- Row Level Security
ALTER TABLE public.student_codes ENABLE ROW LEVEL SECURITY;

-- Teachers can see codes they created
CREATE POLICY "teachers_read_own_codes" ON public.student_codes
  FOR SELECT USING (teacher_id = auth.uid()::text);

-- Teachers can insert codes (for enrollment)
CREATE POLICY "teachers_insert_codes" ON public.student_codes
  FOR INSERT WITH CHECK (teacher_id = auth.uid()::text);

-- Institution admins can see all codes in their institution
CREATE POLICY "admin_read_institution_codes" ON public.student_codes
  FOR SELECT USING (
    public.is_institution_admin(institution_id)
  );

-- Service role can do everything (Edge Functions use service role)
CREATE POLICY "service_all_codes" ON public.student_codes
  FOR ALL USING (auth.role() = 'service_role');

-- Anyone can look up an active code for sign-in validation (read-only, limited columns via Edge Function)
CREATE POLICY "public_validate_code" ON public.student_codes
  FOR SELECT USING (is_active = TRUE AND revoked_at IS NULL);
