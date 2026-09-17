import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js';
import { logAiUsage } from './superadmin-routes.tsx';

const app = new Hono();

const getSupabaseClient = () => {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
};

async function verifyUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const SCORING_VERSION = 1;
const INTERPRETATION_VERSION = 1;

const confidenceRank: Record<string, number> = { low: 0, moderate: 1, high: 2 };

// ============= STRUCTURED PROFILE ASSEMBLY (no AI) =============
//
// Assembled entirely from construct_results/domain_results (Sprint 4
// output). This is the "profile exists independently of AI narrative"
// property - everything here is deterministic and was already computed
// and stored before this function runs.
async function assembleStructuredProfile(supabase: any, sessionId: string) {
  const { data: constructResults, error: crErr } = await supabase
    .from('construct_results')
    .select('*, assessment_constructs(construct_key, name, definition, domain_id)')
    .eq('session_id', sessionId);
  if (crErr) throw new Error(crErr.message);

  const { data: domainResults, error: drErr } = await supabase
    .from('domain_results')
    .select('*, assessment_domains(domain_key, name)')
    .eq('session_id', sessionId);
  if (drErr) throw new Error(drErr.message);

  const domains = (domainResults || []).map((dr: any) => ({
    domainKey: dr.assessment_domains?.domain_key,
    name: dr.assessment_domains?.name,
    domainId: dr.domain_id,
    confidence: dr.confidence,
    constructs: (constructResults || [])
      .filter((cr: any) => cr.assessment_constructs?.domain_id === dr.domain_id)
      .map((cr: any) => ({
        constructKey: cr.assessment_constructs?.construct_key,
        name: cr.assessment_constructs?.name,
        constructId: cr.construct_id,
        constructType: cr.construct_type,
        preferenceSignalKey: cr.preference_signal_key,
        preferenceSummary: cr.preference_summary,
        capabilityLevel: cr.capability_level,
        metaValue: cr.meta_value,
        evidenceCount: cr.evidence_count,
        supportingCount: cr.supporting_count,
        contradictingCount: cr.contradicting_count,
        confidence: cr.confidence,
      })),
  }));

  const withEvidence = domains.filter((d: any) => d.constructs.some((c: any) => c.evidenceCount > 0));
  const overallConfidence = withEvidence.length === 0
    ? 'low'
    : withEvidence.reduce((min: string, d: any) => (confidenceRank[d.confidence] < confidenceRank[min] ? d.confidence : min), 'high');

  return { domains, overallConfidence };
}

// ============= AI INTERPRETATION =============
//
// The AI Contract (spec Part IV): the model receives the structured
// profile only - never raw item content or raw responses - and may
// generate narrative, blind spots, and development language, but cannot
// alter scores, invent constructs, or make hiring/fit decisions. Enforced
// two ways: (1) the prompt only ever serializes domainKey/constructKey
// values that already exist in the structured profile, and explicitly
// forbids fabricating new ones or recommending for/against hiring; (2)
// every domainKey/constructKey the model references in its response is
// validated against the known set afterward - anything that doesn't match
// is dropped rather than trusted.
async function generateInterpretation(structuredProfile: any): Promise<{
  domainNarratives: { domainKey: string; text: string }[];
  blindSpots: { constructKeys: string[]; text: string }[];
  developmentPriorities: { constructKeys: string[]; text: string }[];
} | null> {
  if (!OPENAI_API_KEY) return null;

  const knownDomainKeys = new Set(structuredProfile.domains.map((d: any) => d.domainKey));
  const knownConstructKeys = new Set(structuredProfile.domains.flatMap((d: any) => d.constructs.map((c: any) => c.constructKey)));

  const systemPrompt = `You are the JotMinds Professional Intelligence interpreter. You explain an ALREADY-COMPUTED structured profile in plain, professional language.

Hard rules:
- Only reference domainKey and constructKey values that appear in the data provided. Never invent a domain or construct that isn't listed.
- Never change, imply, or restate a numeric score or confidence level differently than given.
- Never make a hiring, promotion, fit, or suitability recommendation of any kind. You explain patterns; you do not decide about a person.
- Low-confidence or zero-evidence constructs should be described as areas where more evidence is needed, not as weaknesses.
- Blind spots means a strength that may be overused or a low-confidence gap worth being aware of - not a criticism.

Respond with strict JSON matching exactly this shape:
{
  "domainNarratives": [{ "domainKey": "...", "text": "2-3 sentence plain-language summary of this domain's pattern" }],
  "blindSpots": [{ "constructKeys": ["..."], "text": "1-2 sentences" }],
  "developmentPriorities": [{ "constructKeys": ["..."], "text": "1-2 sentences, practical and specific" }]
}
Provide 2-3 development priorities total, and 0-2 blind spots (omit if nothing is genuinely notable).`;

  const userPrompt = `Structured profile data:\n${JSON.stringify(structuredProfile)}`;

  const start = Date.now();
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      await logAiUsage({ endpoint: '/professional-profile/interpret', model: 'gpt-4o-mini', latencyMs: Date.now() - start, success: false, error: err });
      return null;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      await logAiUsage({ endpoint: '/professional-profile/interpret', model: 'gpt-4o-mini', latencyMs: Date.now() - start, success: false, error: 'Empty AI response' });
      return null;
    }

    await logAiUsage({
      endpoint: '/professional-profile/interpret', model: 'gpt-4o-mini',
      promptTokens: data.usage?.prompt_tokens, completionTokens: data.usage?.completion_tokens, totalTokens: data.usage?.total_tokens,
      latencyMs: Date.now() - start, success: true,
    });

    const parsed = JSON.parse(text);

    // Validate: drop anything referencing a domain/construct key that
    // doesn't actually exist in the structured profile.
    const domainNarratives = (parsed.domainNarratives || []).filter((d: any) => knownDomainKeys.has(d.domainKey));
    const filterConstructKeys = (item: any) => ({ ...item, constructKeys: (item.constructKeys || []).filter((k: string) => knownConstructKeys.has(k)) });
    const blindSpots = (parsed.blindSpots || []).map(filterConstructKeys).filter((b: any) => b.constructKeys.length > 0);
    const developmentPriorities = (parsed.developmentPriorities || []).map(filterConstructKeys).filter((d: any) => d.constructKeys.length > 0);

    return { domainNarratives, blindSpots, developmentPriorities };
  } catch (error: any) {
    await logAiUsage({ endpoint: '/professional-profile/interpret', model: 'gpt-4o-mini', latencyMs: Date.now() - start, success: false, error: error.message });
    return null;
  }
}

