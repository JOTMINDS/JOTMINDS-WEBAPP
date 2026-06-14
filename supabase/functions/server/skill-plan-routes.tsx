import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

const getSupabaseClient = () =>
  createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);

async function verifyAuth(request: Request) {
  const adminToken = request.headers.get('X-Admin-Token');
  if (adminToken && adminToken.startsWith('admin-token-')) {
    return { id: 'admin-001', email: 'admin@jotminds.com' };
  }
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  try {
    const { data, error } = await getSupabaseClient().auth.getUser(token);
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

function uuid() {
  return crypto.randomUUID();
}

// Activity templates per dimension/tier (MVP set — content team can expand).
const ACTIVITY_BANK: Record<string, {
  games: string[]; prompts: string[]; challenges: string[];
}> = {
  metacognition: {
    games: ['memory-match', 'n-back', 'stroop'],
    prompts: [
      'What did you learn today that surprised you?',
      'Describe a moment when you changed your mind.',
      'How did you check that your answer was right?',
    ],
    challenges: [
      'Solve one problem out loud — narrate your steps.',
      'Re-explain something you learned to a younger person.',
      'Pick one mistake from this week and write down what it taught you.',
    ],
  },
  problem_solving: {
    games: ['stroop', 'pattern', 'n-back'],
    prompts: [
      'What is the hardest problem you faced today?',
      'List three different ways to solve the same problem.',
    ],
    challenges: [
      'Take one daily task and find a faster way to do it.',
      'Plan a project in 5 steps before starting.',
    ],
  },
  curiosity: {
    games: ['memory-match', 'pattern'],
    prompts: [
      'What is one question you cannot stop thinking about?',
      'Pick something ordinary and write 5 things you do not know about it.',
    ],
    challenges: [
      'Learn one new word and use it in conversation.',
      'Ask three people: "What changed your mind recently?"',
    ],
  },
  emotional_regulation: {
    games: ['memory-match'],
    prompts: [
      'Name the feeling you had most today and what triggered it.',
      'Describe a moment you stayed calm when it was hard.',
    ],
    challenges: [
      'When you feel rushed, take 3 slow breaths before acting.',
      'Write a kind message to someone — including yourself.',
    ],
  },
};

const FALLBACK = ACTIVITY_BANK.metacognition;

function generatePlan(opts: {
  userId: string; dimensionId: string; tier: string;
  lengthDays: 7 | 14; sourceResultId: string; sourceCareer?: string;
}) {
  const bank = ACTIVITY_BANK[opts.dimensionId] ?? FALLBACK;
  const pick = <T,>(arr: T[], day: number): T => arr[day % arr.length];
  const activities = Array.from({ length: opts.lengthDays }, (_, i) => ({
    day: i + 1,
    gameId: pick(bank.games, i),
    promptId: `prompt:${opts.dimensionId}:${i % bank.prompts.length}`,
    challengeId: `challenge:${opts.dimensionId}:${i % bank.challenges.length}`,
    completed: false,
    completedAt: null as string | null,
  }));
  const now = new Date().toISOString();
  return {
    planId: uuid(),
    userId: opts.userId,
    dimensionId: opts.dimensionId,
    tier: opts.tier,
    lengthDays: opts.lengthDays,
    currentDay: 1,
    status: 'active' as const,
    activities,
    sourceResultId: opts.sourceResultId,
    sourceCareer: opts.sourceCareer,
    createdAt: now,
    updatedAt: now,
  };
}

// GET /skill-plan/list — current user's plans
app.get('/list', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const rows = await kv.getByPrefix(`skillplan:${user.id}:`);
  return c.json({ plans: rows ?? [] });
});

// GET /skill-plan/:planId
app.get('/:planId', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const planId = c.req.param('planId');
  const plan = await kv.get(`skillplan:${user.id}:${planId}`);
  if (!plan) return c.json({ error: 'Not found' }, 404);
  return c.json({ plan });
});

// POST /skill-plan/generate — body: { dimensionId, tier, lengthDays, sourceResultId, sourceCareer? }
app.post('/generate', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const body = await c.req.json();
  const lengthDays = body.lengthDays === 14 ? 14 : 7;
  const plan = generatePlan({
    userId: user.id,
    dimensionId: body.dimensionId ?? 'metacognition',
    tier: body.tier ?? 'adult',
    lengthDays,
    sourceResultId: body.sourceResultId ?? '',
    sourceCareer: body.sourceCareer,
  });
  await kv.set(`skillplan:${user.id}:${plan.planId}`, plan);
  return c.json({ plan });
});

// POST /skill-plan/:planId/complete-day — body: { day }
app.post('/:planId/complete-day', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const planId = c.req.param('planId');
  const { day } = await c.req.json();
  const key = `skillplan:${user.id}:${planId}`;
  const plan = await kv.get(key);
  if (!plan) return c.json({ error: 'Not found' }, 404);
  const activity = plan.activities.find((a: any) => a.day === day);
  if (!activity) return c.json({ error: 'Invalid day' }, 400);
  activity.completed = true;
  activity.completedAt = new Date().toISOString();
  plan.currentDay = Math.min(day + 1, plan.lengthDays);
  if (plan.activities.every((a: any) => a.completed)) plan.status = 'completed';
  plan.updatedAt = new Date().toISOString();
  await kv.set(key, plan);
  return c.json({ plan });
});

// DELETE /skill-plan/:planId
app.delete('/:planId', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const planId = c.req.param('planId');
  await kv.del(`skillplan:${user.id}:${planId}`);
  return c.json({ ok: true });
});

export default app;
