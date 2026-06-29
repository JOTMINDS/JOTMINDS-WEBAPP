import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { verifyAuth } from './auth-helpers.tsx';

const app = new Hono();

// The 10 Role Cognitive Profile dimensions (RC-ID), scored 1-5.
const DIMS = [
  'analytical_depth',
  'ambiguity_tolerance',
  'emotional_labor',
  'decision_speed',
  'stakeholder_complexity',
  'innovation_vs_repetition',
  'social_exposure',
  'detail_sensitivity',
  'autonomy',
  'cognitive_load_volatility',
] as const;
type Dim = typeof DIMS[number];

// Human-readable labels for risk flags / gap map.
const LABEL: Record<Dim, string> = {
  analytical_depth: 'Analytical Depth',
  ambiguity_tolerance: 'Ambiguity Tolerance',
  emotional_labor: 'Emotional Labor',
  decision_speed: 'Decision Speed',
  stakeholder_complexity: 'Stakeholder Complexity',
  innovation_vs_repetition: 'Innovation',
  social_exposure: 'Social Exposure',
  detail_sensitivity: 'Detail Sensitivity',
  autonomy: 'Autonomy',
  cognitive_load_volatility: 'Cognitive Load',
};

// Map assessment trait keywords -> role dimension they inform.
const TRAIT_TO_DIM: Record<string, Dim> = {
  analytical: 'analytical_depth',
  logic: 'analytical_depth',
  abstract: 'analytical_depth',
  reflective: 'detail_sensitivity',
  creative: 'innovation_vs_repetition',
  imaginative: 'innovation_vs_repetition',
  intuitive: 'decision_speed',
  practical: 'social_exposure',
  active: 'decision_speed',
};

function fitCategory(score: number): string {
  if (score >= 85) return 'Natural Accelerator';
  if (score >= 70) return 'Strong Alignment';
  if (score >= 55) return 'Adaptable Fit';
  if (score >= 40) return 'Strain Risk';
  return 'Misalignment Risk';
}

// Build the candidate cognitive profile (1-5 per dim) from assessment results.
async function buildCandidate(userId: string): Promise<{ candidate: Record<Dim, number>; hasData: boolean }> {
  const results = await kv.getByPrefix(`result:${userId}:`);
  // Merge all numeric scores (0-10) keyed by lowercased trait name.
  const traitScores: Record<string, number[]> = {};
  for (const r of results) {
    const scores = r?.results?.scores ?? r?.scores;
    if (scores && typeof scores === 'object') {
      for (const [k, v] of Object.entries(scores)) {
        const n = Number(v);
        if (!Number.isNaN(n)) {
          const key = k.toLowerCase();
          (traitScores[key] ??= []).push(n);
        }
      }
    }
  }
  const hasData = Object.keys(traitScores).length > 0;
  const avg = (arr: number[]) => arr.reduce((s, x) => s + x, 0) / arr.length;

  // baseline competence (1-5) from the overall average across all traits
  const allVals = Object.values(traitScores).flat();
  const baseline = hasData ? (avg(allVals) / 10) * 4 + 1 : 3;

  const candidate = {} as Record<Dim, number>;
  for (const d of DIMS) candidate[d] = baseline;

  // adjust specific dims where we have a matching trait
  for (const [trait, scoreArr] of Object.entries(traitScores)) {
    for (const [kw, dim] of Object.entries(TRAIT_TO_DIM)) {
      if (trait.includes(kw)) {
        candidate[dim] = (avg(scoreArr) / 10) * 4 + 1;
      }
    }
  }
  // clamp 1-5
  for (const d of DIMS) candidate[d] = Math.max(1, Math.min(5, Math.round(candidate[d] * 10) / 10));
  return { candidate, hasData };
}

// ── POST /role-fit/calculate ─────────────────────────────────────────────────
app.post('/calculate', async (c) => {
  try {
    const authedUser = await verifyAuth(c.req.raw);
    if (!authedUser) return c.json({ error: 'Unauthorized' }, 401);
    const user_id = authedUser.id; // derive from token

    const body = await c.req.json();
    const { role_name, role_demands } = body;
    if (!role_demands) {
      return c.json({ error: 'role_demands are required' }, 400);
    }

    const { candidate, hasData } = await buildCandidate(user_id);

    // Compute shortfall-weighted fit score.
    let shortfallSum = 0;
    const gap_map: Record<string, number> = {};
    const risk_flags: string[] = [];

    for (const d of DIMS) {
      const demand = Math.max(1, Math.min(5, Number(role_demands[d] ?? 3)));
      const cand = candidate[d];
      const gap = Math.round((cand - demand) * 10) / 10; // negative = below role demand
      gap_map[d] = gap;
      const shortfall = Math.max(0, demand - cand);
      shortfallSum += shortfall;
      if (demand >= 4 && cand <= 2.5) {
        risk_flags.push(`${LABEL[d]}: role demands more than your current profile — expect strain here.`);
      }
    }

    // max possible shortfall = 4 per dim * 10 dims = 40 -> score 0..100
    const fit_score = Math.round(Math.max(0, Math.min(100, 100 - (shortfallSum / 40) * 100)));
    const fit_category = fitCategory(fit_score);

    if (!hasData) {
      risk_flags.unshift('No completed assessment found — fit is estimated from a neutral baseline. Take an assessment for an accurate match.');
    }

    const result = {
      fit_id: `${user_id}_${Date.now()}`,
      candidate_id: user_id,
      role_name: role_name ?? 'Custom Role',
      fit_score,
      fit_category,
      risk_flags,
      gap_map,
      candidate,
      role_demands,
      created_at: new Date().toISOString(),
    };

    await kv.set(`role_fit:${user_id}:${Date.now()}`, result);
    return c.json({ success: true, result });
  } catch (error) {
    console.error('[role-fit] calculate error:', error);
    return c.json({ error: 'Failed to calculate role fit', details: String(error) }, 500);
  }
});

// ── GET /role-fit/history/:userId ────────────────────────────────────────────
app.get('/history/:userId', async (c) => {
  try {
    const authedUser = await verifyAuth(c.req.raw);
    if (!authedUser) return c.json({ error: 'Unauthorized' }, 401);
    const userId = authedUser.id;
    const all = await kv.getByPrefix(`role_fit:${userId}:`);
    const history = all.sort((a: any, b: any) => (a.created_at < b.created_at ? 1 : -1));
    return c.json({ history });
  } catch (error) {
    console.error('[role-fit] history error:', error);
    return c.json({ error: 'Failed to load role fit history', details: String(error) }, 500);
  }
});

export default app;
