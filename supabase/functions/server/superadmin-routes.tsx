import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';
import { CAREER_DATABASE } from './career-database.tsx';

const app = new Hono();

const getSupabaseClient = (serviceRole = false) => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    serviceRole ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! : Deno.env.get('SUPABASE_ANON_KEY')!
  );
};

// Verifies the caller is authenticated AND flagged as admin in app_metadata.
// app_metadata is only writable via the Admin API (service role) - unlike
// user_metadata, a client can never set this on themselves via
// supabase.auth.updateUser(), so this is an actual security boundary.
export async function verifyAdmin(request: Request) {
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

// Any authenticated user (not just admin) - used for ticket submission
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

export async function logAudit(adminId: string, adminEmail: string, action: string, details: any = {}) {
  const id = crypto.randomUUID();
  await kv.set(`audit:${Date.now()}:${id}`, {
    id,
    adminId,
    adminEmail,
    action,
    details,
    createdAt: new Date().toISOString(),
  });
}

// ============= PLATFORM SETTINGS =============

const DEFAULT_SETTINGS = {
  siteName: 'JotMinds',
  supportEmail: 'support@jotminds.com',
  primaryColor: '#4f46e5',
  defaultLocale: 'en',
  maintenanceMode: false,
};

app.get('/settings', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const settings = await kv.get('platform_settings');
    return c.json({ success: true, settings: { ...DEFAULT_SETTINGS, ...(settings || {}) } });
  } catch (error) {
    console.log(`[superadmin/settings] Error: ${error}`);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

app.put('/settings', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const updates = await c.req.json();
    const existing = (await kv.get('platform_settings')) || {};
    const merged = { ...DEFAULT_SETTINGS, ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set('platform_settings', merged);
    await logAudit(admin.id, admin.email || '', 'update_platform_settings', { updates });
    return c.json({ success: true, settings: merged });
  } catch (error) {
    console.log(`[superadmin/settings] Error: ${error}`);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// ============= CONTENT MANAGEMENT (careers, scholarships, resources) =============

const CONTENT_TYPES = ['career', 'scholarship', 'resource'];

async function seedCareersIfEmpty() {
  const existing = await kv.getByPrefix('content:career:');
  if (existing.length > 0) return;
  await Promise.all(
    CAREER_DATABASE.map((career) =>
      kv.set(`content:career:${career.careerId}`, {
        id: career.careerId,
        type: 'career',
        title: career.title,
        category: career.category,
        description: career.description,
        seeded: true,
        createdAt: new Date().toISOString(),
      })
    )
  );
}

app.get('/content', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const type = c.req.query('type') || 'career';
    if (!CONTENT_TYPES.includes(type)) return c.json({ error: 'Invalid content type' }, 400);
    if (type === 'career') await seedCareersIfEmpty();
    const items = await kv.getByPrefix(`content:${type}:`);
    items.sort((a: any, b: any) => (a.title || '').localeCompare(b.title || ''));
    return c.json({ success: true, items });
  } catch (error) {
    console.log(`[superadmin/content] Error: ${error}`);
    return c.json({ error: 'Failed to fetch content' }, 500);
  }
});

app.post('/content', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const body = await c.req.json();
    const { type, title, category, description } = body;
    if (!type || !CONTENT_TYPES.includes(type) || !title) {
      return c.json({ error: 'type (career|scholarship|resource) and title are required' }, 400);
    }
    const id = crypto.randomUUID();
    const item = {
      id, type, title,
      category: category || '',
      description: description || '',
      seeded: false,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`content:${type}:${id}`, item);
    await logAudit(admin.id, admin.email || '', 'create_content', { type, id, title });
    return c.json({ success: true, item });
  } catch (error) {
    console.log(`[superadmin/content] Error: ${error}`);
    return c.json({ error: 'Failed to create content' }, 500);
  }
});

app.put('/content/:type/:id', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const type = c.req.param('type');
    const id = c.req.param('id');
    if (!CONTENT_TYPES.includes(type)) return c.json({ error: 'Invalid content type' }, 400);
    const key = `content:${type}:${id}`;
    const existing = await kv.get(key);
    if (!existing) return c.json({ error: 'Not found' }, 404);
    const updates = await c.req.json();
    const merged = { ...existing, ...updates, id, type, updatedAt: new Date().toISOString() };
    await kv.set(key, merged);
    await logAudit(admin.id, admin.email || '', 'update_content', { type, id });
    return c.json({ success: true, item: merged });
  } catch (error) {
    console.log(`[superadmin/content] Error: ${error}`);
    return c.json({ error: 'Failed to update content' }, 500);
  }
});

