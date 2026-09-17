import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js';
import { verifyPlatformAdmin } from './platform-admin.tsx';
import { logAudit } from './superadmin-routes.tsx';

const app = new Hono();

const getSupabaseClient = () => {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
};

// ============= DOMAINS =============

app.get('/domains', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('assessment_domains').select('*').order('name');
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, domains: data });
});

app.post('/domains', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const { domain_key, name, description } = await c.req.json();
    if (!domain_key || !name) return c.json({ error: 'domain_key and name are required' }, 400);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('assessment_domains')
      .insert({ domain_key, name, description: description || null })
      .select()
      .single();
    if (error) return c.json({ error: error.message }, 400);
    await logAudit(admin.id, admin.email || '', 'create_domain', { domain_key });
    return c.json({ success: true, domain: data });
  } catch (error) {
    console.log(`[item-bank/domains] Error: ${error}`);
    return c.json({ error: 'Failed to create domain' }, 500);
  }
});

app.put('/domains/:id', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const id = c.req.param('id');
    const { name, description, status } = await c.req.json();
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('assessment_domains').update(updates).eq('id', id).select().single();
    if (error) return c.json({ error: error.message }, 400);
    await logAudit(admin.id, admin.email || '', 'update_domain', { id, updates });
    return c.json({ success: true, domain: data });
  } catch (error) {
    console.log(`[item-bank/domains] Error: ${error}`);
    return c.json({ error: 'Failed to update domain' }, 500);
  }
});

// ============= CONSTRUCTS =============

app.get('/constructs', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  const domainId = c.req.query('domainId');
  const supabase = getSupabaseClient();
  let query = supabase.from('assessment_constructs').select('*').order('name');
  if (domainId) query = query.eq('domain_id', domainId);
  const { data, error } = await query;
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, constructs: data });
});

app.post('/constructs', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const { construct_key, domain_id, name, definition, construct_type } = await c.req.json();
    if (!construct_key || !domain_id || !name || !definition || !construct_type) {
      return c.json({ error: 'construct_key, domain_id, name, definition and construct_type are required' }, 400);
    }
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('assessment_constructs')
      .insert({ construct_key, domain_id, name, definition, construct_type })
      .select()
      .single();
    if (error) return c.json({ error: error.message }, 400);
    await logAudit(admin.id, admin.email || '', 'create_construct', { construct_key });
    return c.json({ success: true, construct: data });
  } catch (error) {
    console.log(`[item-bank/constructs] Error: ${error}`);
    return c.json({ error: 'Failed to create construct' }, 500);
  }
});

app.put('/constructs/:id', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const id = c.req.param('id');
    const { name, definition, status } = await c.req.json();
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (definition !== undefined) updates.definition = definition;
    if (status !== undefined) updates.status = status;

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('assessment_constructs').update(updates).eq('id', id).select().single();
    if (error) return c.json({ error: error.message }, 400);
    await logAudit(admin.id, admin.email || '', 'update_construct', { id, updates });
    return c.json({ success: true, construct: data });
  } catch (error) {
    console.log(`[item-bank/constructs] Error: ${error}`);
    return c.json({ error: 'Failed to update construct' }, 500);
  }
});

// ============= ASSESSMENTS =============

app.get('/assessments', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('professional_assessments').select('*').order('assessment_key').order('version', { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, assessments: data });
});

app.post('/assessments', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const { assessment_key, name, min_items, max_items, expected_duration_minutes, configuration } = await c.req.json();
    if (!assessment_key || !name) return c.json({ error: 'assessment_key and name are required' }, 400);
    const supabase = getSupabaseClient();

    const { data: existing } = await supabase
      .from('professional_assessments')
      .select('version')
      .eq('assessment_key', assessment_key)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    const version = (existing?.version || 0) + 1;

    const { data, error } = await supabase
      .from('professional_assessments')
      .insert({ assessment_key, version, name, min_items, max_items, expected_duration_minutes, configuration: configuration || {} })
      .select()
      .single();
    if (error) return c.json({ error: error.message }, 400);
    await logAudit(admin.id, admin.email || '', 'create_assessment', { assessment_key, version });
    return c.json({ success: true, assessment: data });
  } catch (error) {
    console.log(`[item-bank/assessments] Error: ${error}`);
    return c.json({ error: 'Failed to create assessment' }, 500);
  }
});

