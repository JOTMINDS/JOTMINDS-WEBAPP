import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import fs from 'node:fs';
import assert from 'node:assert/strict';

// Usage: npm i --no-save @electric-sql/pglite && node test.mjs .
const dir = process.argv[2] ?? '.';
const sql = (f) => fs.readFileSync(`${dir}/${f}`, 'utf8');

async function fresh() {
  const db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(`
    create extension pgcrypto;
    create schema extensions;
    -- Supabase keeps pgcrypto in "extensions"; mirror that with thin wrappers.
    create function extensions.crypt(text, text) returns text language sql as 'select public.crypt($1,$2)';
    create function extensions.gen_salt(text, int) returns text language sql as 'select public.gen_salt($1,$2)';
    create function extensions.gen_random_bytes(int) returns bytea language sql as 'select public.gen_random_bytes($1)';
    create schema auth;
    create table auth.users (id uuid primary key, email text, encrypted_password text, updated_at timestamptz);
    create table auth.sessions (id uuid primary key default gen_random_uuid(), user_id uuid);
    create table public.kv_store_fc8eb847 (key text not null primary key, value jsonb not null);
  `);
  const ids = ['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'];
  const orphan = '99999999-9999-9999-9999-999999999999';
  const normal = '44444444-4444-4444-4444-444444444444';
  for (const [i, id] of ids.entries()) {
    await db.query(`insert into auth.users values ($1,$2,public.crypt($3, public.gen_salt('bf',10)), now())`, [id, `s${i}@student.jotminds.app`, `OLDPASS${i}`]);
    await db.query(`insert into public.kv_store_fc8eb847 values ($1,$2::jsonb)`, [`user:${id}`, JSON.stringify({ id, email: `s${i}@student.jotminds.app`, name: `Student ${i}`, studentCode: `JM-AAAA-000${i}`, assessmentsCompleted: ['learning'], _internalAuth: `OLDPASS${i}` })]);
    await db.query(`insert into auth.sessions(user_id) values ($1)`, [id]);
  }
  await db.query(`insert into auth.users values ($1,'real@x.com',public.crypt('mine', public.gen_salt('bf',10)), now())`, [normal]);
  await db.query(`insert into public.kv_store_fc8eb847 values ($1,$2::jsonb)`, [`user:${normal}`, JSON.stringify({ id: normal, email: 'real@x.com', name: 'Real User' })]);
  await db.query(`insert into public.kv_store_fc8eb847 values ($1,$2::jsonb)`, [`user:${orphan}`, JSON.stringify({ id: orphan, _internalAuth: 'ORPHANPW' })]);
  await db.query(`insert into public.kv_store_fc8eb847 values ('user:admin-001','{"name":"legacy admin","_internalAuth":"x"}'::jsonb)`); // non-uuid key must be ignored
  await db.query(`insert into public.kv_store_fc8eb847 values ('result:1:learning','{"a":1}'::jsonb)`);
  return { db, ids, orphan, normal };
}

const verifies = async (db, id, pw) =>
  (await db.query(`select encrypted_password = public.crypt($2, encrypted_password) as ok from auth.users where id = $1`, [id, pw])).rows[0].ok;
const kv = async (db, key) => (await db.query(`select value from public.kv_store_fc8eb847 where key=$1`, [key])).rows[0].value;

let n = 0;
const t = async (name, fn) => { await fn(); console.log(`ok ${++n} - ${name}`); };

await t('preview counts and orphan detection (read-only)', async () => {
  const { db, orphan } = await fresh();
  const before = JSON.stringify((await db.query('select * from public.kv_store_fc8eb847 order by key')).rows);
  const rs = await db.exec(sql('01_preview.sql'));
  assert.equal(Number(rs[0].rows[0].accounts_with_internal_password), 4); // 3 + orphan; admin-001 ignored
  assert.equal(Number(rs[1].rows[0].will_rotate), 3);
  assert.equal(rs[2].rows.length, 1);
  assert.equal(rs[2].rows[0].orphan_user_id, orphan);
  assert.equal(JSON.stringify((await db.query('select * from public.kv_store_fc8eb847 order by key')).rows), before, 'preview changed data');
});

