import { createClient } from 'npm:@supabase/supabase-js';

const getSupabaseClient = () => {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
};

const SCORING_VERSION = 1;

// Confidence heuristic - explicitly a starting point, not a calibrated
// model. The spec itself calls every Part V mapping a "provisional pilot
// hypothesis pending expert review and empirical calibration"; this is the
// same kind of placeholder, documented as such rather than presented as
// psychometrically validated. Contradictory evidence downgrades confidence
// by one level rather than zeroing it out or touching capability_level -
// "contradictory evidence primarily reduces confidence; it does not
// automatically lower capability" (spec Cross-Validation Rules).
function computeConfidence(evidenceCount: number, contradictingCount: number): 'low' | 'moderate' | 'high' {
  let level: 'low' | 'moderate' | 'high';
  if (evidenceCount >= 3) level = 'high';
  else if (evidenceCount >= 2) level = 'moderate';
  else level = 'low';

  if (contradictingCount > 0) {
    if (level === 'high') level = 'moderate';
    else level = 'low';
  }
  return level;
}

// capability_level thresholds are similarly a documented placeholder, not a
// calibrated model - see comment above.
function computeCapabilityLevel(totalEvidenceValue: number, evidenceCount: number): 'insufficient' | 'emerging' | 'moderate' | 'strong' {
  if (evidenceCount === 0) return 'insufficient';
  const avg = totalEvidenceValue / evidenceCount;
  if (avg >= 1.5) return 'strong';
  if (avg >= 0.5) return 'moderate';
  return 'emerging';
}

interface ItemResponseMatch {
  itemId: string;
  constructIds: string[];
  validationGroup: string | null;
  responseId: string;
  matchedSignalId: string | null;  // dominant/matched signal for this item, if any
  matchedSignalKey: string | null;
  rawValue: any;                    // e.g. slider value, for meta constructs
}

