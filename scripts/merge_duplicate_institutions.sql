-- Merges duplicate school records created for one admin (a new school + code
-- was generated on every dashboard refresh) into the single record that the
-- admin should keep. Run in the Supabase SQL editor. Replace the email below.

-- ── STEP 1: preview. Pick the row to keep (usually the one whose code was
--    handed out / has the most members) and note its id. ─────────────────────
select i.id, i.code, i.created_at,
       (select count(*) from institution_members m where m.institution_id = i.id) as members,
       (select count(*) from classes c where c.institution_id = i.id) as classes
from institutions i
where i.admin_email = 'CLIENT_EMAIL_HERE'
order by i.created_at;

-- ── STEP 2: merge. Put the keeper's id in keep_id, then uncomment. ──────────
-- begin;
--   create temp table _merge as
--     select i.id as dup_id, 'KEEP_ID_HERE'::uuid as keep_id
--     from institutions i
--     where i.admin_email = 'CLIENT_EMAIL_HERE' and i.id <> 'KEEP_ID_HERE'::uuid;
--
--   -- members: skip anyone already in the keeper, move the rest
--   update institution_members m set institution_id = g.keep_id
--     from _merge g
--     where m.institution_id = g.dup_id
--       and not exists (select 1 from institution_members k
--                       where k.institution_id = g.keep_id and k.user_id = m.user_id);
--   update classes c set institution_id = g.keep_id from _merge g where c.institution_id = g.dup_id;
--   update student_codes s set institution_id = g.keep_id from _merge g where s.institution_id = g.dup_id;
--   update institution_invitations v set institution_id = g.keep_id from _merge g where v.institution_id = g.dup_id;
--
--   -- members left on duplicates are repeats of people already in the keeper
--   delete from institutions where id in (select dup_id from _merge);
-- commit;