app.delete('/content/:type/:id', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const type = c.req.param('type');
    const id = c.req.param('id');
    if (!CONTENT_TYPES.includes(type)) return c.json({ error: 'Invalid content type' }, 400);
    await kv.del(`content:${type}:${id}`);
    await logAudit(admin.id, admin.email || '', 'delete_content', { type, id });
    return c.json({ success: true });
  } catch (error) {
    console.log(`[superadmin/content] Error: ${error}`);
    return c.json({ error: 'Failed to delete content' }, 500);
  }
});

// ============= GAMIFICATION CONFIG =============

const DEFAULT_GAMIFICATION_CONFIG = {
  levels: [
    { level: 1, xpRequired: 0, title: 'Newcomer' },
    { level: 2, xpRequired: 100, title: 'Explorer' },
    { level: 3, xpRequired: 300, title: 'Achiever' },
    { level: 4, xpRequired: 700, title: 'Expert' },
    { level: 5, xpRequired: 1500, title: 'Master' },
  ],
  seasonalEvents: [] as any[],
};

app.get('/gamification-config', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const config = await kv.get('gamification_config');
    return c.json({ success: true, config: { ...DEFAULT_GAMIFICATION_CONFIG, ...(config || {}) } });
  } catch (error) {
    console.log(`[superadmin/gamification-config] Error: ${error}`);
    return c.json({ error: 'Failed to fetch gamification config' }, 500);
  }
});

app.put('/gamification-config', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const updates = await c.req.json();
    const existing = (await kv.get('gamification_config')) || DEFAULT_GAMIFICATION_CONFIG;
    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set('gamification_config', merged);
    await logAudit(admin.id, admin.email || '', 'update_gamification_config', {});
    return c.json({ success: true, config: merged });
  } catch (error) {
    console.log(`[superadmin/gamification-config] Error: ${error}`);
    return c.json({ error: 'Failed to update gamification config' }, 500);
  }
});

// ============= AI USAGE (logged from ai-routes.tsx via logAiUsage) =============

export async function logAiUsage(entry: {
  endpoint: string;
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  latencyMs: number;
  success: boolean;
  error?: string;
}) {
  const id = crypto.randomUUID();
  try {
    await kv.set(`ai_usage:${Date.now()}:${id}`, { id, ...entry, createdAt: new Date().toISOString() });
  } catch (e) {
    console.log(`[logAiUsage] Failed to log AI usage: ${e}`);
  }
}

app.get('/ai-usage', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const entries = await kv.getByPrefix('ai_usage:');
    entries.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalCalls = entries.length;
    const failedCalls = entries.filter((e: any) => !e.success).length;
    const totalTokens = entries.reduce((sum: number, e: any) => sum + (e.totalTokens || 0), 0);
    const avgLatencyMs = totalCalls > 0
      ? Math.round(entries.reduce((sum: number, e: any) => sum + (e.latencyMs || 0), 0) / totalCalls)
      : 0;

    const byEndpoint: Record<string, number> = {};
    entries.forEach((e: any) => { byEndpoint[e.endpoint] = (byEndpoint[e.endpoint] || 0) + 1; });

    return c.json({
      success: true,
      summary: { totalCalls, failedCalls, failureRate: totalCalls > 0 ? Math.round((failedCalls / totalCalls) * 100) : 0, totalTokens, avgLatencyMs, byEndpoint },
      recent: entries.slice(0, 100),
    });
  } catch (error) {
    console.log(`[superadmin/ai-usage] Error: ${error}`);
    return c.json({ error: 'Failed to fetch AI usage' }, 500);
  }
});

// ============= COMMUNICATION CENTER (broadcast emails via Resend) =============