export async function scoreSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const { data: sessionItems, error: siErr } = await supabase
    .from('session_items')
    .select('id, item_id, assessment_items(id, construct_ids, validation_group)')
    .eq('session_id', sessionId);
  if (siErr) return { success: false, error: siErr.message };
  if (!sessionItems || sessionItems.length === 0) return { success: false, error: 'No session items found' };

  const { data: responses, error: rErr } = await supabase
    .from('assessment_responses')
    .select('id, session_item_id, final_response')
    .eq('session_id', sessionId);
  if (rErr) return { success: false, error: rErr.message };
  const responseBySessionItem = new Map((responses || []).map((r: any) => [r.session_item_id, r]));

  const itemIds = sessionItems.map((si: any) => si.item_id);
  const { data: mappings, error: mErr } = await supabase
    .from('item_signal_mappings')
    .select('*, assessment_signals(id, signal_key, construct_id, signal_type)')
    .in('item_id', itemIds);
  if (mErr) return { success: false, error: mErr.message };

  const mappingsByItem = new Map<string, any[]>();
  (mappings || []).forEach((m: any) => {
    const list = mappingsByItem.get(m.item_id) || [];
    list.push(m);
    mappingsByItem.set(m.item_id, list);
  });

  const matches: ItemResponseMatch[] = [];
  const responseSignalRows: any[] = [];

  for (const si of sessionItems) {
    const item = (si as any).assessment_items;
    const response = responseBySessionItem.get(si.id);
    if (!item || !response) continue;

    const itemMappings = mappingsByItem.get(item.id) || [];
    let matchedSignalId: string | null = null;
    let matchedSignalKey: string | null = null;
    let rawValue: any = null;

    for (const mapping of itemMappings) {
      const cond = mapping.response_condition || {};
      const resp = response.final_response || {};
      let isMatch = false;
      if (cond.sliderIdentity === true) {
        isMatch = true;
        rawValue = resp.value ?? null;
      } else if (cond.optionCode !== undefined) {
        isMatch = resp.optionCode === cond.optionCode;
      }
      if (isMatch) {
        matchedSignalId = mapping.signal_id;
        matchedSignalKey = mapping.assessment_signals?.signal_key || null;
        responseSignalRows.push({
          response_id: response.id, signal_id: mapping.signal_id,
          evidence_value: mapping.evidence_value, scoring_version: SCORING_VERSION,
        });
        break; // one condition should match per response for these item types
      }
    }

    matches.push({
      itemId: item.id, constructIds: item.construct_ids || [],
      validationGroup: item.validation_group || null,
      responseId: response.id, matchedSignalId, matchedSignalKey, rawValue,
    });
  }

  if (responseSignalRows.length > 0) {
    await supabase.from('response_signals').delete().in('response_id', responseSignalRows.map((r) => r.response_id));
    const { error: insErr } = await supabase.from('response_signals').insert(responseSignalRows);
    if (insErr) return { success: false, error: insErr.message };
  }

  // Group matches by construct.
  const byConstruct = new Map<string, ItemResponseMatch[]>();
  matches.forEach((m) => {
    m.constructIds.forEach((cid) => {
      const list = byConstruct.get(cid) || [];
      list.push(m);
      byConstruct.set(cid, list);
    });
  });

  // Include every construct any pool item maps to, even with zero evidence
  // in this particular session, so "insufficient evidence" is explicit
  // rather than the construct silently not appearing.
  const { data: allConstructs } = await supabase.from('assessment_constructs').select('id, domain_id, construct_type');
  const constructById = new Map((allConstructs || []).map((c: any) => [c.id, c]));
  const relevantConstructIds = new Set<string>([...byConstruct.keys()]);
  matches.forEach((m) => m.constructIds.forEach((cid) => relevantConstructIds.add(cid)));

  const constructResultRows: any[] = [];

  for (const constructId of relevantConstructIds) {
    const construct = constructById.get(constructId);
    if (!construct) continue;
    const constructMatches = byConstruct.get(constructId) || [];
    const evidenceCount = constructMatches.length;

    // Cross-validation: among the items that contributed evidence to this
    // construct, compare pairs sharing a validation_group.
    let supportingCount = 0;
    let contradictingCount = 0;
    for (let i = 0; i < constructMatches.length; i++) {
      for (let j = i + 1; j < constructMatches.length; j++) {
        const a = constructMatches[i], b = constructMatches[j];
        if (a.validationGroup && a.validationGroup === b.validationGroup) {
          if (a.matchedSignalKey && a.matchedSignalKey === b.matchedSignalKey) supportingCount++;
          else contradictingCount++;
        }
      }
    }

    const confidence = computeConfidence(evidenceCount, contradictingCount);

    if (construct.construct_type === 'meta') {
      const values = constructMatches.map((m) => m.rawValue).filter((v) => v !== null && v !== undefined);
      constructResultRows.push({
        session_id: sessionId, construct_id: constructId, construct_type: construct.construct_type,
        meta_value: { values }, evidence_count: evidenceCount,
        supporting_count: supportingCount, contradicting_count: contradictingCount,
        confidence, scoring_version: SCORING_VERSION,
      });
    } else if (construct.construct_type === 'capability') {
      const totalValue = constructMatches.reduce((sum, m) => sum + (m.matchedSignalId ? 1 : 0), 0);
      constructResultRows.push({
        session_id: sessionId, construct_id: constructId, construct_type: construct.construct_type,
        capability_level: computeCapabilityLevel(totalValue, evidenceCount), evidence_count: evidenceCount,
        supporting_count: supportingCount, contradicting_count: contradictingCount,
        confidence, scoring_version: SCORING_VERSION,
      });
    } else {
      // preference / behavioral: tally which signal won.
      const tally = new Map<string, number>();
      constructMatches.forEach((m) => {
        if (m.matchedSignalKey) tally.set(m.matchedSignalKey, (tally.get(m.matchedSignalKey) || 0) + 1);
      });
      let topSignal: string | null = null;
      let topCount = -1;
      tally.forEach((count, key) => { if (count > topCount) { topCount = count; topSignal = key; } });
      constructResultRows.push({
        session_id: sessionId, construct_id: constructId, construct_type: construct.construct_type,
        preference_signal_key: topSignal, preference_summary: Object.fromEntries(tally),
        evidence_count: evidenceCount, supporting_count: supportingCount, contradicting_count: contradictingCount,
        confidence, scoring_version: SCORING_VERSION,
      });
    }
  }

  if (constructResultRows.length > 0) {
    const { error: crErr } = await supabase
      .from('construct_results')
      .upsert(constructResultRows, { onConflict: 'session_id, construct_id' });
    if (crErr) return { success: false, error: crErr.message };
  }

  // Domain results: group the just-computed construct results by domain.
  const byDomain = new Map<string, any[]>();
  constructResultRows.forEach((cr) => {
    const construct = constructById.get(cr.construct_id);
    if (!construct) return;
    const list = byDomain.get(construct.domain_id) || [];
    list.push(cr);
    byDomain.set(construct.domain_id, list);
  });

  const confidenceRank = { low: 0, moderate: 1, high: 2 };
  const domainResultRows: any[] = [];
  byDomain.forEach((constructs, domainId) => {
    const withEvidence = constructs.filter((c) => c.evidence_count > 0);
    const domainConfidence = withEvidence.length === 0
      ? 'low'
      : withEvidence.reduce((min, c) => (confidenceRank[c.confidence as keyof typeof confidenceRank] < confidenceRank[min as keyof typeof confidenceRank] ? c.confidence : min), 'high');
    domainResultRows.push({
      session_id: sessionId, domain_id: domainId,
      summary: { constructCount: constructs.length, withEvidenceCount: withEvidence.length },
      confidence: domainConfidence, scoring_version: SCORING_VERSION,
    });
  });

  if (domainResultRows.length > 0) {
    const { error: drErr } = await supabase
      .from('domain_results')
      .upsert(domainResultRows, { onConflict: 'session_id, domain_id' });
    if (drErr) return { success: false, error: drErr.message };
  }

  return { success: true };
}
