import { Hono } from 'npm:hono';
import { verifyAuth, getSupabaseClient } from './auth-helpers.tsx';

/**
 * Self-service account deletion (required for App Store / Play Store).
 *
 * Mount in index.tsx:
 *   import accountRoutes from './account-routes.tsx';
 *   app.route('/make-server-fc8eb847/account', accountRoutes);
 *
 * POST /account/delete — auth required; wipes the caller's KV data, their
 * student_codes rows, teacher observations they authored or that are about
 * them, then deletes the auth user (which invalidates the session).
 */

const app = new Hono();

const TABLE = 'kv_store_fc8eb847';

app.post('/delete', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const uid = user.id;
  const admin = getSupabaseClient(true);

  try {
    // 1. KV rows keyed by this user (exact + prefix)
    const exactKeys = [`user:${uid}`, `daily_challenge:${uid}`, `gamification:${uid}`];
    await admin.from(TABLE).delete().in('key', exactKeys);

    const prefixes = [
      `result:${uid}:`,
      `progress:${uid}:`,
      `daily_challenge_response:${uid}:`,
      `checkin:${uid}:`,
      `reflection:${uid}:`,
      `challenge:${uid}:`,
      `skillplan:${uid}:`,
    ];
    for (const p of prefixes) {
      await admin.from(TABLE).delete().like('key', `${p}%`);
    }

    // 2. Parent observations authored by this user
    await admin.from(TABLE).delete().like('key', 'observation:%').eq('value->>parentId', uid);

    // 3. Teacher observations authored by / about this user
    await admin.from(TABLE).delete().like('key', 'teacher-observation:%').eq('value->>teacherId', uid);
    await admin.from(TABLE).delete().like('key', 'teacher-observation:%').eq('value->>studentId', uid);

    // 4. Institutional student codes
    await admin.from('student_codes').delete().eq('user_id', uid);

    // 5. The auth user itself — invalidates every session for this account
    const { error } = await admin.auth.admin.deleteUser(uid);
    if (error) {
      console.error('[account/delete] auth.admin.deleteUser:', error.message);
      return c.json({ error: 'Account data cleared, but final deletion failed. Contact support.' }, 500);
    }

    return c.json({ success: true });
  } catch (e) {
    console.error('[account/delete]', e);
    return c.json({ error: 'Failed to delete account' }, 500);
  }
});

export default app;
