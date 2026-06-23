-- Add co_admin_ids array to institutions
ALTER TABLE public.institutions
  ADD COLUMN co_admin_ids uuid[] NOT NULL DEFAULT '{}';

-- Update institution_invitations CHECK to allow 'admin' role invites
ALTER TABLE public.institution_invitations
  DROP CONSTRAINT IF EXISTS institution_invitations_role_check;
ALTER TABLE public.institution_invitations
  ADD CONSTRAINT institution_invitations_role_check
  CHECK (role IN ('admin', 'teacher', 'student'));

-- Helper: is the current user an admin (primary or co-) of this institution?
CREATE OR REPLACE FUNCTION public.is_institution_admin(inst_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.institutions
    WHERE id = inst_id
      AND (admin_id = auth.uid() OR auth.uid() = ANY(co_admin_ids))
  );
$$;

-- Drop and recreate RLS policies to include co-admins

-- institutions: primary admin can manage all, co-admins can select
DROP POLICY IF EXISTS institutions_admin_all ON public.institutions;
CREATE POLICY institutions_primary_admin_all ON public.institutions
  FOR ALL USING (admin_id = auth.uid());

CREATE POLICY institutions_coadmin_select ON public.institutions
  FOR SELECT USING (auth.uid() = ANY(co_admin_ids));

-- institution_members: primary and co-admins can view and manage all members
DROP POLICY IF EXISTS members_admin_all ON public.institution_members;
CREATE POLICY members_admin_all ON public.institution_members
  FOR ALL USING (
    public.is_institution_admin(institution_id)
  );

-- institution_invitations: primary and co-admins can view and manage invitations
DROP POLICY IF EXISTS invitations_admin_all ON public.institution_invitations;
CREATE POLICY invitations_admin_all ON public.institution_invitations
  FOR ALL USING (
    public.is_institution_admin(institution_id)
  );
