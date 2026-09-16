import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';
import { logAudit } from './superadmin-routes.tsx';

const app = new Hono();

const getSupabaseClient = (serviceRole = false) => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    serviceRole ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! : Deno.env.get('SUPABASE_ANON_KEY')!
  );
};

async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const supabase = getSupabaseClient(true);
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;
    if (data.user.app_metadata?.role !== 'admin') return null;
    return data.user;
  } catch {
    return null;
  }
}

async function verifyUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const supabase = getSupabaseClient(true);
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  defaultEnabled: boolean;
  roleRules: Record<string, boolean>; // e.g. { student: true, teacher: false }
  planRules: Record<string, boolean>; // e.g. { free: false, active: true }
  createdAt: string;
  updatedAt?: string;
}

// Seed the flags this codebase actually gates (ai-coach, brain-gym, daily-challenge)
// so the mechanism is real and demonstrable, not just an empty admin screen.
const SEED_FLAGS: Omit<FeatureFlag, 'createdAt'>[] = [
  { key: 'ai-coach', name: 'AI Learning Coach', description: 'AI-powered coaching chat available to students.', defaultEnabled: true, roleRules: {}, planRules: {} },
  { key: 'brain-gym', name: 'Brain Gym', description: 'Cognitive workout / lesson library.', defaultEnabled: true, roleRules: {}, planRules: {} },
  { key: 'daily-challenge', name: 'Daily Challenge', description: 'Daily challenge runner.', defaultEnabled: true, roleRules: {}, planRules: {} },
];

async function seedIfEmpty() {
  const existing = await kv.getByPrefix('feature_flag:');
  if (existing.length > 0) return;
  await Promise.all(
    SEED_FLAGS.map((f) => kv.set(`feature_flag:${f.key}`, { ...f, createdAt: new Date().toISOString() }))
  );
}

function resolveFlag(flag: FeatureFlag, ctx: { role?: string; plan?: string }, override?: { enabled: boolean } | null): boolean {
  if (override) return override.enabled;
  if (ctx.role && flag.roleRules && ctx.role in flag.roleRules) return flag.roleRules[ctx.role];
  if (ctx.plan && flag.planRules && ctx.plan in flag.planRules) return flag.planRules[ctx.plan];
  return flag.defaultEnabled;
}

// ============= ADMIN: manage flag definitions =============

app.get('/', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    await seedIfEmpty();
    const flags = await kv.getByPrefix('feature_flag:');
    flags.sort((a: any, b: any) => a.name.localeCompare(b.name));
    return c.json({ success: true, flags });
  } catch (error) {
    console.log(`[feature-flags] Error: ${error}`);
    return c.json({ error: 'Failed to fetch feature flags' }, 500);
  }
});

app.post('/', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const { key, name, description, defaultEnabled } = await c.req.json();
    if (!key || !name) return c.json({ error: 'key and name are required' }, 400);
    if (!/^[a-z0-9-]+$/.test(key)) return c.json({ error: 'key must be lowercase letters, numbers, and hyphens only' }, 400);

    const existing = await kv.get(`feature_flag:${key}`);
    if (existing) return c.json({ error: 'A flag with this key already exists' }, 409);

    const flag: FeatureFlag = {
      key, name, description: description || '',
      defaultEnabled: defaultEnabled !== false,
      roleRules: {}, planRules: {},
      createdAt: new Date().toISOString(),
    };
    await kv.set(`feature_flag:${key}`, flag);
    await logAudit(admin.id, admin.email || '', 'create_feature_flag', { key });
    return c.json({ success: true, flag });
  } catch (error) {
    console.log(`[feature-flags] Error: ${error}`);
    return c.json({ error: 'Failed to create feature flag' }, 500);
  }
});

