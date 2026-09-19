-- Rotates the internal password of every student-code account, in ONE transaction.
--
-- Why: /student-code/signin (and other routes that return profiles wholesale)
-- used to return `_internalAuth`. Anyone who saw it could sign in by
-- email + password even after the student's code was revoked.
--
-- What it does, atomically (all or nothing):
--   1. picks a fresh random 256-bit password per account
--   2. writes its bcrypt hash to auth.users.encrypted_password
--   3. writes the same password to the KV profile (`_internalAuth`) that
--      /student-code/signin reads, plus `_internalAuthRotatedAt`
--   4. re-checks that every KV password verifies against its auth hash and
--      aborts (rolls back) if anything disagrees
--
-- Student codes do not change; students keep signing in with their code.
-- Safe to re-run (it just rotates again). New passwords never leave the database.
--
-- Run it AFTER the fixed edge function is deployed, otherwise the new
-- password can leak through the old responses.
-- Run in the Supabase SQL editor (postgres role) or psql. Run 01_preview.sql first.

begin;

create temp table pw_rotation on commit drop as
select
  k.key                              as kv_key,
  substring(k.key from 6)            as user_id_text,
  encode(extensions.gen_random_bytes(32), 'hex') as new_pw
from public.kv_store_fc8eb847 k
join auth.users u on u.id::text = substring(k.key from 6)
where k.key ~ '^user:[0-9a-f-]{36}$'
  and k.value->>'_internalAuth' is not null;

update auth.users u
set encrypted_password = extensions.crypt(r.new_pw, extensions.gen_salt('bf', 10)),
    updated_at = now()
from pw_rotation r
where u.id::text = r.user_id_text;

update public.kv_store_fc8eb847 k
set value = k.value || jsonb_build_object(
      '_internalAuth', r.new_pw,
      '_internalAuthRotatedAt', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    )
from pw_rotation r
where k.key = r.kv_key;

-- Abort unless every rotated account is consistent: same count, and the KV
-- password verifies against the stored auth hash.
do $$
declare
  expected int;
  ok int;
begin
  select count(*) into expected from pw_rotation;
  select count(*) into ok
  from pw_rotation r
  join public.kv_store_fc8eb847 k on k.key = r.kv_key
  join auth.users u on u.id::text = r.user_id_text
  where k.value->>'_internalAuth' = r.new_pw
    and u.encrypted_password = extensions.crypt(k.value->>'_internalAuth', u.encrypted_password);
  if expected = 0 then
    raise exception 'Nothing to rotate — aborting (run 01_preview.sql to see why)';
  end if;
  if ok <> expected then
    raise exception 'Consistency check failed: % of % accounts verified — rolling back', ok, expected;
  end if;
  raise notice 'Rotated and verified % student-code accounts', ok;
end $$;

-- OPTIONAL — also sign out every student-code account (forces students to sign
-- in with their code again). Uncomment if you suspect the leaked password was
-- already used to open sessions.
-- delete from auth.sessions
-- where user_id::text in (select user_id_text from pw_rotation);

commit;
