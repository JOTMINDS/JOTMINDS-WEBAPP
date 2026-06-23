/**
 * Fix Demo Admin Role
 * ===================
 * Updates the KV store profile for principal@greenfield.edu.gh
 * to role: 'school_admin' so they are routed to the institution dashboard.
 *
 * Run with: node fix_demo_admin_role.cjs
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://femvnconxoefpctiptkj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA';
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = `${supabaseUrl}/functions/v1/server/make-server-fc8eb847`;

const ADMIN_EMAIL = 'principal@greenfield.edu.gh';
const ADMIN_PASS  = 'JotMindsDemo2026!';

async function fixAdminRole() {
  console.log('\n══════════════════════════════════════════════════');
  console.log('  Fix Demo Admin Role → school_admin');
  console.log('══════════════════════════════════════════════════\n');

  // 1. Sign in to get access token
  console.log('▸ Step 1: Signing in as admin...');
  const { data: { session }, error: loginErr } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASS,
  });

  if (loginErr || !session) {
    console.error('✗ Login failed:', loginErr);
    return;
  }

  const token = session.access_token;
  console.log(`  ✓ Signed in. Token: ${token.substring(0, 30)}...\n`);

  // 2. Get institution info (so we can store organizationCode in KV)
  console.log('▸ Step 2: Fetching institution data...');
  const { data: inst, error: instErr } = await supabase
    .from('institutions')
    .select('id, code, name')
    .eq('admin_id', session.user.id)
    .single();

  if (instErr || !inst) {
    console.error('  ✗ Could not fetch institution:', instErr?.message);
    console.log('  ℹ Continuing without institution data...');
  } else {
    console.log(`  ✓ Institution: ${inst.name} (code: ${inst.code})\n`);
  }

  // 3. PATCH the user profile via the backend — this updates the KV store
  console.log('▸ Step 3: Patching KV store profile via backend PATCH /user/profile...');
  const profilePayload = {
    role: 'school_admin',
    name: 'Dr. Abena Darko',
    organizationName: inst?.name || 'Greenfield Academy',
    organizationCode: inst?.code || 'DEMO-GFA-2026',
    organizationType: 'Educational Institution',
    industrySector: 'Educational Institutions',
    phone: '0244100200',
  };

  console.log('  Payload:', JSON.stringify(profilePayload, null, 2));

  const res = await fetch(`${BASE_URL}/user/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profilePayload),
  });

  const result = await res.json();

  if (!res.ok) {
    console.error(`  ✗ PATCH failed (${res.status}):`, result);
    return;
  }

  console.log('  ✓ KV profile updated successfully:', result);

  // 4. Verify by fetching the session
  console.log('\n▸ Step 4: Verifying — fetching /session to confirm role...');
  const verifyRes = await fetch(`${BASE_URL}/session`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const verifyData = await verifyRes.json();

  if (verifyData.user) {
    console.log(`  ✓ Role is now: "${verifyData.user.role}"`);
    console.log(`  ✓ organizationType: "${verifyData.user.organizationType}"`);
    console.log(`  ✓ organizationCode: "${verifyData.user.organizationCode}"`);
  } else {
    console.error('  ✗ Session verify failed:', verifyData);
    return;
  }

  console.log('\n══════════════════════════════════════════════════');
  console.log('  ✅  Done!');
  console.log('');
  console.log('  Login with:');
  console.log(`    Email:    ${ADMIN_EMAIL}`);
  console.log(`    Password: ${ADMIN_PASS}`);
  console.log('');
  console.log('  The account will now route to the Institution');
  console.log('  Dashboard (not the student dashboard).');
  console.log('══════════════════════════════════════════════════\n');
}

fixAdminRole().catch(console.error);