app.put('/assessments/:id', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const id = c.req.param('id');
    const { name, min_items, max_items, expected_duration_minutes, configuration, status } = await c.req.json();
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (min_items !== undefined) updates.min_items = min_items;
    if (max_items !== undefined) updates.max_items = max_items;
    if (expected_duration_minutes !== undefined) updates.expected_duration_minutes = expected_duration_minutes;
    if (configuration !== undefined) updates.configuration = configuration;
    if (status !== undefined) updates.status = status;

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('professional_assessments').update(updates).eq('id', id).select().single();
    if (error) return c.json({ error: error.message }, 400);
    await logAudit(admin.id, admin.email || '', 'update_assessment', { id, updates });
    return c.json({ success: true, assessment: data });
  } catch (error) {
    console.log(`[item-bank/assessments] Error: ${error}`);
    return c.json({ error: 'Failed to update assessment' }, 500);
  }
});

// ============= ITEMS =============

app.get('/items', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  const status = c.req.query('status');
  const constructId = c.req.query('constructId');
  const supabase = getSupabaseClient();
  let query = supabase.from('assessment_items').select('*, assessment_item_options(*)').order('item_key').order('version', { ascending: false });
  if (status) query = query.eq('status', status);
  if (constructId) query = query.contains('construct_ids', [constructId]);
  const { data, error } = await query;
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, items: data });
});

app.post('/items', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const body = await c.req.json();
    const { item_key, item_type, prompt_text, construct_ids, validation_group, evidence_type, time_limit_seconds, manipulation_risk, ai_answerability_risk, randomization_config, config, options } = body;
    if (!item_key || !item_type || !prompt_text) {
      return c.json({ error: 'item_key, item_type and prompt_text are required' }, 400);
    }

    const supabase = getSupabaseClient();
    const { data: existing } = await supabase
      .from('assessment_items')
      .select('version')
      .eq('item_key', item_key)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    const version = (existing?.version || 0) + 1;

    const { data: item, error } = await supabase
      .from('assessment_items')
      .insert({
        item_key, version, item_type, prompt_text,
        construct_ids: construct_ids || [],
        validation_group: validation_group || null,
        evidence_type: evidence_type || null,
        time_limit_seconds: time_limit_seconds || null,
        manipulation_risk: manipulation_risk || null,
        ai_answerability_risk: ai_answerability_risk || null,
        randomization_config: randomization_config || {},
        config: config || {},
        created_by: admin.id,
      })
      .select()
      .single();
    if (error) return c.json({ error: error.message }, 400);

    if (Array.isArray(options) && options.length > 0) {
      const optionRows = options.map((o: any, i: number) => ({
        item_id: item.id, option_code: o.option_code || String.fromCharCode(65 + i),
        text: o.text, display_order: o.display_order ?? i, config: o.config || {},
      }));
      const { error: optError } = await supabase.from('assessment_item_options').insert(optionRows);
      if (optError) return c.json({ error: optError.message }, 400);
    }

    await logAudit(admin.id, admin.email || '', 'create_item', { item_key, version });
    return c.json({ success: true, item });
  } catch (error) {
    console.log(`[item-bank/items] Error: ${error}`);
    return c.json({ error: 'Failed to create item' }, 500);
  }
});

// Editing a draft item updates it in place. Editing anything past draft
// creates a new version instead - "active items require a new version
// rather than silent overwrite" (spec QA requirement).
app.put('/items/:id', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const supabase = getSupabaseClient();

    const { data: existing, error: fetchError } = await supabase.from('assessment_items').select('*').eq('id', id).single();
    if (fetchError || !existing) return c.json({ error: 'Item not found' }, 404);

    const editableFields = ['item_type', 'prompt_text', 'construct_ids', 'validation_group', 'evidence_type', 'time_limit_seconds', 'manipulation_risk', 'ai_answerability_risk', 'randomization_config', 'config'];
    const patch: Record<string, any> = {};
    for (const field of editableFields) if (field in updates) patch[field] = updates[field];

    if (existing.status === 'draft') {
      const { data, error } = await supabase
        .from('assessment_items')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) return c.json({ error: error.message }, 400);
      await logAudit(admin.id, admin.email || '', 'update_item_draft', { id, patch });
      return c.json({ success: true, item: data, newVersion: false });
    }

    // Not draft: create a new version instead of mutating.
    const { data: latest } = await supabase
      .from('assessment_items')
      .select('version')
      .eq('item_key', existing.item_key)
      .order('version', { ascending: false })
      .limit(1)
      .single();
    const nextVersion = (latest?.version || existing.version) + 1;

    const { id: _drop, created_at, updated_at, status, version, ...base } = existing;
    const { data: newItem, error: insertError } = await supabase
      .from('assessment_items')
      .insert({ ...base, ...patch, version: nextVersion, status: 'draft', created_by: admin.id })
      .select()
      .single();
    if (insertError) return c.json({ error: insertError.message }, 400);

    await logAudit(admin.id, admin.email || '', 'create_item_version', { item_key: existing.item_key, fromVersion: existing.version, toVersion: nextVersion });
    return c.json({ success: true, item: newItem, newVersion: true });
  } catch (error) {
    console.log(`[item-bank/items] Error: ${error}`);
    return c.json({ error: 'Failed to update item' }, 500);
  }
});

