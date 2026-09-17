import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';
import { CAREER_DATABASE } from './career-database.tsx';
import { verifyPlatformAdmin } from './platform-admin.tsx';

const app = new Hono();

const getSupabaseClient = (serviceRole = false) => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    serviceRole ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! : Deno.env.get('SUPABASE_ANON_KEY')!
  );
};

// Verifies the caller is authenticated AND a platform admin (platform_admins
// table - see platform-admin.tsx for why this replaced app_metadata).
export const verifyAdmin = verifyPlatformAdmin;

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

// List everyone currently in the platform_admins table (the durable source of
// truth - see verifyAdmin/platform-admin.tsx).
app.get('/admins', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const supabaseAdmin = getSupabaseClient(true);
    const { data, error } = await supabaseAdmin.from('platform_admins').select('user_id, email').order('email');
    if (error) throw error;
    return c.json({ success: true, admins: (data || []).map((a: any) => ({ id: a.user_id, email: a.email })) });
  } catch (error) {
    console.log(`[superadmin/admins] Error: ${error}`);
    return c.json({ error: 'Failed to list admins' }, 500);
  }
});

// Grant or revoke admin access via the platform_admins table. Only an
// existing verified admin can call this.
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

    if (isAdmin) {
      const { error: upsertError } = await supabaseAdmin
        .from('platform_admins')
        .upsert({ user_id: targetUserId, email: targetData.user.email, granted_by: admin.id }, { onConflict: 'user_id' });
      if (upsertError) throw upsertError;
    } else {
      const { error: deleteError } = await supabaseAdmin.from('platform_admins').delete().eq('user_id', targetUserId);
      if (deleteError) throw deleteError;
    }

    await logAudit(admin.id, admin.email || '', isAdmin ? 'grant_admin' : 'revoke_admin', { targetUserId, targetEmail: targetData.user.email });
    return c.json({ success: true });
  } catch (error) {
    console.log(`[superadmin/admins/set] Error: ${error}`);
    return c.json({ error: 'Failed to update admin status' }, 500);
  }
});

// ============= INSTITUTION DETAILS =============

app.get('/institutions/:id', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const id = c.req.param('id');
    const supabaseAdmin = getSupabaseClient(true);

    const { data: institution, error: instError } = await supabaseAdmin
      .from('institutions').select('*').eq('id', id).maybeSingle();
    if (instError) throw instError;
    if (!institution) return c.json({ error: 'Institution not found' }, 404);

    const { data: members, error: membersError } = await supabaseAdmin
      .from('institution_members').select('*').eq('institution_id', id);
    if (membersError) throw membersError;

    return c.json({ success: true, institution, members: members || [] });
  } catch (error) {
    console.log(`[superadmin/institutions] Error: ${error}`);
    return c.json({ error: 'Failed to fetch institution details' }, 500);
  }
});

// ============= ORGANIZATION DETAILS & SUSPEND =============

app.get('/organizations/:code', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const code = c.req.param('code');
    const organization = await kv.get(`organization:${code}`);
    if (!organization) return c.json({ error: 'Organization not found' }, 404);

    const allUsers = await kv.getByPrefix('user:');
    const employees = allUsers.filter((u: any) => u && u.organizationCode === code);

    return c.json({ success: true, organization, employees });
  } catch (error) {
    console.log(`[superadmin/organizations] Error: ${error}`);
    return c.json({ error: 'Failed to fetch organization details' }, 500);
  }
});

app.post('/organizations/:code/suspend', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const code = c.req.param('code');
    const { isActive } = await c.req.json();
    if (typeof isActive !== 'boolean') return c.json({ error: 'isActive (boolean) is required' }, 400);

    const organization = await kv.get(`organization:${code}`);
    if (!organization) return c.json({ error: 'Organization not found' }, 404);

    const updated = { ...organization, isActive, updatedAt: new Date().toISOString() };
    await kv.set(`organization:${code}`, updated);
    await logAudit(admin.id, admin.email || '', isActive ? 'reactivate_organization' : 'suspend_organization', { code });
    return c.json({ success: true, organization: updated });
  } catch (error) {
    console.log(`[superadmin/organizations] Error: ${error}`);
    return c.json({ error: 'Failed to update organization' }, 500);
  }
});

// ============= ASSESSMENT MODULE ANALYTICS =============

app.get('/assessment-modules/:framework/analytics', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const framework = c.req.param('framework');
    const allResults = await kv.getByPrefix('result:');
    const forFramework = allResults.filter((r: any) => (r.assessmentType || r.type) === framework);

    const completions = forFramework.filter((r: any) => r.completedAt);
    const last30Days = completions.filter((r: any) => Date.now() - new Date(r.completedAt).getTime() < 30 * 24 * 60 * 60 * 1000);

    const styleCounts: Record<string, number> = {};
    completions.forEach((r: any) => {
      const style = r.results?.style || r.score?.style;
      if (style) styleCounts[style] = (styleCounts[style] || 0) + 1;
    });

    return c.json({
      success: true,
      analytics: {
        totalCompletions: completions.length,
        completionsLast30Days: last30Days.length,
        styleDistribution: styleCounts,
      },
    });
  } catch (error) {
    console.log(`[superadmin/assessment-modules] Error: ${error}`);
    return c.json({ error: 'Failed to fetch module analytics' }, 500);
  }
});

