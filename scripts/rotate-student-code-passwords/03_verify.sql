-- READ-ONLY. Run after 02_rotate.sql (and any time later, e.g. after a
-- concurrent profile write). Returns ZERO rows when every student-code
-- account's KV password matches its auth hash. Prints no secrets.
--
-- Any row returned = that student cannot sign in with their code. Fix by
-- re-running 02_rotate.sql.
select
  substring(k.key from 6)            as user_id,
  k.value->>'email'                  as email,
  k.value->>'_internalAuthRotatedAt' as rotated_at,
  case when u.id is null then 'no auth user' else 'password mismatch' end as problem
from public.kv_store_fc8eb847 k
left join auth.users u on u.id::text = substring(k.key from 6)
where k.key ~ '^user:[0-9a-f-]{36}$'
  and k.value->>'_internalAuth' is not null
  and (u.id is null or u.encrypted_password <> extensions.crypt(k.value->>'_internalAuth', u.encrypted_password));

-- Accounts not yet rotated (no marker). Should be zero after 02_rotate.sql
-- unless students were created afterwards (those have fresh passwords and are fine).
select count(*) as never_rotated
from public.kv_store_fc8eb847
where key ~ '^user:[0-9a-f-]{36}$'
  and value->>'_internalAuth' is not null
  and value->>'_internalAuthRotatedAt' is null;
