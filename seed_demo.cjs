/**
 * JotMinds Demo Seed Script
 * ========================
 * Creates a complete demo environment with:
 *   - 1 School / Educational Institution (Greenfield Academy)
 *   - 1 School Admin / Headmistress account
 *   - 1 Teacher / Educator account
 *   - 6 Student accounts
 *
 * Run with: node seed_demo.cjs
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = 'https://femvnconxoefpctiptkj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA';
const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Account Credentials ────────────────────────────────────────────────────
const DEMO_PASSWORD = 'JotMindsDemo2026!';

const ADMIN = {
  email: 'principal@greenfield.edu.gh',
  name: 'Dr. Abena Darko',
  phone: '0244100200',
};

const TEACHER = {
  email: 'teacher.demo@greenfield.edu.gh',
  name: 'Mr. Kweku Asante',
  phone: '0244300400',
};

const STUDENTS = [
  { name: 'Ama Boateng',      email: 'ama.boateng@greenfield.edu.gh',   phone: '0201000001' },
  { name: 'Kofi Mensah',      email: 'kofi.mensah@greenfield.edu.gh',   phone: '0201000002' },
  { name: 'Akosua Adjei',     email: 'akosua.adjei@greenfield.edu.gh',  phone: '0201000003' },
  { name: 'Yaw Ofori',        email: 'yaw.ofori@greenfield.edu.gh',     phone: '0201000004' },
  { name: 'Abena Frimpong',   email: 'abena.frimpong@greenfield.edu.gh',phone: '0201000005' },
  { name: 'Kwame Duodu',      email: 'kwame.duodu@greenfield.edu.gh',   phone: '0201000006' },
];

const INSTITUTION_CODE = 'DEMO-GFA-2026';

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function getOrCreateUser(email, password, name, role) {
  console.log(`  ↪ Registering ${name} (${email})...`);
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role } },
  });

  if (signUpErr) {
    if (signUpErr.message.includes('already registered') || signUpErr.message.includes('User already registered')) {
      console.log(`    → Already exists. Signing in...`);
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) throw new Error(`Sign-in failed for ${email}: ${signInErr.message}`);
      return signInData.user;
    }
    throw new Error(`Sign-up failed for ${email}: ${signUpErr.message}`);
  }

  return signUpData.user;
}

// ─── Main Seed Function ──────────────────────────────────────────────────────
async function seedDemo() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║       JotMinds Demo Seed – Greenfield Academy    ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // ── 1. Create Admin account ─────────────────────────────────────────────
  console.log('▸ Step 1: Creating Admin / Headmistress account...');
  const adminUser = await getOrCreateUser(ADMIN.email, DEMO_PASSWORD, ADMIN.name, 'teacher');
  if (!adminUser) { console.error('Failed to create admin.'); return; }
  console.log(`  ✓ Admin ID: ${adminUser.id}\n`);

  // ── 2. Create Teacher account ────────────────────────────────────────────
  console.log('▸ Step 2: Creating Teacher / Educator account...');
  const teacherUser = await getOrCreateUser(TEACHER.email, DEMO_PASSWORD, TEACHER.name, 'teacher');
  if (!teacherUser) { console.error('Failed to create teacher.'); return; }
  console.log(`  ✓ Teacher ID: ${teacherUser.id}\n`);

  // ── 3. Create Student accounts ───────────────────────────────────────────
  console.log('▸ Step 3: Creating Student accounts...');
  const studentUsers = [];
  for (const s of STUDENTS) {
    const u = await getOrCreateUser(s.email, DEMO_PASSWORD, s.name, 'student');
    if (u) studentUsers.push({ ...s, id: u.id });
  }
  console.log(`  ✓ ${studentUsers.length} student(s) ready\n`);

  // ── 4. Sign in as Admin and create the Institution ───────────────────────
  console.log('▸ Step 4: Signing in as Admin to create Institution...');
  await supabase.auth.signInWithPassword({ email: ADMIN.email, password: DEMO_PASSWORD });

  const institutionId = crypto.randomUUID();

  const { error: instErr } = await supabase.from('institutions').insert({
    id: institutionId,
    name: 'Greenfield Academy',
    type: 'SHS',
    address: '45 Learning Boulevard, Kumasi',
    region: 'Ashanti',
    district: 'Kumasi Metropolitan',
    email: 'info@greenfield.edu.gh',
    phone: '0322000001',
    website: 'www.greenfield.edu.gh',
    tagline: 'Nurturing Minds, Building Futures',
    teacher_size: '51-200',
    student_size: '501-1000',
    admin_id: adminUser.id,
    admin_name: ADMIN.name,
    admin_email: ADMIN.email,
    admin_phone: ADMIN.phone,
    code: INSTITUTION_CODE,
    code_generated_at: new Date().toISOString(),
    code_expiry_days: null,
    is_active: true,
    email_verified: true,
    phone_verified: true,
    updated_at: new Date().toISOString(),
  });

  if (instErr) {
    if (instErr.code === '23505') {
      console.log('  ℹ Institution or code already exists — skipping insert.');
    } else {
      console.error('  ✗ Error creating institution:', instErr);
      return;
    }
  } else {
    console.log(`  ✓ Institution created: Greenfield Academy (code: ${INSTITUTION_CODE})\n`);
  }

  // Retrieve the institution (handles existing case)
  const { data: inst } = await supabase
    .from('institutions')
    .select('id, code')
    .eq('admin_id', adminUser.id)
    .single();

  if (!inst) { console.error('Institution not found after creation.'); return; }

  // ── 5. Add Admin as institution member ──────────────────────────────────
  console.log('▸ Step 5: Adding Admin to institution_members...');
  const { error: adminMemberErr } = await supabase.from('institution_members').upsert({
    institution_id: inst.id,
    user_id: adminUser.id,
    user_name: ADMIN.name,
    user_email: ADMIN.email,
    user_phone: ADMIN.phone,
    role: 'admin',
    joined_via_code: inst.code,
    status: 'approved',
    joined_at: new Date().toISOString(),
  }, { onConflict: 'user_id, institution_id' });

  if (adminMemberErr) console.error('  ✗ Admin member insert error:', adminMemberErr);
  else console.log('  ✓ Admin added as member\n');

  // ── 6. Add Teacher as institution member ────────────────────────────────
  console.log('▸ Step 6: Adding Teacher to institution_members...');
  const { error: teacherMemberErr } = await supabase.from('institution_members').upsert({
    institution_id: inst.id,
    user_id: teacherUser.id,
    user_name: TEACHER.name,
    user_email: TEACHER.email,
    user_phone: TEACHER.phone,
    role: 'teacher',
    joined_via_code: inst.code,
    status: 'approved',
    joined_at: new Date().toISOString(),
  }, { onConflict: 'user_id, institution_id' });

  if (teacherMemberErr) console.error('  ✗ Teacher member insert error:', teacherMemberErr);
  else console.log('  ✓ Teacher added as member\n');

  // ── 7. Add Students as institution members ───────────────────────────────
  console.log('▸ Step 7: Adding Students to institution_members...');
  for (const s of studentUsers) {
    const { error: sMemberErr } = await supabase.from('institution_members').upsert({
      institution_id: inst.id,
      user_id: s.id,
      user_name: s.name,
      user_email: s.email,
      user_phone: s.phone,
      role: 'student',
      joined_via_code: inst.code,
      status: 'approved',
      joined_at: new Date().toISOString(),
    }, { onConflict: 'user_id, institution_id' });

    if (sMemberErr) console.error(`  ✗ Failed to add ${s.name}:`, sMemberErr);
    else console.log(`  ✓ Added student: ${s.name}`);
  }

  // ── 8. Print Summary ─────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║              ✅  SEED COMPLETE                   ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  INSTITUTION                                      ║');
  console.log('║  Name:  Greenfield Academy                        ║');
  console.log('║  Code:  DEMO-GFA-2026                             ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  SCHOOL ADMIN / HEADMISTRESS                      ║');
  console.log(`║  Email: ${ADMIN.email.padEnd(40)} ║`);
  console.log(`║  Pass:  ${DEMO_PASSWORD.padEnd(40)} ║`);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  TEACHER / EDUCATOR                               ║');
  console.log(`║  Email: ${TEACHER.email.padEnd(40)} ║`);
  console.log(`║  Pass:  ${DEMO_PASSWORD.padEnd(40)} ║`);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  STUDENTS (all share the same password)           ║');
  for (const s of STUDENTS) {
    console.log(`║  ${s.email.padEnd(48)} ║`);
  }
  console.log(`║  Pass:  ${DEMO_PASSWORD.padEnd(40)} ║`);
  console.log('╚══════════════════════════════════════════════════╝\n');
}

seedDemo().catch(console.error);
