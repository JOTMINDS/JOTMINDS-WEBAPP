import { getSupabaseClient } from './auth-helpers.tsx';
import * as kv from './kv_store.tsx';

const TABLE = 'kv_store_fc8eb847';

/**
 * Removes every link that points at an account so other people's screens stop
 * listing it: parents' linkedChildren, children's linkedParents, consent and
 * access-request records, institution memberships, student codes and the
 * users table row. Safe to run for an account that is already half deleted.
 */
export async function purgeAccountLinks(uid: string): Promise<void> {
  const admin = getSupabaseClient(true);
  const profile = await kv.get(`user:${uid}`).catch(() => null);

  // Parents that list this account as a child.
  const parentIds = new Set<string>(Array.isArray(profile?.linkedParents) ? profile.linkedParents : []);
  try {
    const { data } = await admin
      .from(TABLE)
      .select('key')
      .like('key', 'user:%')
      .filter('value->linkedChildren', 'cs', JSON.stringify([uid]));
    (data || []).forEach((row: any) => parentIds.add(String(row.key).slice('user:'.length)));
  } catch (e) {
    console.warn('[account-cleanup] parent lookup failed:', e);
  }
  for (const parentId of parentIds) {
    const parent = await kv.get(`user:${parentId}`).catch(() => null);
    if (parent && Array.isArray(parent.linkedChildren) && parent.linkedChildren.includes(uid)) {
      await kv.set(`user:${parentId}`, {
        ...parent,
        linkedChildren: parent.linkedChildren.filter((id: string) => id !== uid),
      });
    }
  }

  // Children that list this account as a parent.
  const childIds: string[] = Array.isArray(profile?.linkedChildren) ? profile.linkedChildren : [];
  for (const childId of childIds) {
    const child = await kv.get(`user:${childId}`).catch(() => null);
    if (child && Array.isArray(child.linkedParents) && child.linkedParents.includes(uid)) {
      await kv.set(`user:${childId}`, {
        ...child,
        linkedParents: child.linkedParents.filter((id: string) => id !== uid),
      });
    }
  }

  // Consent and access-request records name both sides in the key.
  await admin.from(TABLE).delete().like('key', `consent:${uid}:%`);
  await admin.from(TABLE).delete().like('key', `consent:%:${uid}`);
  await admin.from(TABLE).delete().like('key', `access_request:${uid}:%`);
  await admin.from(TABLE).delete().like('key', `access_request:%:${uid}:%`);

  await admin.from('institution_members').delete().eq('user_id', uid);
  await admin.from('student_codes').delete().eq('user_id', uid);
  await admin.from('users').delete().eq('id', uid);
}

/**
 * Deletes an account's stored data and links, then the auth user itself.
 * Returns the auth error message when that final step fails.
 */
export async function wipeAccount(uid: string): Promise<{ authError?: string }> {
  const admin = getSupabaseClient(true);

  await purgeAccountLinks(uid);

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

  // Parent observations authored by this user
  await admin.from(TABLE).delete().like('key', 'observation:%').eq('value->>parentId', uid);

  // Teacher observations authored by / about this user
  await admin.from(TABLE).delete().like('key', 'teacher-observation:%').eq('value->>teacherId', uid);
  await admin.from(TABLE).delete().like('key', 'teacher-observation:%').eq('value->>studentId', uid);

  const { error } = await admin.auth.admin.deleteUser(uid);
  if (error) {
    // "Not found" means the auth user is already gone, which is the goal.
    const alreadyGone = (error as any).status === 404 || /not found/i.test(error.message || '');
    if (!alreadyGone) return { authError: error.message };
  }
  return {};
}

/**
 * Returns the parent's linked children that still exist, and saves the parent's
 * list without the ones whose profile or login account has been deleted.
 */
export async function pruneDeletedChildren(
  parentId: string,
  parentProfile: any,
  existingProfileIds: Set<string>,
): Promise<Set<string>> {
  const linked: string[] = Array.isArray(parentProfile?.linkedChildren) ? parentProfile.linkedChildren : [];
  const withProfile = linked.filter((id) => existingProfileIds.has(id));
  const exists = await Promise.all(withProfile.map((id) => authUserExists(id)));
  const live = new Set(withProfile.filter((_, i) => exists[i]));
  if (live.size !== linked.length) {
    await kv.set(`user:${parentId}`, {
      ...parentProfile,
      linkedChildren: linked.filter((id) => live.has(id)),
    });
  }
  return live;
}

/**
 * True unless the auth user is definitely gone. A transient lookup failure
 * counts as "exists" so a network blip never removes a real link.
 */
export async function authUserExists(uid: string): Promise<boolean> {
  try {
    const { data, error } = await getSupabaseClient(true).auth.admin.getUserById(uid);
    if (error) {
      const gone = (error as any).status === 404 || /not found/i.test(error.message || '');
      return !gone;
    }
    return !!data?.user;
  } catch {
    return true;
  }
}