app.post('/broadcast', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const { audience, subject, message } = await c.req.json();
    if (!audience || !subject || !message) {
      return c.json({ error: 'audience, subject and message are required' }, 400);
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) return c.json({ error: 'RESEND_API_KEY is not configured' }, 500);

    const allUsers = await kv.getByPrefix('user:');
    let recipients = allUsers.filter((u: any) => u && u.email);
    if (audience === 'students') recipients = recipients.filter((u: any) => u.role === 'student');
    else if (audience === 'teachers') recipients = recipients.filter((u: any) => u.role === 'teacher');
    else if (audience === 'parents') recipients = recipients.filter((u: any) => u.role === 'parent');
    else if (audience !== 'all') {
      return c.json({ error: 'audience must be all, students, teachers, or parents' }, 400);
    }

    // Cap a single broadcast to avoid runaway sends; batch via BCC in chunks of 50.
    const MAX_RECIPIENTS = 2000;
    const emails = recipients.slice(0, MAX_RECIPIENTS).map((u: any) => u.email);
    const chunkSize = 50;
    let sentCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < emails.length; i += chunkSize) {
      const chunk = emails.slice(i, i + chunkSize);
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
          body: JSON.stringify({
            from: 'JotMinds <noreply@jotminds.com>',
            to: 'noreply@jotminds.com',
            bcc: chunk,
            subject,
            html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">${message}</div>`,
          }),
        });
        if (response.ok) {
          sentCount += chunk.length;
        } else {
          const err = await response.json().catch(() => ({}));
          errors.push(`chunk ${i}: ${JSON.stringify(err)}`);
        }
      } catch (e: any) {
        errors.push(`chunk ${i}: ${e.message}`);
      }
    }

    const id = crypto.randomUUID();
    const record = {
      id, audience, subject, message,
      recipientCount: emails.length,
      sentCount,
      errors,
      sentBy: admin.email,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`broadcast:${Date.now()}:${id}`, record);
    await logAudit(admin.id, admin.email || '', 'send_broadcast', { audience, subject, recipientCount: emails.length, sentCount });

    return c.json({ success: sentCount > 0, broadcast: record });
  } catch (error) {
    console.log(`[superadmin/broadcast] Error: ${error}`);
    return c.json({ error: 'Failed to send broadcast' }, 500);
  }
});

app.get('/broadcasts', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const broadcasts = await kv.getByPrefix('broadcast:');
    broadcasts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return c.json({ success: true, broadcasts: broadcasts.slice(0, 100) });
  } catch (error) {
    console.log(`[superadmin/broadcasts] Error: ${error}`);
    return c.json({ error: 'Failed to fetch broadcasts' }, 500);
  }
});

// ============= SUPPORT CENTER (tickets) =============

// User-facing: any authenticated user can submit a ticket
app.post('/tickets', async (c) => {
  const user = await verifyUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const { subject, message } = await c.req.json();
    if (!subject || !message) return c.json({ error: 'subject and message are required' }, 400);
    const id = crypto.randomUUID();
    const ticket = {
      id,
      userId: user.id,
      userEmail: user.email,
      subject,
      message,
      status: 'open',
      replies: [],
      createdAt: new Date().toISOString(),
    };
    await kv.set(`ticket:${Date.now()}:${id}`, ticket);
    return c.json({ success: true, ticket });
  } catch (error) {
    console.log(`[tickets] Error: ${error}`);
    return c.json({ error: 'Failed to submit ticket' }, 500);
  }
});

app.get('/tickets', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const tickets = await kv.getByPrefix('ticket:');
    tickets.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return c.json({ success: true, tickets });
  } catch (error) {
    console.log(`[superadmin/tickets] Error: ${error}`);
    return c.json({ error: 'Failed to fetch tickets' }, 500);
  }
});

app.patch('/tickets/:id', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const id = c.req.param('id');
    const all = await kv.getByPrefix(`ticket:`);
    const existingWithKey = all.find((t: any) => t.id === id);
    if (!existingWithKey) return c.json({ error: 'Not found' }, 404);

    const { status, reply } = await c.req.json();
    const updated = { ...existingWithKey };
    if (status) updated.status = status;
    if (reply) {
      updated.replies = [...(updated.replies || []), { message: reply, adminEmail: admin.email, createdAt: new Date().toISOString() }];
    }
    updated.updatedAt = new Date().toISOString();

    // Re-derive the exact key (ticket:<createdAtMs>:<id>) since we only have the id.
    const createdMs = new Date(existingWithKey.createdAt).getTime();
    await kv.set(`ticket:${createdMs}:${id}`, updated);
    await logAudit(admin.id, admin.email || '', 'update_ticket', { id, status });
    return c.json({ success: true, ticket: updated });
  } catch (error) {
    console.log(`[superadmin/tickets] Error: ${error}`);
    return c.json({ error: 'Failed to update ticket' }, 500);
  }
});

