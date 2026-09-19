import { Hono } from 'npm:hono';
import { requireUser } from './require-auth.tsx';

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

function makeApp(verify: (r: Request) => Promise<unknown>) {
  const app = new Hono();
  let spent = 0;
  app.use('*', requireUser(verify));
  app.post('/chat', (c) => { spent++; return c.json({ reply: 'ok' }); });
  return { app, spent: () => spent };
}

Deno.test('no credentials: 401 and the handler (which would spend money) never runs', async () => {
  const { app, spent } = makeApp(async () => null);
  const res = await app.request('/chat', { method: 'POST', body: '{}' });
  assert(res.status === 401, `expected 401, got ${res.status}`);
  assert((await res.json()).error === 'Unauthorized', 'error body');
  assert(spent() === 0, 'handler must not run for unauthenticated calls');
});

Deno.test('a verified user reaches the handler', async () => {
  const { app, spent } = makeApp(async () => ({ id: 'u1' }));
  const res = await app.request('/chat', { method: 'POST', body: '{}', headers: { Authorization: 'Bearer good' } });
  assert(res.status === 200, `expected 200, got ${res.status}`);
  assert(spent() === 1, 'handler should run once');
});

Deno.test('the verifier receives the request so it can read the Authorization header', async () => {
  let seen: string | null = null;
  const { app } = makeApp(async (req) => { seen = req.headers.get('Authorization'); return { id: 'u' }; });
  await app.request('/chat', { method: 'POST', body: '{}', headers: { Authorization: 'Bearer abc' } });
  assert(seen === 'Bearer abc', 'header not forwarded to verifier');
});

Deno.test('a verifier that throws does not let the request through', async () => {
  const { app, spent } = makeApp(async () => { throw new Error('boom'); });
  const res = await app.request('/chat', { method: 'POST', body: '{}' });
  assert(res.status >= 400, 'must fail closed');
  assert(spent() === 0, 'handler must not run when verification errors');
});

Deno.test('OPTIONS preflight is not blocked', async () => {
  const app = new Hono();
  app.use('*', requireUser(async () => null));
  app.options('/chat', (c) => c.body(null, 204));
  const res = await app.request('/chat', { method: 'OPTIONS' });
  assert(res.status === 204, `preflight got ${res.status}`);
});
