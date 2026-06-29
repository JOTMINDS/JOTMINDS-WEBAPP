import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { verifyAuth } from './auth-helpers.tsx';

const app = new Hono();

// ── helpers ──────────────────────────────────────────────────────────────────
function dateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86400000);
}

// Consecutive-day streak ending today or yesterday.
function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...new Set(dates)].sort().reverse(); // desc
  const today = dateStr(new Date());
  const yesterday = dateStr(new Date(Date.now() - 86400000));
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (daysBetween(sorted[i], sorted[i - 1]) === 1) streak++;
    else break;
  }
  return streak;
}

// 4-part Insight Engine response (Observation / Pattern / Implication / Adjustment)
function generateFeedback(checkin: any) {
  const { focus_score, emotional_state } = checkin;
  const observations: Record<string, string> = {
    calm: 'You reported a calm emotional state today.',
    confident: 'You came in feeling confident today.',
    anxious: 'You reported feeling anxious today.',
    overwhelmed: 'You reported feeling overwhelmed today.',
    distracted: 'You reported feeling distracted today.',
  };
  const patterns: Record<string, string> = {
    calm: 'Calm states correlate with ~23% higher accuracy in decision-making.',
    confident: 'Confident states often precede peak performance windows.',
    anxious: 'Anxiety narrows attentional focus — useful for detail work, limiting for creative tasks.',
    overwhelmed: 'Overwhelm signals your cognitive load is at its limit. Prioritisation is critical now.',
    distracted: 'Distraction is a sign of under-stimulation or context-switching fatigue.',
  };
  const implications: Record<number, string> = {
    1: "A focus score of 1 suggests today wasn't ideal for deep work.",
    2: 'A focus score of 2 indicates significant interruptions or mental fatigue.',
    3: 'A focus score of 3 is average — you had productive and unproductive periods.',
    4: 'A focus score of 4 means you were largely in the zone today.',
    5: 'A focus score of 5 is peak performance. Excellent.',
  };
  const adjustments: Record<string, string> = {
    calm: 'Use this state for your most cognitively demanding tasks tomorrow.',
    confident: "Channel this into a stretch goal or a decision you've been avoiding.",
    anxious: 'Try the 4-7-8 breathing technique before your next high-stakes task.',
    overwhelmed: 'Write down every open loop in your head — then close 3 of them today.',
    distracted: 'Block 25 minutes of uninterrupted time before your next break.',
  };
  return {
    observation: observations[emotional_state] ?? 'You completed your daily check-in.',
    pattern: patterns[emotional_state] ?? 'Your emotional patterns shape how you think and decide.',
    implication: implications[focus_score] ?? 'Your focus score has been recorded.',
    adjustment: adjustments[emotional_state] ?? 'Stay consistent with your daily check-ins for better insights.',
  };
}

// ── POST /checkin  (save today's check-in) ───────────────────────────────────
app.post('/', async (c) => {
  try {
    const authedUser = await verifyAuth(c.req.raw);
    if (!authedUser) return c.json({ error: 'Unauthorized' }, 401);
    const user_id = authedUser.id; // derive from token — never trust the body

    const body = await c.req.json();
    const { focus_score, decision_delay, emotional_state, created_at } = body;
    if (!focus_score || !emotional_state) {
      return c.json({ error: 'focus_score and emotional_state are required' }, 400);
    }
    const created = created_at ? new Date(created_at) : new Date();
    const date = dateStr(created);
    const checkin = {
      user_id,
      focus_score: Number(focus_score),
      decision_delay: !!decision_delay,
      emotional_state,
      created_at: created.toISOString(),
      date,
    };
    await kv.set(`checkin:${user_id}:${date}`, checkin);

    const all = await kv.getByPrefix(`checkin:${user_id}:`);
    const streak = computeStreak(all.map((x: any) => x.date));

    return c.json({ success: true, checkin, streak, feedback: generateFeedback(checkin) });
  } catch (error) {
    console.error('[checkin] save error:', error);
    return c.json({ error: 'Failed to save check-in', details: String(error) }, 500);
  }
});