// ============= AUDIT LOGS =============

app.get('/audit-logs', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const logs = await kv.getByPrefix('audit:');
    logs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return c.json({ success: true, logs: logs.slice(0, 200) });
  } catch (error) {
    console.log(`[superadmin/audit-logs] Error: ${error}`);
    return c.json({ error: 'Failed to fetch audit logs' }, 500);
  }
});

// ============= SECURITY CENTER =============

app.get('/security-overview', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const supabaseAdmin = getSupabaseClient(true);
    const recentSignins: { email: string; lastSignInAt: string | null; createdAt: string }[] = [];
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      const users = data?.users || [];
      users.forEach((u: any) => {
        recentSignins.push({ email: u.email, lastSignInAt: u.last_sign_in_at, createdAt: u.created_at });
      });
      if (users.length < perPage) break;
      page++;
    }
    recentSignins.sort((a, b) => new Date(b.lastSignInAt || 0).getTime() - new Date(a.lastSignInAt || 0).getTime());

    const now = Date.now();
    const activeLast24h = recentSignins.filter(u => u.lastSignInAt && now - new Date(u.lastSignInAt).getTime() < 24 * 60 * 60 * 1000).length;
    const activeLast7d = recentSignins.filter(u => u.lastSignInAt && now - new Date(u.lastSignInAt).getTime() < 7 * 24 * 60 * 60 * 1000).length;

    return c.json({
      success: true,
      overview: {
        totalAccounts: recentSignins.length,
        activeLast24h,
        activeLast7d,
        rateLimit: { requestsPerMinute: 100, scope: 'per IP', status: 'active' },
        recentSignins: recentSignins.slice(0, 50),
      },
    });
  } catch (error) {
    console.log(`[superadmin/security-overview] Error: ${error}`);
    return c.json({ error: 'Failed to fetch security overview' }, 500);
  }
});

// ============= ADMIN MANAGEMENT =============

// List everyone currently flagged as admin via app_metadata (the hardened source
// of truth - see verifyAdmin above).
app.get('/admins', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const supabaseAdmin = getSupabaseClient(true);
    const admins: { id: string; email: string }[] = [];
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      const users = data?.users || [];
      users.forEach((u: any) => {
        if (u.app_metadata?.role === 'admin') admins.push({ id: u.id, email: u.email });
      });
      if (users.length < perPage) break;
      page++;
    }
    return c.json({ success: true, admins });
  } catch (error) {
    console.log(`[superadmin/admins] Error: ${error}`);
    return c.json({ error: 'Failed to list admins' }, 500);
  }
});

// Grant or revoke admin access. Only an existing verified admin (app_metadata,
// Admin-API-only writable) can call this, and it writes app_metadata via the
// Admin API - never user_metadata, which a client could set on themselves.
app.post('/admins/set', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const { targetUserId, isAdmin } = await c.req.json();
    if (!targetUserId || typeof isAdmin !== 'boolean') {
      return c.json({ error: 'targetUserId and isAdmin (boolean) are required' }, 400);
    }

    const supabaseAdmin = getSupabaseClient(true);
    const { data: targetData, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
    if (fetchError || !targetData?.user) {
      return c.json({ error: 'Target user not found' }, 404);
    }

    const nextAppMetadata = { ...(targetData.user.app_metadata || {}) };
    if (isAdmin) {
      nextAppMetadata.role = 'admin';
    } else {
      delete nextAppMetadata.role;
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, { app_metadata: nextAppMetadata });
    if (updateError) throw updateError;

    await logAudit(admin.id, admin.email || '', isAdmin ? 'grant_admin' : 'revoke_admin', { targetUserId, targetEmail: targetData.user.email });
    return c.json({ success: true });
  } catch (error) {
    console.log(`[superadmin/admins/set] Error: ${error}`);
    return c.json({ error: 'Failed to update admin status' }, 500);
  }
});

export default app;