app.patch('/items/:id/status', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    const validStatuses = ['draft', 'review', 'pilot', 'active', 'suspended', 'retired'];
    if (!validStatuses.includes(status)) return c.json({ error: `status must be one of: ${validStatuses.join(', ')}` }, 400);

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('assessment_items')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) return c.json({ error: error.message }, 400);
    await logAudit(admin.id, admin.email || '', 'set_item_status', { id, status });
    return c.json({ success: true, item: data });
  } catch (error) {
    console.log(`[item-bank/items] Error: ${error}`);
    return c.json({ error: 'Failed to update item status' }, 500);
  }
});

// ============= ITEM OPTIONS =============

app.post('/items/:itemId/options', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const itemId = c.req.param('itemId');
    const { option_code, text, display_order, config } = await c.req.json();
    if (!option_code || !text) return c.json({ error: 'option_code and text are required' }, 400);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('assessment_item_options')
      .insert({ item_id: itemId, option_code, text, display_order: display_order ?? 0, config: config || {} })
      .select()
      .single();
    if (error) return c.json({ error: error.message }, 400);
    await logAudit(admin.id, admin.email || '', 'create_item_option', { itemId, option_code });
    return c.json({ success: true, option: data });
  } catch (error) {
    console.log(`[item-bank/options] Error: ${error}`);
    return c.json({ error: 'Failed to create item option' }, 500);
  }
});

app.put('/options/:id', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const id = c.req.param('id');
    const { text, display_order, config } = await c.req.json();
    const updates: Record<string, any> = {};
    if (text !== undefined) updates.text = text;
    if (display_order !== undefined) updates.display_order = display_order;
    if (config !== undefined) updates.config = config;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('assessment_item_options').update(updates).eq('id', id).select().single();
    if (error) return c.json({ error: error.message }, 400);
    await logAudit(admin.id, admin.email || '', 'update_item_option', { id, updates });
    return c.json({ success: true, option: data });
  } catch (error) {
    console.log(`[item-bank/options] Error: ${error}`);
    return c.json({ error: 'Failed to update item option' }, 500);
  }
});

app.delete('/options/:id', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const id = c.req.param('id');
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('assessment_item_options').delete().eq('id', id);
    if (error) return c.json({ error: error.message }, 400);
    await logAudit(admin.id, admin.email || '', 'delete_item_option', { id });
    return c.json({ success: true });
  } catch (error) {
    console.log(`[item-bank/options] Error: ${error}`);
    return c.json({ error: 'Failed to delete item option' }, 500);
  }
});

// ============= ASSESSMENT ITEM POOLS =============

app.get('/assessments/:assessmentId/items', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  const assessmentId = c.req.param('assessmentId');
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('assessment_item_pools')
    .select('*, assessment_items(*)')
    .eq('assessment_id', assessmentId);
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, pool: data });
});

app.post('/assessments/:assessmentId/items', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const assessmentId = c.req.param('assessmentId');
    const { itemId, required, weight, position_rules } = await c.req.json();
    if (!itemId) return c.json({ error: 'itemId is required' }, 400);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('assessment_item_pools')
      .upsert({ assessment_id: assessmentId, item_id: itemId, required: required !== false, weight: weight ?? 1, position_rules: position_rules || {} }, { onConflict: 'assessment_id, item_id' })
      .select()
      .single();
    if (error) return c.json({ error: error.message }, 400);
    await logAudit(admin.id, admin.email || '', 'attach_item_to_assessment', { assessmentId, itemId });
    return c.json({ success: true, poolEntry: data });
  } catch (error) {
    console.log(`[item-bank/pools] Error: ${error}`);
    return c.json({ error: 'Failed to attach item to assessment' }, 500);
  }
});

app.delete('/assessments/:assessmentId/items/:itemId', async (c) => {
  const admin = await verifyPlatformAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const assessmentId = c.req.param('assessmentId');
    const itemId = c.req.param('itemId');
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('assessment_item_pools').delete().eq('assessment_id', assessmentId).eq('item_id', itemId);
    if (error) return c.json({ error: error.message }, 400);
    await logAudit(admin.id, admin.email || '', 'detach_item_from_assessment', { assessmentId, itemId });
    return c.json({ success: true });
  } catch (error) {
    console.log(`[item-bank/pools] Error: ${error}`);
    return c.json({ error: 'Failed to detach item from assessment' }, 500);
  }
});

export default app;
