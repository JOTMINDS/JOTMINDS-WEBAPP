import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { verifyAuth } from './auth-helpers.tsx';

/**
 * Brain Gym leaderboard — a single combined "Brain Gym points" score per
 * user (sum of their best score across the games). Identities are shown as
 * initials only. Two views: global, and the caller's class.
 *
 * Mount in index.tsx:
 *   import leaderboardRoutes from './leaderboard-routes.tsx';
 *   app.route('/make-server-fc8eb847/leaderboard', leaderboardRoutes);
 *
 * KV: leaderboard:{userId} -> { userId, initials, points, className, updatedAt }
 */

const app = new Hono();
const PREFIX = 'leaderboard:';
const TOP_N = 100;

function sanitizeInitials(raw: unknown): string {
  return String(raw ?? '')
    .replace(/[^A-Za-z]/g, '')
    .toUpperCase()
    .slice(0, 3) || '—';
}

// ── Submit / update the caller's combined score ─────────────────────────
app.post('/', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { points, initials, className } = await c.req.json();
    const p = Math.max(0, Math.round(Number(points) || 0));

    const key = `${PREFIX}${user.id}`;
    const existing = await kv.get(key);
    // Keep the higher of the two — a leaderboard score never goes down.
    const best = Math.max(p, existing?.points ?? 0);

    await kv.set(key, {
      userId: user.id,
      initials: sanitizeInitials(initials ?? existing?.initials),
      points: best,
      className: className ?? existing?.className ?? null,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ success: true, points: best });
  } catch (error) {
    console.error('[leaderboard] submit error:', error);
    return c.json({ error: 'Failed to submit score' }, 500);
  }
});

// ── Read a ranked view ─────────────────────────────────────────────────
app.get('/', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const scope = new URL(c.req.url).searchParams.get('scope') === 'class' ? 'class' : 'global';
    const all = (await kv.getByPrefix(PREFIX)).filter((e: any) => e && typeof e.points === 'number');

    let myClass: string | null = null;
    if (scope === 'class') {
      const me = all.find((e: any) => e.userId === user.id);
      myClass = me?.className ?? (await kv.get(`user:${user.id}`))?.className ?? null;
    }

    const pool = scope === 'class'
      ? all.filter((e: any) => myClass && e.className === myClass)
      : all;

    const ranked = pool
      .sort((a: any, b: any) => b.points - a.points || a.updatedAt.localeCompare(b.updatedAt))
      .map((e: any, i: number) => ({
        rank: i + 1,
        initials: e.initials || '—',
        points: e.points,
        isMe: e.userId === user.id,
      }));

    const mine = ranked.find((r: any) => r.isMe);

    return c.json({
      scope,
      className: myClass,
      total: ranked.length,
      entries: ranked.slice(0, TOP_N),
      myRank: mine ? mine.rank : null,
      myPoints: mine ? mine.points : null,
    });
  } catch (error) {
    console.error('[leaderboard] read error:', error);
    return c.json({ error: 'Failed to load leaderboard' }, 500);
  }
});

export default app;
