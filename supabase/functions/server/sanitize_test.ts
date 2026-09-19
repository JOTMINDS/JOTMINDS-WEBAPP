import { Hono } from 'npm:hono';
import { secretStripper, stripSecrets } from './sanitize.tsx';

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

Deno.test('stripSecrets removes the secret at any depth, including arrays', () => {
  const input = {
    id: 'u1', _internalAuth: 'pw',
    users: [{ id: 'a', _internalAuth: 'x', name: 'Ama' }, { id: 'b' }],
    nested: { deep: { _internalAuth: 'y', keep: 1 } },
  };
  const out = stripSecrets(input);
  assert(!JSON.stringify(out).includes('_internalAuth'), 'secret key still present');
  assert(out.users[0].name === 'Ama' && out.nested.deep.keep === 1, 'other fields must survive');
  assert(input._internalAuth === 'pw', 'input must not be mutated');
});

Deno.test('stripSecrets leaves primitives, null and non-plain values alone', () => {
  assert(stripSecrets(null) === null, 'null');
  assert(stripSecrets('x') === 'x', 'string');
  const d = new Date();
  assert(stripSecrets(d) === d, 'date');
});

function makeApp() {
  const app = new Hono();
  app.use('*', secretStripper());
  app.get('/leak', (c) => c.json({ user: { id: '1', email: 'a@b.c', _internalAuth: 'secret-pw' } }));
  app.get('/list', (c) => c.json({ users: [{ id: '1', _internalAuth: 'p1' }, { id: '2', _internalAuth: 'p2' }] }));
  app.get('/clean', (c) => c.json({ ok: true, n: 3 }));
  app.get('/text', (c) => c.text('_internalAuth is a word here'));
  app.get('/status', (c) => c.json({ error: 'nope', _internalAuth: 'z' }, 401));
  return app;
}

Deno.test('middleware strips the secret from object and list responses', async () => {
  const app = makeApp();
  for (const path of ['/leak', '/list']) {
    const res = await app.request(path);
    const body = await res.text();
    assert(res.status === 200, `${path} status`);
    assert(!body.includes('_internalAuth') && !body.includes('secret-pw') && !body.includes('"p1"'), `${path} leaked`);
  }
  const leak = await (await app.request('/leak')).json();
  assert(leak.user.email === 'a@b.c', 'non-secret fields kept');
});

Deno.test('middleware keeps status codes and passes clean / non-JSON responses through', async () => {
  const app = makeApp();
  const s = await app.request('/status');
  assert(s.status === 401, 'status preserved');
  assert(!(await s.text()).includes('_internalAuth'), 'secret removed on error responses too');
  assert((await (await app.request('/clean')).json()).n === 3, 'clean body untouched');
  assert((await (await app.request('/text')).text()).includes('_internalAuth'), 'non-JSON untouched');
});
