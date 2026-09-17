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
  sourceType: 'item' | 'stage';
  constructIds: string[];
  validationGroup: string | null;
  responseId: string;               // assessment_responses.id or simulation_stage_responses.id, per sourceType
  matchedSignalId: string | null;  // dominant/matched signal for this item/stage, if any
  matchedSignalKey: string | null;
  matchedEvidenceValue: number | null;
  rawValue: any;                    // e.g. slider value, for meta constructs
}

function matchCondition(cond: any, resp: any): { isMatch: boolean; rawValue: any } {
  if (cond.sliderIdentity === true) return { isMatch: true, rawValue: resp.value ?? null };
  if (cond.optionCode !== undefined) return { isMatch: resp.optionCode === cond.optionCode, rawValue: null };
  return { isMatch: false, rawValue: null };
}

export async function scoreSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const { data: sessionItems, error: siErr } = await supabase
    .from('session_items')
    .select('id, item_id, assessment_items(id, item_type, construct_ids, validation_group)')
    .eq('session_id', sessionId);
  if (siErr) return { success: false, error: siErr.message };
  if (!sessionItems || sessionItems.length === 0) return { success: false, error: 'No session items found' };

  const matches: ItemResponseMatch[] = [];
  const responseSignalRows: any[] = [];

  // ── Plain items ──
  const plainSessionItemIds = sessionItems.filter((si: any) => si.assessment_items?.item_type !== 'simulation').map((si: any) => si.id);
  const { data: responses, error: rErr } = await supabase
    .from('assessment_responses')
    .select('id, session_item_id, final_response')
    .eq('session_id', sessionId)
    .in('session_item_id', plainSessionItemIds.length > 0 ? plainSessionItemIds : ['00000000-0000-0000-0000-000000000000']);
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

  for (const si of sessionItems) {
    const item = (si as any).assessment_items;
    if (!item || item.item_type === 'simulation') continue;
    const response = responseBySessionItem.get(si.id);
    if (!response) continue;

    const itemMappings = mappingsByItem.get(item.id) || [];
    let matchedSignalId: string | null = null;
    let matchedSignalKey: string | null = null;
    let matchedEvidenceValue: number | null = null;
    let rawValue: any = null;

    for (const mapping of itemMappings) {
      const { isMatch, rawValue: rv } = matchCondition(mapping.response_condition || {}, response.final_response || {});
      if (isMatch) {
        matchedSignalId = mapping.signal_id;
        matchedSignalKey = mapping.assessment_signals?.signal_key || null;
        matchedEvidenceValue = mapping.evidence_value;
        rawValue = rv;
        responseSignalRows.push({
          response_id: response.id, signal_id: mapping.signal_id,
          evidence_value: mapping.evidence_value, scoring_version: SCORING_VERSION,
        });
        break;
      }
    }

    matches.push({
      sourceType: 'item', constructIds: item.construct_ids || [],
      validationGroup: item.validation_group || null,
      responseId: response.id, matchedSignalId, matchedSignalKey, matchedEvidenceValue, rawValue,
    });
  }

  // ── Simulation stages ──
  const simSessionItemIds = sessionItems.filter((si: any) => si.assessment_items?.item_type === 'simulation').map((si: any) => si.id);
  if (simSessionItemIds.length > 0) {
    const { data: stageResponses, error: srErr } = await supabase
      .from('simulation_stage_responses')
      .select('id, session_item_id, stage_id, response')
      .in('session_item_id', simSessionItemIds);
    if (srErr) return { success: false, error: srErr.message };

    const stageIds = (stageResponses || []).map((r: any) => r.stage_id);
    const { data: stages } = stageIds.length > 0
      ? await supabase.from('simulation_stages').select('id, construct_ids').in('id', stageIds)
      : { data: [] as any[] };
    const stageById = new Map((stages || []).map((s: any) => [s.id, s]));

    const { data: stageMappings, error: smErr } = stageIds.length > 0
      ? await supabase.from('item_signal_mappings').select('*, assessment_signals(id, signal_key, construct_id, signal_type)').in('stage_id', stageIds)
      : { data: [] as any[], error: null };
    if (smErr) return { success: false, error: smErr.message };

    const mappingsByStage = new Map<string, any[]>();
    (stageMappings || []).forEach((m: any) => {
      const list = mappingsByStage.get(m.stage_id) || [];
      list.push(m);
      mappingsByStage.set(m.stage_id, list);
    });

    for (const sr of stageResponses || []) {
      const stage = stageById.get(sr.stage_id);
      if (!stage) continue;
      const stageMaps = mappingsByStage.get(sr.stage_id) || [];
      let matchedSignalId: string | null = null;
      let matchedSignalKey: string | null = null;
      let matchedEvidenceValue: number | null = null;
      let rawValue: any = null;

      for (const mapping of stageMaps) {
        const { isMatch, rawValue: rv } = matchCondition(mapping.response_condition || {}, sr.response || {});
        if (isMatch) {
          matchedSignalId = mapping.signal_id;
          matchedSignalKey = mapping.assessment_signals?.signal_key || null;
          matchedEvidenceValue = mapping.evidence_value;
          rawValue = rv;
          responseSignalRows.push({
            stage_response_id: sr.id, signal_id: mapping.signal_id,
            evidence_value: mapping.evidence_value, scoring_version: SCORING_VERSION,
          });
          break;
        }
      }

      matches.push({
        sourceType: 'stage', constructIds: stage.construct_ids || [],
        validationGroup: null, // simulation stages don't carry a validation_group in this sprint
        responseId: sr.id, matchedSignalId, matchedSignalKey, matchedEvidenceValue, rawValue,
      });
    }
  }

  if (responseSignalRows.length > 0) {
    const itemResponseIds = responseSignalRows.filter((r) => r.response_id).map((r) => r.response_id);
    const stageResponseIds = responseSignalRows.filter((r) => r.stage_response_id).map((r) => r.stage_response_id);
    if (itemResponseIds.length > 0) await supabase.from('response_signals').delete().in('response_id', itemResponseIds);
    if (stageResponseIds.length > 0) await supabase.from('response_signals').delete().in('stage_response_id', stageResponseIds);
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
      const totalValue = constructMatches.reduce((sum, m) => sum + (m.matchedEvidenceValue ?? 0), 0);
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
      .upsert(constructResultRows, { onConflict: 'session_id, construct_id, scoring_version' });
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
      .upsert(domainResultRows, { onConflict: 'session_id, domain_id, scoring_version' });
    if (drErr) return { success: false, error: drErr.message };
  }

  return { success: true };
}