app.put('/:key', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const key = c.req.param('key');
    const existing = await kv.get(`feature_flag:${key}`);
    if (!existing) return c.json({ error: 'Not found' }, 404);

    const updates = await c.req.json();
    const merged: FeatureFlag = {
      ...existing,
      name: updates.name ?? existing.name,
      description: updates.description ?? existing.description,
      defaultEnabled: typeof updates.defaultEnabled === 'boolean' ? updates.defaultEnabled : existing.defaultEnabled,
      roleRules: updates.roleRules ?? existing.roleRules ?? {},
      planRules: updates.planRules ?? existing.planRules ?? {},
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`feature_flag:${key}`, merged);
    await logAudit(admin.id, admin.email || '', 'update_feature_flag', { key, updates });
    return c.json({ success: true, flag: merged });
  } catch (error) {
    console.log(`[feature-flags] Error: ${error}`);
    return c.json({ error: 'Failed to update feature flag' }, 500);
  }
});

app.delete('/:key', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const key = c.req.param('key');
    await kv.del(`feature_flag:${key}`);
    const overrides = await kv.getByPrefix(`feature_override:`);
    await Promise.all(
      overrides.filter((o: any) => o.key === key).map((o: any) => kv.del(`feature_override:${o.userId}:${key}`))
    );
    await logAudit(admin.id, admin.email || '', 'delete_feature_flag', { key });
    return c.json({ success: true });
  } catch (error) {
    console.log(`[feature-flags] Error: ${error}`);
    return c.json({ error: 'Failed to delete feature flag' }, 500);
  }
});

// ============= ADMIN: per-account overrides =============

app.get('/:key/overrides', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const key = c.req.param('key');
    const all = await kv.getByPrefix('feature_override:');
    const forKey = all.filter((o: any) => o.key === key);
    return c.json({ success: true, overrides: forKey });
  } catch (error) {
    console.log(`[feature-flags] Error: ${error}`);
    return c.json({ error: 'Failed to fetch overrides' }, 500);
  }
});

app.post('/:key/overrides', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const key = c.req.param('key');
    const flag = await kv.get(`feature_flag:${key}`);
    if (!flag) return c.json({ error: 'Flag not found' }, 404);

    const { targetUserId, targetEmail, enabled } = await c.req.json();
    if (!targetUserId || typeof enabled !== 'boolean') {
      return c.json({ error: 'targetUserId and enabled (boolean) are required' }, 400);
    }
    const override = { key, userId: targetUserId, userEmail: targetEmail || '', enabled, updatedAt: new Date().toISOString() };
    await kv.set(`feature_override:${targetUserId}:${key}`, override);
    await logAudit(admin.id, admin.email || '', 'set_feature_override', { key, targetUserId, enabled });
    return c.json({ success: true, override });
  } catch (error) {
    console.log(`[feature-flags] Error: ${error}`);
    return c.json({ error: 'Failed to set override' }, 500);
  }
});

app.delete('/:key/overrides/:userId', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const key = c.req.param('key');
    const userId = c.req.param('userId');
    await kv.del(`feature_override:${userId}:${key}`);
    await logAudit(admin.id, admin.email || '', 'clear_feature_override', { key, userId });
    return c.json({ success: true });
  } catch (error) {
    console.log(`[feature-flags] Error: ${error}`);
    return c.json({ error: 'Failed to clear override' }, 500);
  }
});

// ============= ANY USER: resolved flags for themselves =============

app.get('/effective', async (c) => {
  const user = await verifyUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  try {
    await seedIfEmpty();
    // role is sourced from the KV profile only (not self-assignable - see
    // PATCH /user/profile's allowlist), never user_metadata, which is client-editable.
    const profile = await kv.get(`user:${user.id}`);
    const role = profile?.role || '';
    const plan = profile?.subscriptionStatus || 'free';

    const flags = await kv.getByPrefix('feature_flag:');
    const overrideKeys = flags.map((f: any) => `feature_override:${user.id}:${f.key}`);
    const overrides = overrideKeys.length > 0 ? await kv.mget(overrideKeys) : [];

    const effective: Record<string, boolean> = {};
    flags.forEach((flag: any, i: number) => {
      effective[flag.key] = resolveFlag(flag, { role, plan }, overrides[i] || null);
    });

    return c.json({ success: true, flags: effective });
  } catch (error) {
    console.log(`[feature-flags] Error: ${error}`);
    return c.json({ error: 'Failed to resolve feature flags' }, 500);
  }
});

export default app;
