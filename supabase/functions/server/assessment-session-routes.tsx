import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js';
import { scoreSession } from './scoring-engine.tsx';
import { logAudit } from './superadmin-routes.tsx';

const CONSENT_VERSION = 'professional-v2-pilot-2026-09';

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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Strips everything a test-taker must never see: construct linkage,
// validation grouping, and risk metadata. This is the actual mechanism
// behind the spec's "hidden construct labels" requirement - leaking any of
// these fields would let someone reverse-engineer which answer maps to
// which construct and defeat manipulation-resistance, which is the entire
// point of this redesign.
function sanitizeItemForDelivery(item: any, optionsInOrder: any[]) {
  return {
    itemType: item.item_type,
    promptText: item.prompt_text,
    timeLimitSeconds: item.time_limit_seconds,
    config: item.config && Object.keys(item.config).length > 0 ? item.config : undefined,
    options: optionsInOrder.map((o) => ({ optionId: o.id, code: o.option_code, text: o.text })),
  };
}

async function loadSessionOwned(supabase: any, sessionId: string, userId: string) {
  const { data: session, error } = await supabase.from('assessment_sessions').select('*').eq('id', sessionId).maybeSingle();
  if (error || !session) return { session: null, forbidden: false };
  if (session.user_id !== userId) return { session: null, forbidden: true };
  return { session, forbidden: false };
}

// ============= START SESSION =============

app.post('/', async (c) => {
  const user = await verifyUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const { assessmentKey, consentGiven } = await c.req.json();
    if (!assessmentKey) return c.json({ error: 'assessmentKey is required' }, 400);
    if (consentGiven !== true) {
      return c.json({ error: 'Consent is required before starting an assessment' }, 400);
    }

    const supabase = getSupabaseClient();
    const { data: assessment, error: aErr } = await supabase
      .from('professional_assessments')
      .select('*')
      .eq('assessment_key', assessmentKey)
      .in('status', ['pilot', 'active'])
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (aErr) return c.json({ error: aErr.message }, 500);
    if (!assessment) return c.json({ error: 'No pilot or active assessment found for that key' }, 404);

    // Idempotency: a network retry (or a client re-issuing "start" after a
    // dropped response) must not spawn a second session. If this user
    // already has a non-terminal session for this exact assessment version,
    // hand that one back instead of materializing a duplicate item sequence.
    const { data: existingSession } = await supabase
      .from('assessment_sessions')
      .select('id, total_items')
      .eq('assessment_id', assessment.id)
      .eq('user_id', user.id)
      .in('status', ['in_progress', 'paused'])
      .maybeSingle();
    if (existingSession) {
      return c.json({ success: true, sessionId: existingSession.id, totalItems: existingSession.total_items, resumed: true });
    }

    const { data: pool, error: pErr } = await supabase
      .from('assessment_item_pools')
      .select('item_id, assessment_items!inner(id, status)')
      .eq('assessment_id', assessment.id)
      .eq('assessment_items.status', 'active');
    if (pErr) return c.json({ error: pErr.message }, 500);
    if (!pool || pool.length === 0) return c.json({ error: 'Assessment has no active items in its pool' }, 400);

    const itemIds = shuffle(pool.map((p: any) => p.item_id));

    const { data: session, error: sErr } = await supabase
      .from('assessment_sessions')
      .insert({
        assessment_id: assessment.id, user_id: user.id, total_items: itemIds.length,
        consent_given: true, consent_version: CONSENT_VERSION,
      })
      .select()
      .single();
    if (sErr) return c.json({ error: sErr.message }, 500);

    // Pre-materialize the full item sequence and each item's per-session
    // option order now, so both stay fixed for the life of the session.
    const { data: allOptions } = await supabase.from('assessment_item_options').select('id, item_id').in('item_id', itemIds);
    const optionsByItem = new Map<string, string[]>();
    (allOptions || []).forEach((o: any) => {
      const list = optionsByItem.get(o.item_id) || [];
      list.push(o.id);
      optionsByItem.set(o.item_id, list);
    });

    const sessionItemRows = itemIds.map((itemId, i) => ({
      session_id: session.id,
      item_id: itemId,
      presentation_order: i,
      option_order: shuffle(optionsByItem.get(itemId) || []),
    }));
    const { error: siErr } = await supabase.from('session_items').insert(sessionItemRows);
    if (siErr) return c.json({ error: siErr.message }, 500);

    return c.json({ success: true, sessionId: session.id, totalItems: itemIds.length });
  } catch (error) {
    console.log(`[assessment-sessions] Error starting session: ${error}`);
    return c.json({ error: 'Failed to start session' }, 500);
  }
});

