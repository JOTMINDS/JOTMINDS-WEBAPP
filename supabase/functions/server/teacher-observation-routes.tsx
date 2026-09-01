import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { verifyAuth } from './auth-helpers.tsx';

/**
 * Teacher Observation routes.
 *
 * A teacher records a short, structured observation about a student and
 * optionally shares it with the student's linked parent(s). Backs both the
 * mobile "Observation log" and the parent-facing "3-way alignment" view.
 *
 * Mount in index.tsx alongside the other sub-routers:
 *   import teacherObservationRoutes from './teacher-observation-routes.tsx';
 *   app.route('/make-server-fc8eb847/teacher-observation', teacherObservationRoutes);
 *
 * KV key pattern:  teacher-observation:{observationId}
 *   observationId = tobs-{teacherId}-{timestamp}
 */

const app = new Hono();

const CONCERN_TYPES = [
  'Academic Focus',
  'Behavioral / Attention',
  'Social Interaction',
  'Learning Pace',
  'Commendation',
];
const SEVERITIES = ['low', 'medium', 'high'];

const PREFIX = 'teacher-observation:';

function sortByCreatedDesc<T extends { createdAt?: string }>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
  );
}

// ── Create ───────────────────────────────────────────────────────────────
app.post('/', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const profile = await kv.get(`user:${user.id}`);
    const role = profile?.role || user.user_metadata?.role || '';
    if (role !== 'teacher' && role !== 'admin') {
      return c.json({ error: 'Forbidden - Teacher access required' }, 403);
    }

    const body = await c.req.json();
    const {
      studentId,
      studentName,
      subject,
      concernType,
      severity,
      observationText,
      recommendedAction,
      shareWithParent,
    } = body || {};

    if (!studentId || !observationText || !concernType || !severity) {
      return c.json(
        { error: 'studentId, concernType, severity and observationText are required' },
        400,
      );
    }
    if (!CONCERN_TYPES.includes(concernType)) {
      return c.json({ error: `concernType must be one of: ${CONCERN_TYPES.join(', ')}` }, 400);
    }
    if (!SEVERITIES.includes(severity)) {
      return c.json({ error: `severity must be one of: ${SEVERITIES.join(', ')}` }, 400);
    }

    const now = new Date().toISOString();
    const id = `tobs-${user.id}-${Date.now()}`;
    const observation = {
      id,
      teacherId: user.id,
      teacherName: profile?.name || user.user_metadata?.name || 'Teacher',
      studentId,
      studentName: studentName || '',
      subject: subject || '',
      concernType,
      severity,
      observationText: String(observationText).slice(0, 4000),
      recommendedAction: recommendedAction ? String(recommendedAction).slice(0, 2000) : '',
      sharedWithParent: shareWithParent !== false, // default: shared
      createdAt: now,
      updatedAt: now,
    };

    await kv.set(`${PREFIX}${id}`, observation);
    return c.json({ success: true, observation });
  } catch (error) {
    console.error('[teacher-observation] create error:', error);
    return c.json({ error: 'Failed to save observation' }, 500);
  }
});

// ── List by teacher (the author's own log) ───────────────────────────────
app.get('/teacher/:teacherId', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const teacherId = c.req.param('teacherId');
    const profile = await kv.get(`user:${user.id}`);
    const isAdmin = (profile?.role || user.user_metadata?.role) === 'admin';
    if (user.id !== teacherId && !isAdmin) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const all = await kv.getByPrefix(PREFIX);
    const mine = all.filter((o: any) => o.teacherId === teacherId);
    return c.json({ success: true, observations: sortByCreatedDesc(mine) });
  } catch (error) {
    console.error('[teacher-observation] list-by-teacher error:', error);
    return c.json({ error: 'Failed to fetch observations' }, 500);
  }
});

// ── List by child (student self, linked parent, or the author) ───────────
app.get('/child/:childId', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const childId = c.req.param('childId');
    const profile = await kv.get(`user:${user.id}`);
    const role = profile?.role || user.user_metadata?.role || '';

    const all = await kv.getByPrefix(PREFIX);
    const forChild = all.filter((o: any) => o.studentId === childId);

    // Visibility:
    //  - the student themselves: everything about them
    //  - admin: everything
    //  - the authoring teacher: their own entries
    //  - a linked parent: only entries flagged sharedWithParent
    let visible: any[];
    if (user.id === childId || role === 'admin') {
      visible = forChild;
    } else if (role === 'teacher') {
      visible = forChild.filter((o: any) => o.teacherId === user.id);
    } else if (role === 'parent') {
      const linked: string[] = profile?.linkedChildren || [];
      if (!linked.includes(childId)) return c.json({ error: 'Forbidden' }, 403);
      visible = forChild.filter((o: any) => o.sharedWithParent);
    } else {
      return c.json({ error: 'Forbidden' }, 403);
    }

    return c.json({ success: true, observations: sortByCreatedDesc(visible) });
  } catch (error) {
    console.error('[teacher-observation] list-by-child error:', error);
    return c.json({ error: 'Failed to fetch observations' }, 500);
  }
});

// ── Delete (author or admin) ────────────────────────────────────────────
app.delete('/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    const existing = await kv.get(`${PREFIX}${id}`);
    if (!existing) return c.json({ success: true }); // already gone

    const profile = await kv.get(`user:${user.id}`);
    const isAdmin = (profile?.role || user.user_metadata?.role) === 'admin';
    if (existing.teacherId !== user.id && !isAdmin) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await kv.del(`${PREFIX}${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('[teacher-observation] delete error:', error);
    return c.json({ error: 'Failed to delete observation' }, 500);
  }
});

export default app;