// ============= ENDPOINTS =============

app.post('/:sessionId/profile', async (c) => {
  const user = await verifyUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const supabase = getSupabaseClient();
  const sessionId = c.req.param('sessionId');

  const { data: session, error: sErr } = await supabase.from('assessment_sessions').select('*').eq('id', sessionId).maybeSingle();
  if (sErr || !session) return c.json({ error: 'Session not found' }, 404);
  if (session.user_id !== user.id) return c.json({ error: 'Forbidden' }, 403);
  if (session.status !== 'completed') return c.json({ error: 'Session is not completed yet' }, 400);

  try {
    const structuredProfile = await assembleStructuredProfile(supabase, sessionId);

    const { data: profile, error: upErr } = await supabase
      .from('professional_profiles')
      .upsert({
        session_id: sessionId, user_id: user.id, scoring_version: SCORING_VERSION,
        overall_confidence: structuredProfile.overallConfidence,
        structured_summary: structuredProfile, status: 'interpreting', updated_at: new Date().toISOString(),
      }, { onConflict: 'session_id' })
      .select().single();
    if (upErr) return c.json({ error: upErr.message }, 500);

    // Structured profile is already saved and valid at this point - AI
    // interpretation failing below does not remove or invalidate it.
    const interpretation = await generateInterpretation(structuredProfile);

    if (!interpretation) {
      await supabase.from('professional_profiles').update({ status: 'interpretation_failed', updated_at: new Date().toISOString() }).eq('id', profile.id);
      return c.json({ success: true, profile: { ...profile, status: 'interpretation_failed' }, insights: [] });
    }

    const domainByKey = new Map(structuredProfile.domains.map((d: any) => [d.domainKey, d]));
    const constructIdByKey = new Map(structuredProfile.domains.flatMap((d: any) => d.constructs.map((c: any) => [c.constructKey, c.constructId])));

    const insightRows: any[] = [];
    interpretation.domainNarratives.forEach((n) => {
      insightRows.push({
        profile_id: profile.id, insight_type: 'domain_narrative',
        domain_id: domainByKey.get(n.domainKey)?.domainId || null,
        construct_ids: [], structured_evidence: { domainKey: n.domainKey },
        generated_text: n.text, interpretation_version: INTERPRETATION_VERSION,
      });
    });
    interpretation.blindSpots.forEach((b) => {
      insightRows.push({
        profile_id: profile.id, insight_type: 'blind_spot',
        construct_ids: b.constructKeys.map((k: string) => constructIdByKey.get(k)).filter(Boolean),
        structured_evidence: { constructKeys: b.constructKeys },
        generated_text: b.text, interpretation_version: INTERPRETATION_VERSION,
      });
    });
    interpretation.developmentPriorities.forEach((d) => {
      insightRows.push({
        profile_id: profile.id, insight_type: 'development_priority',
        construct_ids: d.constructKeys.map((k: string) => constructIdByKey.get(k)).filter(Boolean),
        structured_evidence: { constructKeys: d.constructKeys },
        generated_text: d.text, interpretation_version: INTERPRETATION_VERSION,
      });
    });

    await supabase.from('profile_insights').delete().eq('profile_id', profile.id);
    if (insightRows.length > 0) await supabase.from('profile_insights').insert(insightRows);

    await supabase.from('professional_profiles').update({ status: 'interpreted', interpretation_version: INTERPRETATION_VERSION, updated_at: new Date().toISOString() }).eq('id', profile.id);

    return c.json({ success: true, profile: { ...profile, status: 'interpreted' }, insights: insightRows });
  } catch (error: any) {
    console.log(`[professional-profile] Error: ${error}`);
    return c.json({ error: error.message || 'Failed to generate profile' }, 500);
  }
});

app.get('/:sessionId/profile', async (c) => {
  const user = await verifyUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const supabase = getSupabaseClient();
  const sessionId = c.req.param('sessionId');

  const { data: profile, error: pErr } = await supabase.from('professional_profiles').select('*').eq('session_id', sessionId).maybeSingle();
  if (pErr) return c.json({ error: pErr.message }, 500);
  if (!profile) return c.json({ error: 'Profile not found - generate it first with POST' }, 404);
  if (profile.user_id !== user.id) return c.json({ error: 'Forbidden' }, 403);

  const { data: insights } = await supabase.from('profile_insights').select('*').eq('profile_id', profile.id);
  return c.json({ success: true, profile, insights: insights || [] });
});

export default app;