// ============= SESSION STATUS =============

app.get('/:id', async (c) => {
  const user = await verifyUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const supabase = getSupabaseClient();
  const { session, forbidden } = await loadSessionOwned(supabase, c.req.param('id'), user.id);
  if (forbidden) return c.json({ error: 'Forbidden' }, 403);
  if (!session) return c.json({ error: 'Session not found' }, 404);
  return c.json({
    success: true,
    session: {
      id: session.id, status: session.status,
      currentPosition: session.current_position, totalItems: session.total_items,
      startedAt: session.started_at, completedAt: session.completed_at,
    },
  });
});

// ============= DELETE (WITHDRAWAL / RIGHT TO DELETION) =============
//
// A test-taker can withdraw and erase their own attempt at any time, in or
// out of progress. ON DELETE CASCADE on assessment_sessions' dependents
// (session_items, assessment_responses, behavioural_events,
// simulation state/responses, professional_profiles -> profile_insights)
// means this one delete removes everything derived from the session too.

app.delete('/:id', async (c) => {
  const user = await verifyUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const supabase = getSupabaseClient();
  const { session, forbidden } = await loadSessionOwned(supabase, c.req.param('id'), user.id);
  if (forbidden) return c.json({ error: 'Forbidden' }, 403);
  if (!session) return c.json({ error: 'Session not found' }, 404);

  const { error } = await supabase.from('assessment_sessions').delete().eq('id', session.id);
  if (error) return c.json({ error: error.message }, 500);

  await logAudit(user.id, user.email || '', 'delete_own_assessment_session', { sessionId: session.id, assessmentId: session.assessment_id });
  return c.json({ success: true });
});

// ============= NEXT ITEM =============

app.get('/:id/next', async (c) => {
  const user = await verifyUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const supabase = getSupabaseClient();
  const { session, forbidden } = await loadSessionOwned(supabase, c.req.param('id'), user.id);
  if (forbidden) return c.json({ error: 'Forbidden' }, 403);
  if (!session) return c.json({ error: 'Session not found' }, 404);
  if (session.status === 'completed') return c.json({ success: true, done: true });
  if (session.status !== 'in_progress') return c.json({ error: `Session is ${session.status}, not in progress` }, 400);

  try {
    const { data: sessionItem, error: siErr } = await supabase
      .from('session_items')
      .select('*, assessment_items(*)')
      .eq('session_id', session.id)
      .eq('presentation_order', session.current_position)
      .maybeSingle();
    if (siErr) return c.json({ error: siErr.message }, 500);
    if (!sessionItem) return c.json({ success: true, done: true });

    if (!sessionItem.served_at) {
      await supabase.from('session_items').update({ served_at: new Date().toISOString(), status: 'served' }).eq('id', sessionItem.id);
    }

    // Simulations have no top-level options of their own - their content
    // lives in simulation_stages, delivered via the /simulation sub-routes
    // below. The client should treat isSimulation as a signal to switch
    // into the stage-by-stage flow instead of rendering options directly.
    if (sessionItem.assessment_items.item_type === 'simulation') {
      return c.json({
        success: true, done: false, isSimulation: true,
        sessionItemId: sessionItem.id, position: session.current_position, totalItems: session.total_items,
        item: { itemType: 'simulation', promptText: sessionItem.assessment_items.prompt_text },
      });
    }

    const optionIds: string[] = sessionItem.option_order || [];
    let optionsInOrder: any[] = [];
    if (optionIds.length > 0) {
      const { data: options } = await supabase.from('assessment_item_options').select('*').in('id', optionIds);
      const byId = new Map((options || []).map((o: any) => [o.id, o]));
      optionsInOrder = optionIds.map((id) => byId.get(id)).filter(Boolean);
    }

    return c.json({
      success: true,
      done: false,
      sessionItemId: sessionItem.id,
      position: session.current_position,
      totalItems: session.total_items,
      item: sanitizeItemForDelivery(sessionItem.assessment_items, optionsInOrder),
    });
  } catch (error) {
    console.log(`[assessment-sessions] Error fetching next item: ${error}`);
    return c.json({ error: 'Failed to fetch next item' }, 500);
  }
});

