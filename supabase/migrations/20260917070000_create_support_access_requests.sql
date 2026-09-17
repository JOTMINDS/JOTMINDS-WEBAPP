-- Backs the Super Admin Portal's "Request Audited Access" feature, which
-- previously only sent an email with dead href="#" approve/deny links and
-- tracked "pending" purely in client-side React state (no persistence, no
-- real approval, nothing actually audited). This table makes the request,
-- the decision, and the token that authorizes it real and durable.

CREATE TABLE IF NOT EXISTS public.support_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_by_email text,
  target_type text NOT NULL CHECK (target_type IN ('institution', 'organization', 'user')),
  target_id text NOT NULL,
  target_email text NOT NULL,
  target_name text,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
  decision_token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS idx_support_access_requests_target ON public.support_access_requests(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_support_access_requests_token ON public.support_access_requests(decision_token);

ALTER TABLE public.support_access_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY support_access_requests_service_role_only ON public.support_access_requests FOR ALL USING (false);
