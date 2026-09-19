-- READ-ONLY. Shows what 02_rotate.sql would touch. Prints no secrets.

-- 1) How many student-code accounts have a stored internal password?
select count(*) as accounts_with_internal_password
from public.kv_store_fc8eb847
where key ~ '^user:[0-9a-f-]{36}$'
  and value->>'_internalAuth' is not null;

-- 2) How many of those have a matching auth user (these get rotated)?
select count(*) as will_rotate
from public.kv_store_fc8eb847 k
join auth.users u on u.id::text = substring(k.key from 6)
where k.key ~ '^user:[0-9a-f-]{36}$'
  and k.value->>'_internalAuth' is not null;

-- 3) Stored password but no auth user (orphans — left alone, review by hand)
select substring(k.key from 6) as orphan_user_id, k.value->>'email' as email
from public.kv_store_fc8eb847 k
left join auth.users u on u.id::text = substring(k.key from 6)
where k.key ~ '^user:[0-9a-f-]{36}$'
  and k.value->>'_internalAuth' is not null
  and u.id is null;

-- 4) Where is pgcrypto? 02_rotate.sql assumes the Supabase default (schema "extensions").
select extname, extnamespace::regnamespace as schema from pg_extension where extname = 'pgcrypto';