// ============= SUBMIT RESPONSE =============

app.post('/:id/responses', async (c) => {
  const user = await verifyUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const supabase = getSupabaseClient();
  const { session, forbidden } = await loadSessionOwned(supabase, c.req.param('id'), user.id);
  if (forbidden) return c.json({ error: 'Forbidden' }, 403);
  if (!session) return c.json({ error: 'Session not found' }, 404);
  if (session.status !== 'in_progress') return c.json({ error: `Session is ${session.status}, not in progress` }, 400);

  try {
    const { sessionItemId, response } = await c.req.json();
    if (!sessionItemId || response === undefined) {
      return c.json({ error: 'sessionItemId and response are required' }, 400);
    }

    const { data: sessionItem, error: siErr } = await supabase
      .from('session_items')
      .select('*, assessment_items(item_type)')
      .eq('id', sessionItemId)
      .eq('session_id', session.id)
      .maybeSingle();
    if (siErr) return c.json({ error: siErr.message }, 500);
    if (!sessionItem) return c.json({ error: 'Session item not found' }, 404);
    if (sessionItem.presentation_order !== session.current_position) {
      return c.json({ error: 'This is not the current item in the session' }, 400);
    }
    if (sessionItem.assessment_items?.item_type === 'simulation') {
      return c.json({ error: 'This item is a simulation - use the /simulation stage endpoints instead' }, 400);
    }

    const now = new Date();
    const responseTimeMs = sessionItem.served_at ? now.getTime() - new Date(sessionItem.served_at).getTime() : null;

    const { data: existing } = await supabase.from('assessment_responses').select('*').eq('session_item_id', sessionItemId).maybeSingle();

    if (existing) {
      await supabase
        .from('assessment_responses')
        .update({ final_response: response, change_count: existing.change_count + 1, response_time_ms: responseTimeMs, submitted_at: now.toISOString(), updated_at: now.toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase.from('assessment_responses').insert({
        session_id: session.id, session_item_id: sessionItemId,
        initial_response: response, final_response: response,
        response_time_ms: responseTimeMs, submitted_at: now.toISOString(),
      });
    }

    await supabase.from('session_items').update({ status: 'completed', completed_at: now.toISOString() }).eq('id', sessionItemId);

    const nextPosition = session.current_position + 1;
    const isLast = nextPosition >= session.total_items;
    await supabase.from('assessment_sessions').update({ current_position: nextPosition, updated_at: now.toISOString() }).eq('id', session.id);

    return c.json({ success: true, done: isLast });
  } catch (error) {
    console.log(`[assessment-sessions] Error submitting response: ${error}`);
    return c.json({ error: 'Failed to submit response' }, 500);
  }
});

// ============= SIMULATIONS (multi-stage session items) =============

function sanitizeStageForDelivery(stage: any, optionsInOrder: any[]) {
  return {
    stageType: stage.stage_type,
    promptText: stage.prompt_text,
    config: stage.config && Object.keys(stage.config).length > 0 ? stage.config : undefined,
    options: optionsInOrder.map((o) => ({ optionId: o.id, code: o.option_code, text: o.text })),
  };
}

async function loadSimSessionItem(supabase: any, session: any, sessionItemId: string) {
  const { data: sessionItem, error } = await supabase
    .from('session_items')
    .select('*, assessment_items(item_type)')
    .eq('id', sessionItemId)
    .eq('session_id', session.id)
    .maybeSingle();
  if (error || !sessionItem) return { sessionItem: null, error: 'Session item not found' };
  if (sessionItem.assessment_items?.item_type !== 'simulation') return { sessionItem: null, error: 'This session item is not a simulation' };
  if (sessionItem.presentation_order !== session.current_position) return { sessionItem: null, error: 'This is not the current item in the session' };
  return { sessionItem, error: null };
}

app.get('/:id/simulation/:sessionItemId/stage', async (c) => {
  const user = await verifyUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const supabase = getSupabaseClient();
  const { session, forbidden } = await loadSessionOwned(supabase, c.req.param('id'), user.id);
  if (forbidden) return c.json({ error: 'Forbidden' }, 403);
  if (!session) return c.json({ error: 'Session not found' }, 404);

  const { sessionItem, error: loadErr } = await loadSimSessionItem(supabase, session, c.req.param('sessionItemId'));
  if (loadErr) return c.json({ error: loadErr }, 400);

  try {
    let { data: simState } = await supabase.from('session_simulation_state').select('*').eq('session_item_id', sessionItem.id).maybeSingle();
    if (!simState) {
      const { data: firstStage } = await supabase
        .from('simulation_stages').select('id').eq('item_id', sessionItem.item_id).order('stage_order', { ascending: true }).limit(1).maybeSingle();
      if (!firstStage) return c.json({ error: 'Simulation has no stages defined' }, 500);
      const { data: created } = await supabase
        .from('session_simulation_state')
        .insert({ session_item_id: sessionItem.id, current_stage_id: firstStage.id })
        .select().single();
      simState = created;
    }

    if (simState.status === 'completed') return c.json({ success: true, done: true });

    const { data: stage } = await supabase.from('simulation_stages').select('*').eq('id', simState.current_stage_id).single();
    const { data: options } = await supabase.from('simulation_stage_options').select('*').eq('stage_id', stage.id).order('display_order');

    return c.json({
      success: true, done: false, stageId: stage.id,
      stage: sanitizeStageForDelivery(stage, options || []),
    });
  } catch (error) {
    console.log(`[assessment-sessions] Error fetching simulation stage: ${error}`);
    return c.json({ error: 'Failed to fetch simulation stage' }, 500);
  }
});

app.post('/:id/simulation/:sessionItemId/stage-response', async (c) => {
  const user = await verifyUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const supabase = getSupabaseClient();
  const { session, forbidden } = await loadSessionOwned(supabase, c.req.param('id'), user.id);
  if (forbidden) return c.json({ error: 'Forbidden' }, 403);
  if (!session) return c.json({ error: 'Session not found' }, 404);

  const { sessionItem, error: loadErr } = await loadSimSessionItem(supabase, session, c.req.param('sessionItemId'));
  if (loadErr) return c.json({ error: loadErr }, 400);

  try {
    const { stageId, response } = await c.req.json();
    if (!stageId || response === undefined) return c.json({ error: 'stageId and response are required' }, 400);

    const { data: simState } = await supabase.from('session_simulation_state').select('*').eq('session_item_id', sessionItem.id).maybeSingle();
    if (!simState) return c.json({ error: 'Simulation has not been started' }, 400);
    if (simState.current_stage_id !== stageId) return c.json({ error: 'This is not the current stage' }, 400);

    const { data: stage } = await supabase.from('simulation_stages').select('*').eq('id', stageId).single();
    const now = new Date();

    await supabase.from('simulation_stage_responses').upsert(
      { session_item_id: sessionItem.id, stage_id: stageId, response, submitted_at: now.toISOString() },
      { onConflict: 'session_item_id, stage_id' }
    );

    // Resolve the next stage: the chosen option's next_stage_key overrides
    // the default stage_order progression, if set.
    const { data: options } = await supabase.from('simulation_stage_options').select('*').eq('stage_id', stageId);
    const chosen = (options || []).find((o: any) => o.option_code === response.optionCode);
    let nextStage: any = null;

    if (chosen?.next_stage_key) {
      const { data } = await supabase.from('simulation_stages').select('*').eq('item_id', stage.item_id).eq('stage_key', chosen.next_stage_key).maybeSingle();
      nextStage = data;
    } else {
      const { data } = await supabase
        .from('simulation_stages').select('*').eq('item_id', stage.item_id)
        .gt('stage_order', stage.stage_order).order('stage_order', { ascending: true }).limit(1).maybeSingle();
      nextStage = data;
    }

    if (nextStage) {
      await supabase.from('session_simulation_state').update({ current_stage_id: nextStage.id }).eq('id', simState.id);
      return c.json({ success: true, done: false });
    }

    // No next stage: the simulation itself is complete, which completes the
    // top-level session_item and advances the outer session - same
    // bookkeeping as a plain item's POST /:id/responses.
    await supabase.from('session_simulation_state').update({ status: 'completed', completed_at: now.toISOString() }).eq('id', simState.id);
    await supabase.from('session_items').update({ status: 'completed', completed_at: now.toISOString() }).eq('id', sessionItem.id);
    const nextPosition = session.current_position + 1;
    const isLast = nextPosition >= session.total_items;
    await supabase.from('assessment_sessions').update({ current_position: nextPosition, updated_at: now.toISOString() }).eq('id', session.id);

    return c.json({ success: true, done: true, sessionDone: isLast });
  } catch (error) {
    console.log(`[assessment-sessions] Error submitting stage response: ${error}`);
    return c.json({ error: 'Failed to submit stage response' }, 500);
  }
});

// ============= PAUSE / RESUME / COMPLETE =============

app.post('/:id/pause', async (c) => {
  const user = await verifyUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const supabase = getSupabaseClient();
  const { session, forbidden } = await loadSessionOwned(supabase, c.req.param('id'), user.id);
  if (forbidden) return c.json({ error: 'Forbidden' }, 403);
  if (!session) return c.json({ error: 'Session not found' }, 404);
  if (session.status !== 'in_progress') return c.json({ error: `Cannot pause a session that is ${session.status}` }, 400);
  await supabase.from('assessment_sessions').update({ status: 'paused', paused_at: new Date().toISOString() }).eq('id', session.id);
  return c.json({ success: true });
});

app.post('/:id/resume', async (c) => {
  const user = await verifyUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const supabase = getSupabaseClient();
  const { session, forbidden } = await loadSessionOwned(supabase, c.req.param('id'), user.id);
  if (forbidden) return c.json({ error: 'Forbidden' }, 403);
  if (!session) return c.json({ error: 'Session not found' }, 404);
  if (session.status !== 'paused') return c.json({ error: `Cannot resume a session that is ${session.status}` }, 400);
  await supabase.from('assessment_sessions').update({ status: 'in_progress', updated_at: new Date().toISOString() }).eq('id', session.id);
  return c.json({ success: true });
});

app.post('/:id/complete', async (c) => {
  const user = await verifyUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const supabase = getSupabaseClient();
  const { session, forbidden } = await loadSessionOwned(supabase, c.req.param('id'), user.id);
  if (forbidden) return c.json({ error: 'Forbidden' }, 403);
  if (!session) return c.json({ error: 'Session not found' }, 404);
  if (session.status === 'completed') return c.json({ success: true, alreadyCompleted: true });

  const { count } = await supabase
    .from('session_items')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', session.id)
    .neq('status', 'completed');
  if ((count || 0) > 0) {
    return c.json({ error: `${count} item(s) still incomplete` }, 400);
  }

  await supabase.from('assessment_sessions').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', session.id);

  // Structured profile assembly and AI interpretation are Sprint 6 - this
  // runs the scoring engine (signals -> construct/domain evidence +
  // confidence) but does not publish anything narrative.
  const scoringResult = await scoreSession(session.id);
  if (!scoringResult.success) {
    console.log(`[assessment-sessions] Scoring failed for session ${session.id}: ${scoringResult.error}`);
    return c.json({ success: true, scoringError: scoringResult.error });
  }

  return c.json({ success: true });
});

// ============= RESULTS (construct/domain evidence - Sprint 4 output) =============

app.get('/:id/results', async (c) => {
  const user = await verifyUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const supabase = getSupabaseClient();
  const { session, forbidden } = await loadSessionOwned(supabase, c.req.param('id'), user.id);
  if (forbidden) return c.json({ error: 'Forbidden' }, 403);
  if (!session) return c.json({ error: 'Session not found' }, 404);
  if (session.status !== 'completed') return c.json({ error: 'Session is not completed yet' }, 400);

  const { data: constructResults, error: crErr } = await supabase
    .from('construct_results')
    .select('*, assessment_constructs(name, construct_key, definition)')
    .eq('session_id', session.id);
  if (crErr) return c.json({ error: crErr.message }, 500);

  const { data: domainResults, error: drErr } = await supabase
    .from('domain_results')
    .select('*, assessment_domains(name, domain_key)')
    .eq('session_id', session.id);
  if (drErr) return c.json({ error: drErr.message }, 500);

  return c.json({ success: true, constructResults, domainResults });
});

// ============= BEHAVIOURAL EVENTS =============
//
// Fine-grained interaction log (viewed/selected/changed/opened/ranked/
// reallocated/simulation_stage), distinct from assessment_responses'
// change_count aggregate. Batched because these are frequent, client-side
// UI interactions (hovering, reordering, opening an information panel) -
// one HTTP round-trip per event would be impractical. The client is
// expected to buffer and flush periodically; malformed events in a batch
// are skipped rather than failing the whole batch, since losing one stray
// event matters far less than losing an entire flush over one bad row.

const VALID_EVENT_TYPES = ['viewed', 'selected', 'changed', 'opened', 'ranked', 'reallocated', 'simulation_stage'];
const MAX_EVENTS_PER_BATCH = 200;

app.post('/:id/events', async (c) => {
  const user = await verifyUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const supabase = getSupabaseClient();
  const { session, forbidden } = await loadSessionOwned(supabase, c.req.param('id'), user.id);
  if (forbidden) return c.json({ error: 'Forbidden' }, 403);
  if (!session) return c.json({ error: 'Session not found' }, 404);

  try {
    const { events } = await c.req.json();
    if (!Array.isArray(events) || events.length === 0) {
      return c.json({ error: 'events (non-empty array) is required' }, 400);
    }
    if (events.length > MAX_EVENTS_PER_BATCH) {
      return c.json({ error: `Cannot submit more than ${MAX_EVENTS_PER_BATCH} events per batch` }, 400);
    }

    // Session items referenced must actually belong to this session, so a
    // client can't attribute events to another user's session_item.
    const { data: ownItems } = await supabase.from('session_items').select('id').eq('session_id', session.id);
    const ownItemIds = new Set((ownItems || []).map((i: any) => i.id));

    const rows: any[] = [];
    const skipped: any[] = [];
    for (const e of events) {
      const valid =
        e && VALID_EVENT_TYPES.includes(e.eventType) && e.clientTimestamp && Number.isInteger(e.clientSequence) &&
        (e.sessionItemId === undefined || e.sessionItemId === null || ownItemIds.has(e.sessionItemId));
      if (!valid) {
        skipped.push(e);
        continue;
      }
      rows.push({
        session_id: session.id,
        session_item_id: e.sessionItemId || null,
        event_type: e.eventType,
        event_value: e.eventValue || {},
        client_timestamp: e.clientTimestamp,
        client_sequence: e.clientSequence,
      });
    }

    if (rows.length > 0) {
      const { error } = await supabase.from('behavioural_events').insert(rows);
      if (error) return c.json({ error: error.message }, 500);
    }

    return c.json({ success: true, accepted: rows.length, skipped: skipped.length });
  } catch (error) {
    console.log(`[assessment-sessions] Error recording events: ${error}`);
    return c.json({ error: 'Failed to record events' }, 500);
  }
});

export default app;
