-- Durable platform-admin allowlist, replacing app_metadata.role as the source
-- of truth for the "is this user a platform (super) admin" check.
--
-- app_metadata was chosen initially because it's only writable via the Admin
-- API (service role) - a client can never set it on themselves, unlike
-- user_metadata. But in practice, Supabase Auth's own sign-in/session-refresh
-- lifecycle recomputes app_metadata.provider/providers and appears to replace
-- the whole app_metadata object when it does, silently dropping any custom
-- fields (like role) that aren't part of what GoTrue itself tracks. A table
-- that only this application's own code ever writes to is not subject to
-- that lifecycle and is the correct durable mechanism.

CREATE TABLE IF NOT EXISTS public.platform_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- Only accessible via the service role (server-side endpoints) - no direct
-- client access, matching how every other admin-gated endpoint in this app works.
CREATE POLICY platform_admins_service_role_only ON public.platform_admins
  FOR ALL USING (false);

CREATE OR REPLACE FUNCTION public.is_platform_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = uid);
$$;
