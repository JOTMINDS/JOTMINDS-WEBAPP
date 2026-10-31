import { Hono } from 'npm:hono';
import { verifyAuth, getSupabaseClient } from './auth-helpers.tsx';
import { isPlatformAdmin } from './platform-admin.tsx';
import * as kv from './kv_store.tsx';

/**
 * One code for a whole class.
 *
 * Mount in index.tsx:
 *   app.route('/make-server-fc8eb847/class-code', classCodeRoutes);
 *
 * POST /generate  (teacher or school admin) — gives a class its CLS-XXXXXX code
 * POST /lookup    (public) — checks a class code, returns the class and school name
 * POST /join      (public) — a student enters the class code plus name and date of
 *                 birth. A matching roster entry that has never been used is claimed;
 *                 otherwise (with confirmNew) a new student is created. Either way the
 *                 student gets their own JM-XXXX-XXXX code and is signed in.
 *
 * Once a student has signed in, the class code cannot be used to sign in as them again,
 * so a classmate who knows their name and birthday cannot take over the account.
 */

const app = new Hono();

const TABLE = 'kv_store_fc8eb847';
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomChars(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i++) out += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  return out;
}

const generateClassCode = () => `CLS-${randomChars(6)}`;
const generateStudentCode = () => `JM-${randomChars(4)}-${randomChars(4)}`;

interface ClassInfo {
  id: string;
  name: string;
  institutionId: string | null;
  classTeacherId: string | null;
  educationLevel: string | null;
  classCode: string | null;
}

// A class can live in the classes table, the KV store, or both.
async function loadClass(admin: any, classId: string): Promise<ClassInfo | null> {
  const kvClass = await kv.get(`class:${classId}`).catch(() => null);
  const { data: dbClass } = await admin
    .from('classes')
    .select('id, name, institution_id, class_teacher_id, education_level, class_code')
    .eq('id', classId)
    .maybeSingle();
  if (!kvClass && !dbClass) return null;
  return {
    id: classId,
    name: dbClass?.name || kvClass?.name || 'Class',
    institutionId: dbClass?.institution_id || kvClass?.institutionId || null,
    classTeacherId: dbClass?.class_teacher_id || kvClass?.classTeacherId || null,
    educationLevel: dbClass?.education_level || kvClass?.educationLevel || null,
    classCode: dbClass?.class_code || kvClass?.classCode || null,
  };
}

async function findClassByCode(admin: any, rawCode: string): Promise<ClassInfo | null> {
  const code = String(rawCode || '').toUpperCase().trim();
  if (!/^CLS-[A-Z0-9]{6}$/.test(code)) return null;

  const { data: dbClass } = await admin.from('classes').select('id').eq('class_code', code).maybeSingle();
  if (dbClass?.id) return loadClass(admin, dbClass.id);

  const { data: kvRows } = await admin
    .from(TABLE)
    .select('value')
    .like('key', 'class:%')
    .eq('value->>classCode', code)
    .limit(1);
  const id = kvRows?.[0]?.value?.id;
  return id ? loadClass(admin, id) : null;
}

async function codeInUse(admin: any, code: string): Promise<boolean> {
  const { data: dbHit } = await admin.from('classes').select('id').eq('class_code', code).maybeSingle();
  if (dbHit) return true;
  const { data: kvHit } = await admin.from(TABLE).select('key').like('key', 'class:%').eq('value->>classCode', code).limit(1);
  return !!kvHit && kvHit.length > 0;
}

async function canManageClass(admin: any, userId: string, cls: ClassInfo): Promise<boolean> {
  if (cls.classTeacherId === userId) return true;
  const { data: assignment } = await admin
    .from('teacher_class_assignments')
    .select('id')
    .eq('class_id', cls.id)
    .eq('teacher_id', userId)
    .limit(1);
  if (assignment && assignment.length > 0) return true;
  if (cls.institutionId) {
    const { data: inst } = await admin.from('institutions').select('admin_id').eq('id', cls.institutionId).maybeSingle();
    if (inst?.admin_id === userId) return true;
    const { data: member } = await admin
      .from('institution_members')
      .select('role')
      .eq('institution_id', cls.institutionId)
      .eq('user_id', userId)
      .maybeSingle();
    if (member?.role === 'admin') return true;
  }
  return await isPlatformAdmin(userId);
}

// Counts events in a rolling window held in KV. Returns false once the limit is passed.
async function withinLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const entry = (await kv.get(key).catch(() => null)) || { count: 0, start: now };
  const state = now - entry.start > windowMs ? { count: 0, start: now } : entry;
  if (state.count >= limit) return false;
  await kv.set(key, { count: state.count + 1, start: state.start }).catch(() => {});
  return true;
}