await t('rotation changes every student password consistently, old ones stop working', async () => {
  const { db, ids } = await fresh();
  await db.exec(sql('02_rotate.sql'));
  for (const [i, id] of ids.entries()) {
    const v = await kv(db, `user:${id}`);
    assert.notEqual(v._internalAuth, `OLDPASS${i}`);
    assert.match(v._internalAuth, /^[0-9a-f]{64}$/);
    assert.equal(await verifies(db, id, v._internalAuth), true, 'new password must verify against auth hash');
    assert.equal(await verifies(db, id, `OLDPASS${i}`), false, 'old password must no longer work');
    assert.match(v._internalAuthRotatedAt, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  }
});

await t('passwords are unique per account', async () => {
  const { db, ids } = await fresh();
  await db.exec(sql('02_rotate.sql'));
  const pws = new Set();
  for (const id of ids) pws.add((await kv(db, `user:${id}`))._internalAuth);
  assert.equal(pws.size, ids.length);
});

await t('other profile fields are preserved', async () => {
  const { db, ids } = await fresh();
  await db.exec(sql('02_rotate.sql'));
  const v = await kv(db, `user:${ids[1]}`);
  assert.equal(v.name, 'Student 1');
  assert.equal(v.studentCode, 'JM-AAAA-0001');
  assert.deepEqual(v.assessmentsCompleted, ['learning']);
});

await t('non-student users, orphans, non-uuid keys and results are untouched', async () => {
  const { db, orphan, normal } = await fresh();
  await db.exec(sql('02_rotate.sql'));
  assert.deepEqual(await kv(db, `user:${normal}`), { id: normal, email: 'real@x.com', name: 'Real User' });
  assert.equal(await verifies(db, normal, 'mine'), true);
  assert.equal((await kv(db, `user:${orphan}`))._internalAuth, 'ORPHANPW');
  assert.equal((await kv(db, 'user:admin-001'))._internalAuth, 'x');
  assert.deepEqual(await kv(db, 'result:1:learning'), { a: 1 });
});

await t('verify script: clean after rotation; flags a mismatch', async () => {
  const { db, ids } = await fresh();
  await db.exec(sql('02_rotate.sql'));
  let rs = await db.exec(sql('03_verify.sql'));
  assert.equal(rs[0].rows.length, 1, 'only the orphan should be reported');
  assert.equal(rs[0].rows[0].problem, 'no auth user');
  assert.equal(Number(rs[1].rows[0].never_rotated), 1); // orphan never rotated
  // simulate the race: an app write restores an old KV password
  await db.query(`update public.kv_store_fc8eb847 set value = value || '{"_internalAuth":"STALE"}' where key = $1`, [`user:${ids[0]}`]);
  rs = await db.exec(sql('03_verify.sql'));
  const problems = rs[0].rows.map((r) => `${r.user_id}:${r.problem}`);
  assert.ok(problems.includes(`${ids[0]}:password mismatch`), 'mismatch must be reported');
});

await t('re-running is safe and re-fixes a mismatch', async () => {
  const { db, ids } = await fresh();
  await db.exec(sql('02_rotate.sql'));
  await db.query(`update public.kv_store_fc8eb847 set value = value || '{"_internalAuth":"STALE"}' where key = $1`, [`user:${ids[0]}`]);
  await db.exec(sql('02_rotate.sql'));
  const v = await kv(db, `user:${ids[0]}`);
  assert.equal(await verifies(db, ids[0], v._internalAuth), true);
  const rs = await db.exec(sql('03_verify.sql'));
  assert.equal(rs[0].rows.length, 1); // still just the orphan
});

await t('rolls back completely when the consistency check fails', async () => {
  const { db, ids } = await fresh();
  // A trigger that silently swallows auth updates makes KV and auth disagree.
  await db.exec(`create function public.swallow() returns trigger language plpgsql as 'begin return null; end';
                 create trigger swallow before update on auth.users for each row execute function public.swallow();`);
  const before = JSON.stringify((await db.query('select * from public.kv_store_fc8eb847 order by key')).rows);
  await assert.rejects(() => db.exec(sql('02_rotate.sql')), /Consistency check failed/);
  await db.exec('rollback');
  const after = JSON.stringify((await db.query('select * from public.kv_store_fc8eb847 order by key')).rows);
  assert.equal(after, before, 'KV must be unchanged after a failed rotation');
  assert.equal(await verifies(db, ids[0], 'OLDPASS0'), true, 'auth must be unchanged after a failed rotation');
});

await t('aborts with a clear error when there is nothing to rotate', async () => {
  const { db } = await fresh();
  await db.exec(`update public.kv_store_fc8eb847 set value = value - '_internalAuth'`);
  await assert.rejects(() => db.exec(sql('02_rotate.sql')), /Nothing to rotate/);
  await db.exec('rollback');
});

await t('optional session sign-out block works when uncommented', async () => {
  const { db, ids } = await fresh();
  // uncomment the two optional lines
  const lines = sql('02_rotate.sql').split('\n');
  const i = lines.findIndex((l) => l.startsWith('-- delete from auth.sessions'));
  lines[i] = lines[i].replace(/^-- /, '');
  lines[i + 1] = lines[i + 1].replace(/^-- /, '');
  await db.exec(lines.join('\n'));
  const left = (await db.query('select user_id from auth.sessions')).rows.map((r) => r.user_id);
  assert.equal(left.length, 0, 'sessions of rotated accounts should be gone');
});

console.log(`\nall ${n} checks passed`);
