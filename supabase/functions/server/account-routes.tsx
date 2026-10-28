import { Hono } from 'npm:hono';
import { verifyAuth } from './auth-helpers.tsx';
import { wipeAccount } from './account-cleanup.tsx';

/**
 * Self-service account deletion (required for App Store / Play Store).
 *
 * Mount in index.tsx:
 *   import accountRoutes from './account-routes.tsx';
 *   app.route('/make-server-fc8eb847/account', accountRoutes);
 *
 * POST /account/delete — auth required; wipes the caller's KV data, their
 * links (parents, children, consent, school membership), student_codes rows,
 * teacher observations they authored or that are about them, then deletes the
 * auth user (which invalidates the session).
 */

const app = new Hono();

app.post('/delete', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { authError } = await wipeAccount(user.id);
    if (authError) {
      console.error('[account/delete] auth.admin.deleteUser:', authError);
      return c.json({ error: 'Account data cleared, but final deletion failed. Contact support.' }, 500);
    }

    return c.json({ success: true });
  } catch (e) {
    console.error('[account/delete]', e);
    return c.json({ error: 'Failed to delete account' }, 500);
  }
});

export default app;
