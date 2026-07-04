DROP POLICY IF EXISTS "role_profiles_read_all" ON public.role_profiles;
DROP POLICY IF EXISTS "role_profiles_admin_all" ON public.role_profiles;
DROP POLICY IF EXISTS "fit_scores_read_admin" ON public.cognitive_role_fit_scores;
DROP POLICY IF EXISTS "fit_scores_read_candidate" ON public.cognitive_role_fit_scores;
DROP POLICY IF EXISTS "fit_scores_write_admin" ON public.cognitive_role_fit_scores;

ALTER TABLE public.role_profiles DROP CONSTRAINT IF EXISTS role_profiles_institution_id_fkey;
ALTER TABLE public.role_profiles ALTER COLUMN institution_id TYPE text;
ALTER TABLE public.role_profiles RENAME COLUMN institution_id TO org_id;
ALTER TABLE public.role_profiles ADD COLUMN IF NOT EXISTS created_by uuid references auth.users(id);

CREATE POLICY "role_profiles_all" ON public.role_profiles FOR ALL USING (true);
CREATE POLICY "fit_scores_all" ON public.cognitive_role_fit_scores FOR ALL USING (true);
