-- Removes the demo data created by the (now deleted) seed scripts:
--   Greenfield Academy  (seed_demo.cjs)
--   St. Peter's International School (seed_pitch.cjs, seed_students.cjs)
--
-- Run in the Supabase SQL editor. Deletion is permanent, so run STEP 1 first
-- and check that every row listed is demo data before running STEP 2.

-- ── STEP 1: preview ─────────────────────────────────────────────────────────
select id, name, admin_email from institutions
where admin_email in ('principal@greenfield.edu.gh', 'headmaster@stpeter.edu');

select user_id, user_name, user_email from institution_members
where user_email like '%@greenfield.edu.gh' or user_email like '%@stpeter.edu';

select id, email from auth.users
where email like '%@greenfield.edu.gh' or email like '%@stpeter.edu';

-- ── STEP 2: delete (uncomment after reviewing step 1) ───────────────────────
-- begin;
--   delete from institution_members
--     where user_email like '%@greenfield.edu.gh' or user_email like '%@stpeter.edu';
--   delete from institutions
--     where admin_email in ('principal@greenfield.edu.gh', 'headmaster@stpeter.edu');
--   delete from auth.users
--     where email like '%@greenfield.edu.gh' or email like '%@stpeter.edu';
-- commit;
