import type { MiddlewareHandler } from 'npm:hono';

// Fields stored on KV user profiles that must never leave the server.
// `_internalAuth` is the random password behind a student-code account: the
// server uses it to sign the student in when a valid code is presented, so
// exposing it would let anyone who sees it sign in by email + password even
// after the code is revoked.
const SECRET_KEYS = new Set(['_internalAuth']);

/** Recursively removes server-only secret fields from a JSON-like value. */
export function stripSecrets<T>(value: T): T {
  if (Array.isArray(value)) return value.map((v) => stripSecrets(v)) as unknown as T;
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (!SECRET_KEYS.has(k)) out[k] = stripSecrets(v);
    }
    return out as T;
  }
  return value;
}

/**
 * Safety net for every JSON response. Many routes return KV profiles wholesale
 * (`...profile`, `users`, `children`, `employees`), so stripping at each call
 * site is easy to miss; this guarantees the secret never reaches a client.
 * Bodies that don't mention a secret key are passed through untouched.
 */
export function secretStripper(): MiddlewareHandler {
  return async (c, next) => {
    await next();
    const res = c.res;
    if (!(res.headers.get('content-type') || '').includes('application/json')) return;
    let text: string;
    try {
      text = await res.clone().text();
    } catch {
      return;
    }
    if (![...SECRET_KEYS].some((k) => text.includes(`"${k}"`))) return;
    try {
      const headers = new Headers(res.headers);
      headers.delete('content-length');
      c.res = new Response(JSON.stringify(stripSecrets(JSON.parse(text))), { status: res.status, headers });
    } catch {
      // Unparseable body that still names a secret key: refuse rather than leak.
      c.res = new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }
  };
}
