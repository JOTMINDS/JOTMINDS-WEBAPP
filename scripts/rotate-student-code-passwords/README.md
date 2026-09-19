# Rotate student-code account passwords

Student-code accounts sign in server-side with a random internal password
(`_internalAuth` in the KV profile). Before the fix in `sanitize.tsx`, several
API responses included it. This rotates every one of those passwords.

The password lives in two places (`auth.users` and the KV profile), so the
rotation is a single SQL transaction: it either changes both consistently or
changes nothing. New passwords are generated inside the database and never
leave it. Student codes are unchanged.

## Order

1. **Deploy the fixed edge function first** (`secretStripper` middleware), so the new
   passwords can't leak through old responses.
2. Supabase dashboard → SQL editor (or `psql`), as the `postgres` role:
   1. `01_preview.sql` — read-only. Check `will_rotate` is what you expect.
      Orphans (stored password, no auth user) are listed and left alone.
   2. `02_rotate.sql` — the rotation. Expect the notice
      `Rotated and verified N student-code accounts`.
   3. `03_verify.sql` — read-only. The first result should list only the orphans
      from step 1 (if any); `never_rotated` should equal the orphan count.
3. Smoke test: sign in with a real student code in the app.

If `02_rotate.sql` errors with `function extensions.crypt does not exist`, your
pgcrypto lives elsewhere: `01_preview.sql` query 4 shows the schema; adjust the
`extensions.` prefixes.

## Notes

- **Re-running is safe.** It just rotates again. If `03_verify.sql` ever returns a
  mismatch (e.g. an app request wrote a stale profile in the instant around the
  rotation), re-run `02_rotate.sql`.
- **Sessions:** rotating a password doesn't end existing sessions. If you suspect the
  leaked password was used, uncomment the `delete from auth.sessions` block in
  `02_rotate.sql`; students will then sign in with their code again.
- Run it when traffic is low; the transaction is short but touches every
  student-code row.

## Tests

`test.mjs` runs the three scripts against an in-memory Postgres (PGlite +
pgcrypto) with a Supabase-shaped `auth.users`: consistency, uniqueness,
old-password invalidation, untouched non-student rows / orphans / non-UUID keys,
idempotency, full rollback when the consistency check fails, and the optional
sign-out block.

```
cd scripts/rotate-student-code-passwords
npm i --no-save @electric-sql/pglite && node test.mjs .
```
