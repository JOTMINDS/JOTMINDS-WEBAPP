import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { verifyAuth } from './auth-helpers.tsx';

const app = new Hono();

const GAMES = ['memory-match', 'n-back', 'stroop'] as const;

// POST /brain-gym — save a game result
app.post('/', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const body = await c.req.json();
    const { game, score, durationMs, accuracy } = body;
    if (!game || typeof score !== 'number') {
      return c.json({ error: 'game and score are required' }, 400);
    }

    const result = {
      user_id: user.id,
      game,
      score,
      durationMs: durationMs ?? null,
      accuracy: accuracy ?? null,
      created_at: new Date().toISOString(),
    };
    await kv.set(`braingym:${user.id}:${Date.now()}`, result);
    return c.json({ success: true, result });
  } catch (error) {
    console.error('[brain-gym] save error:', error);
    return c.json({ error: 'Failed to save result', details: String(error) }, 500);
  }
});

// GET /brain-gym — recent results + per-game best (for the radar chart)
app.get('/', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const all = await kv.getByPrefix(`braingym:${user.id}:`);
    const sorted = all.sort((a: any, b: any) => (a.created_at < b.created_at ? 1 : -1));

    const bests: Record<string, number> = {};
    for (const g of GAMES) {
      const scores = all.filter((r: any) => r.game === g).map((r: any) => r.score);
      bests[g] = scores.length ? Math.max(...scores) : 0;
    }

    return c.json({ results: sorted.slice(0, 20), bests, plays: all.length });
  } catch (error) {
    console.error('[brain-gym] list error:', error);
    return c.json({ error: 'Failed to load results', details: String(error) }, 500);
  }
});

export default app;