const nameTokens = (name: string) =>
  String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z\s'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(' ');

function validDob(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  if (isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) return null;
  if (d.getTime() > Date.now() || d.getUTCFullYear() < 1950) return null;
  return value;
}

app.post('/generate', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { classId, regenerate } = await c.req.json();
    if (!classId) return c.json({ error: 'Missing class' }, 400);

    const admin = getSupabaseClient(true);
    const cls = await loadClass(admin, classId);
    if (!cls) return c.json({ error: 'Class not found' }, 404);
    if (!(await canManageClass(admin, user.id, cls))) {
      return c.json({ error: 'Only the class teacher or school administrators can do this' }, 403);
    }

    if (cls.classCode && !regenerate) return c.json({ success: true, classCode: cls.classCode });

    let code = '';
    for (let i = 0; i < 8; i++) {
      const candidate = generateClassCode();
      if (!(await codeInUse(admin, candidate))) { code = candidate; break; }
    }
    if (!code) return c.json({ error: 'Could not generate a unique code. Try again.' }, 500);

    const kvClass = await kv.get(`class:${classId}`).catch(() => null);
    if (kvClass) await kv.set(`class:${classId}`, { ...kvClass, classCode: code });
    await admin.from('classes').update({ class_code: code }).eq('id', classId);

    return c.json({ success: true, classCode: code });
  } catch (e) {
    console.error('[class-code/generate]', e);
    return c.json({ error: 'Failed to generate class code' }, 500);
  }
});

app.post('/lookup', async (c) => {
  try {
    const { code } = await c.req.json();
    const admin = getSupabaseClient(true);
    const cls = await findClassByCode(admin, code);
    if (!cls) return c.json({ valid: false });

    let schoolName: string | null = null;
    if (cls.institutionId) {
      const { data: inst } = await admin.from('institutions').select('name').eq('id', cls.institutionId).maybeSingle();
      schoolName = inst?.name || null;
    }
    return c.json({ valid: true, className: cls.name, schoolName });
  } catch (e) {
    console.error('[class-code/lookup]', e);
    return c.json({ valid: false });
  }
});

