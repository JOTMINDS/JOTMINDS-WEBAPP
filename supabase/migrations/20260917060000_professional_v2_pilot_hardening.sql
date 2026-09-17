-- Sprint 8: Pilot Hardening
--
-- 1. Consent capture: a session cannot exist without recording that the
--    test-taker consented to data collection / AI use at start time.
-- 2. Scoring version integrity: today only scoring_version=1 exists, but the
--    (session_id, construct_id) unique constraint would let a future
--    re-score silently overwrite a prior version's results instead of
--    preserving history, which the pilot QA checklist explicitly forbids.

ALTER TABLE public.assessment_sessions
  ADD COLUMN IF NOT EXISTS consent_given boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_version text;

ALTER TABLE public.construct_results DROP CONSTRAINT IF EXISTS construct_results_session_id_construct_id_key;
ALTER TABLE public.construct_results ADD CONSTRAINT construct_results_session_construct_version_key
  UNIQUE (session_id, construct_id, scoring_version);

ALTER TABLE public.domain_results DROP CONSTRAINT IF EXISTS domain_results_session_id_domain_id_key;
ALTER TABLE public.domain_results ADD CONSTRAINT domain_results_session_domain_version_key
  UNIQUE (session_id, domain_id, scoring_version);