// ============= SEND ONE-OFF EMAIL TO A USER =============

app.post('/users/:userId/send-email', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const userId = c.req.param('userId');
    const { subject, message } = await c.req.json();
    if (!subject || !message) return c.json({ error: 'subject and message are required' }, 400);

    const targetProfile = await kv.get(`user:${userId}`);
    if (!targetProfile?.email) return c.json({ error: 'User not found or has no email' }, 404);

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) return c.json({ error: 'RESEND_API_KEY is not configured' }, 500);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
      body: JSON.stringify({
        from: 'JotMinds <noreply@jotminds.com>',
        to: targetProfile.email,
        subject,
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">${message}</div>`,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return c.json({ error: 'Failed to send email', details: err }, 500);
    }

    await logAudit(admin.id, admin.email || '', 'send_user_email', { userId, targetEmail: targetProfile.email, subject });
    return c.json({ success: true });
  } catch (error) {
    console.log(`[superadmin/users] Error: ${error}`);
    return c.json({ error: 'Failed to send email' }, 500);
  }
});

// ============= AUDITED SUPPORT ACCESS REQUESTS =============
//
// Real backing for the Portal's "Request Audited Access" button. Previously
// this only sent an email with dead href="#" approve/deny links and tracked
// "pending" purely in local React state - nothing was persisted, and the
// account owner's decision went nowhere. Now the request, the token in the
// email links, and the account owner's decision are all real and durable.

async function sendResendEmail(to: string, subject: string, html: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) throw new Error('RESEND_API_KEY is not configured');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
    body: JSON.stringify({ from: 'JotMinds <noreply@jotminds.com>', to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Resend API error: ${err.message || JSON.stringify(err)}`);
  }
}

app.post('/support-access/request', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const { targetType, targetId, targetEmail, targetName, reason } = await c.req.json();
    if (!targetType || !targetId || !targetEmail || !reason) {
      return c.json({ error: 'targetType, targetId, targetEmail and reason are required' }, 400);
    }
    if (!['institution', 'organization', 'user'].includes(targetType)) {
      return c.json({ error: 'targetType must be institution, organization, or user' }, 400);
    }

    const supabase = getSupabaseClient(true);
    const decisionToken = crypto.randomUUID();
    const { data: request, error } = await supabase
      .from('support_access_requests')
      .insert({
        requested_by: admin.id, requested_by_email: admin.email || '',
        target_type: targetType, target_id: String(targetId), target_email: targetEmail, target_name: targetName || null,
        reason, decision_token: decisionToken,
      })
      .select()
      .single();
    if (error) return c.json({ error: error.message }, 500);

    const confirmBase = `${Deno.env.get('SUPABASE_URL')}/functions/v1/server/make-server-fc8eb847/support-access/confirm`;
    const approveUrl = `${confirmBase}?token=${decisionToken}&decision=approve`;
    const denyUrl = `${confirmBase}?token=${decisionToken}&decision=deny`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Support Access Request</h2>
        <p>Hello ${targetName || ''},</p>
        <p>A JOTMinds Super Admin has requested temporary audited support access to your account/tenant to assist you.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>If you approve this request, the admin will have temporary access to view and manage your data. All actions will be strictly audited. This request expires in 7 days.</p>
        <div style="margin: 30px 0;">
          <a href="${approveUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Approve Access</a>
          <a href="${denyUrl}" style="margin-left: 10px; color: #dc2626; text-decoration: underline;">Deny</a>
        </div>
        <p style="font-size: 12px; color: #666;">If you did not request support, click Deny or ignore this email.</p>
      </div>
    `;
    await sendResendEmail(targetEmail, 'JOTMinds Support Access Request', html);
    await logAudit(admin.id, admin.email || '', 'request_support_access', { targetType, targetId, targetEmail, reason });

    return c.json({ success: true, requestId: request.id });
  } catch (error) {
    console.log(`[superadmin/support-access] Error requesting access: ${error}`);
    return c.json({ error: error instanceof Error ? error.message : 'Failed to request support access' }, 500);
  }
});

app.get('/support-access', async (c) => {
  const admin = await verifyAdmin(c.req.raw);
  if (!admin) return c.json({ error: 'Forbidden - Admin access required' }, 403);
  try {
    const supabase = getSupabaseClient(true);
    // Auto-expire anything past its window before reporting status, so the
    // Portal never shows a stale "pending" for a request nobody will answer.
    await supabase.from('support_access_requests').update({ status: 'expired' }).eq('status', 'pending').lt('expires_at', new Date().toISOString());
    const { data: requests, error } = await supabase.from('support_access_requests').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true, requests });
  } catch (error) {
    console.log(`[superadmin/support-access] Error listing requests: ${error}`);
    return c.json({ error: 'Failed to fetch support access requests' }, 500);
  }
});

export default app;