// ── GET /checkin/latest/:userId ──────────────────────────────────────────────
app.get('/latest/:userId', async (c) => {
  try {
    const authedUser = await verifyAuth(c.req.raw);
    if (!authedUser) return c.json({ error: 'Unauthorized' }, 401);
    const userId = authedUser.id; // a user can only read their own check-ins
    const all = await kv.getByPrefix(`checkin:${userId}:`);
    if (all.length === 0) return c.json({ checkin: null, streak: 0 });
    const sorted = all.sort((a: any, b: any) => (a.date < b.date ? 1 : -1));
    const streak = computeStreak(all.map((x: any) => x.date));
    return c.json({ checkin: sorted[0], streak });
  } catch (error) {
    console.error('[checkin] latest error:', error);
    return c.json({ error: 'Failed to load latest check-in', details: String(error) }, 500);
  }
});

// ── GET /checkin/user/:userId  (recent check-ins, chronological, max 7) ──────
app.get('/user/:userId', async (c) => {
  try {
    const authedUser = await verifyAuth(c.req.raw);
    if (!authedUser) return c.json({ error: 'Unauthorized' }, 401);
    const userId = authedUser.id;
    const all = await kv.getByPrefix(`checkin:${userId}:`);
    const checkins = all
      .sort((a: any, b: any) => (a.date < b.date ? -1 : 1))
      .slice(-7);
    return c.json({ checkins });
  } catch (error) {
    console.error('[checkin] user error:', error);
    return c.json({ error: 'Failed to load check-ins', details: String(error) }, 500);
  }
});

// ── GET /checkin/weekly/:userId  (auto-generated weekly snapshot) ─────────────
app.get('/weekly/:userId', async (c) => {
  try {
    const authedUser = await verifyAuth(c.req.raw);
    if (!authedUser) return c.json({ error: 'Unauthorized' }, 401);
    const userId = authedUser.id;
    const all = await kv.getByPrefix(`checkin:${userId}:`);
    const cutoff = dateStr(new Date(Date.now() - 7 * 86400000));
    const week = all
      .filter((x: any) => x.date >= cutoff)
      .sort((a: any, b: any) => (a.date < b.date ? -1 : 1));

    if (week.length === 0) {
      return c.json({
        report: {
          avg_focus: 0,
          delay_count: 0,
          dominant_emotion: '—',
          trend_direction: 'stable',
          total_checkins: 0,
          recommendation_text: 'Complete a few Daily Mind Checks this week to unlock your snapshot.',
        },
      });
    }

    const avg_focus = week.reduce((s: number, x: any) => s + x.focus_score, 0) / week.length;
    const delay_count = week.filter((x: any) => x.decision_delay).length;

    const emoCounts: Record<string, number> = {};
    week.forEach((x: any) => { emoCounts[x.emotional_state] = (emoCounts[x.emotional_state] ?? 0) + 1; });
    const dominant_emotion = Object.entries(emoCounts).sort((a, b) => b[1] - a[1])[0][0];

    // trend: compare first-half vs second-half average focus
    const mid = Math.floor(week.length / 2);
    const firstAvg = week.slice(0, mid || 1).reduce((s: number, x: any) => s + x.focus_score, 0) / (mid || 1);
    const secondAvg = week.slice(mid).reduce((s: number, x: any) => s + x.focus_score, 0) / (week.length - mid || 1);
    let trend_direction: 'improving' | 'stable' | 'declining' = 'stable';
    if (secondAvg - firstAvg > 0.4) trend_direction = 'improving';
    else if (firstAvg - secondAvg > 0.4) trend_direction = 'declining';

    const trendText: Record<string, string> = {
      improving: 'Your focus trend is improving this week — protect your peak hours for deep work.',
      declining: 'Your focus dipped this week. Try reducing context-switching and adding short breaks.',
      stable: 'Your focus held steady this week. Consistency is a strong foundation to build on.',
    };
    const recommendation_text =
      `${trendText[trend_direction]} Your dominant state was "${dominant_emotion}"` +
      (delay_count >= 3 ? ', and you delayed decisions on several days — try the 10-10-10 rule.' : '.');

    const report = {
      avg_focus: Math.round(avg_focus * 10) / 10,
      delay_count,
      dominant_emotion,
      trend_direction,
      total_checkins: week.length,
      recommendation_text,
    };

    // Persist the weekly report (Database Object: Weekly Report)
    await kv.set(`weekly_report:${userId}:${dateStr(new Date())}`, { ...report, created_at: new Date().toISOString() });

    return c.json({ report });
  } catch (error) {
    console.error('[checkin] weekly error:', error);
    return c.json({ error: 'Failed to generate weekly report', details: String(error) }, 500);
  }
});

export default app;