app.post('/join', async (c) => {
  try {
    const { code, studentName, dateOfBirth, confirmNew } = await c.req.json();
    const name = String(studentName || '').trim().replace(/\s+/g, ' ');
    const dob = validDob(dateOfBirth);
    if (name.length < 2 || name.length > 80) return c.json({ error: 'Please enter your full name.' }, 400);
    if (!dob) return c.json({ error: 'Please enter a valid date of birth.' }, 400);

    const admin = getSupabaseClient(true);
    const cls = await findClassByCode(admin, code);
    if (!cls) return c.json({ error: 'Class code not found. Check it and try again.' }, 404);

    if (!(await withinLimit(`classjoin:${cls.id}`, 300, 60 * 60 * 1000))) {
      return c.json({ error: 'Too many sign-ins for this class right now. Please try again later.' }, 429);
    }

    // Roster entries for this class: tied to the class, or the teacher's unplaced ones whose profile points here.
    const { data: classRows } = await admin
      .from('student_codes')
      .select('*')
      .eq('class_id', cls.id)
      .eq('is_active', true)
      .is('revoked_at', null);
    let candidates: any[] = classRows || [];
    if (cls.classTeacherId) {
      const { data: looseRows } = await admin
        .from('student_codes')
        .select('*')
        .is('class_id', null)
        .eq('teacher_id', cls.classTeacherId)
        .eq('is_active', true)
        .is('revoked_at', null);
      for (const row of looseRows || []) {
        const profile = await kv.get(`user:${row.user_id}`).catch(() => null);
        if (profile?.classId === cls.id) candidates.push(row);
      }
    }

    const wanted = nameTokens(name);
    const matches = candidates.filter(row =>
      nameTokens(row.student_name) === wanted && (!row.student_dob || row.student_dob === dob),
    );

    if (matches.length > 1) {
      return c.json({ error: 'More than one student matches those details. Please ask your teacher for your code.' }, 409);
    }

    const anon = getSupabaseClient();
    let userId: string;
    let studentCode: string;
    let isNew = false;

    if (matches.length === 1) {
      const row = matches[0];
      userId = row.user_id;

      // A student who has already signed in must use their own code from now on.
      const { data: authLookup } = await admin.auth.admin.getUserById(userId);
      const alreadyUsed = !!row.used_at || !!authLookup?.user?.last_sign_in_at;
      if (alreadyUsed) {
        return c.json({
          alreadyClaimed: true,
          error: 'You already have a personal code. Sign in with it, or ask your teacher to look it up for you.',
        }, 409);
      }
      studentCode = row.code;
      if (!row.student_dob) await admin.from('student_codes').update({ student_dob: dob }).eq('id', row.id);
    } else {
      if (!confirmNew) {
        return c.json({ success: false, notFound: true });
      }

      isNew = true;
      let newCode = '';
      for (let i = 0; i < 8; i++) {
        const candidate = generateStudentCode();
        const { data: taken } = await admin.from('student_codes').select('id').eq('code', candidate).maybeSingle();
        if (!taken) { newCode = candidate; break; }
      }
      if (!newCode) return c.json({ error: 'Could not create your code. Please try again.' }, 500);
      studentCode = newCode;

      const internalEmail = `${newCode.toLowerCase().replace(/-/g, '')}@student.jotminds.app`;
      const passwordChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
      const passBytes = new Uint8Array(32);
      crypto.getRandomValues(passBytes);
      let password = '';
      for (let i = 0; i < 32; i++) password += passwordChars[passBytes[i] % passwordChars.length];

      const teacherId = cls.classTeacherId || undefined;
      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email: internalEmail,
        password,
        email_confirm: true,
        user_metadata: {
          role: 'student', name, dateOfBirth: dob, studentCode: newCode,
          classId: cls.id, className: cls.name, teacherId, institutionId: cls.institutionId,
          educationLevel: cls.educationLevel,
        },
      });
      if (authError || !authData?.user) {
        console.error('[class-code/join] createUser:', authError?.message);
        return c.json({ error: 'Could not create your account. Please ask your teacher for help.' }, 500);
      }
      userId = authData.user.id;

      await kv.set(`user:${userId}`, {
        id: userId, email: internalEmail, name, role: 'student', dateOfBirth: dob,
        studentCode: newCode, classId: cls.id, className: cls.name, teacherId,
        institutionId: cls.institutionId, educationLevel: cls.educationLevel,
        joinedViaClassCode: cls.classCode, _internalAuth: password,
        createdAt: new Date().toISOString(), assessmentsCompleted: [], cognitiveProfile: null,
      });

      let institutionAdminId: string | null = null;
      if (!teacherId && cls.institutionId) {
        const { data: inst } = await admin.from('institutions').select('admin_id').eq('id', cls.institutionId).maybeSingle();
        institutionAdminId = inst?.admin_id || null;
      }
      const codeRow: Record<string, any> = {
        user_id: userId, code: newCode, student_name: name, student_dob: dob,
        class_id: cls.id, institution_id: cls.institutionId,
        teacher_id: teacherId || institutionAdminId || 'unassigned', is_active: true,
      };
      let { error: codeError } = await admin.from('student_codes').insert(codeRow);
      if (codeError && codeRow.class_id) {
        // The class may exist only in the KV store; keep the code anyway.
        delete codeRow.class_id;
        ({ error: codeError } = await admin.from('student_codes').insert(codeRow));
      }
      if (codeError) console.error('[class-code/join] code insert:', codeError.message);

      if (cls.institutionId) {
        await admin.from('institution_members').insert({
          user_id: userId, user_name: name, user_email: internalEmail, role: 'student',
          institution_id: cls.institutionId, status: 'approved',
        });
      }
      const { data: classRow } = await admin.from('classes').select('student_count').eq('id', cls.id).maybeSingle();
      if (classRow) {
        await admin.from('classes').update({ student_count: (classRow.student_count || 0) + 1 }).eq('id', cls.id);
      }
    }

    const profile = await kv.get(`user:${userId}`);
    if (!profile?._internalAuth) return c.json({ error: 'Account setup is incomplete. Please ask your teacher for help.' }, 500);

    const { data: authData, error: signInError } = await anon.auth.signInWithPassword({
      email: profile.email,
      password: profile._internalAuth,
    });
    if (signInError || !authData?.session) {
      console.error('[class-code/join] sign-in:', signInError?.message);
      return c.json({ error: 'Could not sign you in. Please try again.' }, 401);
    }

    await admin.from('student_codes').update({ used_at: new Date().toISOString() }).eq('user_id', userId).eq('code', studentCode);

    const { _internalAuth, ...safeProfile } = profile;
    return c.json({
      success: true,
      isNew,
      code: studentCode,
      session: authData.session,
      user: { id: authData.user.id, email: authData.user.email, ...authData.user.user_metadata, ...safeProfile },
    });
  } catch (e) {
    console.error('[class-code/join]', e);
    return c.json({ error: 'Something went wrong. Please try again.' }, 500);
  }
});

export default app;
