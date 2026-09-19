import type { MiddlewareHandler } from 'npm:hono';
import { verifyAuth } from './auth-helpers.tsx';

/**
 * Rejects requests that don't carry a real signed-in user's token (the anon
 * key doesn't count). Used on routes that spend money per call (the /ai/*
 * OpenAI proxy) so they can't be driven by anyone who merely knows the URL.
 *
 * `verify` is injectable so the guard can be tested without a Supabase project.
 */
export function requireUser(verify: (req: Request) => Promise<unknown> = verifyAuth): MiddlewareHandler {
  return async (c, next) => {
    // CORS preflights never carry credentials; the cors() middleware answers them first,
    // but never block one here if it does reach us.
    if (c.req.method === 'OPTIONS') return next();
    const user = await verify(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    await next();
  };
}
