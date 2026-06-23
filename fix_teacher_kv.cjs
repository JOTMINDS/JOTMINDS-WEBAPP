/**
 * Fix teacher KV profile: add school, organizationName, institution_id
 * Run with: node fix_teacher_kv.cjs
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://femvnconxoefpctiptkj.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
if (!serviceKey) { console.error('Set SUPABASE_SERVICE_KEY env var'); process.exit(1); }

const supabase = createClient(supabaseUrl, serviceKey);
const projectId = 'femvnconxoefpctiptkj';
const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847`;

async function fixTeacher() {
  const TEACHER_ID = '561cdcf7-bd68-4a8b-899a-8c8684a5c743';
  const INSTITUTION_ID = '246a437c-4151-4350-a0dc-81a0182eea07';
  const SCHOOL_NAME = 'Greenfield Academy';

  // Sign in as service role to get admin token for PATCH
  const { data: { session } } = await supabase.auth.signInWithPassword({
    email: 'principal@greenfield.edu.gh',
    password: 'JotMindsDemo2026!'
  });

  if (!session) { console.error('Admin login failed'); return; }

  // Patch teacher KV via PATCH /user/profile — we need to sign in AS the teacher
  // Use service role to directly upsert to the kv table if available, 
  // otherwise patch via the admin Supabase auth

  // Direct KV write via kv_store_fc8eb847 table (service role)
  const { error } = await supabase
    .from('kv_store_fc8eb847')
    .upsert({
      key: `user:${TEACHER_ID}`,
      value: JSON.stringify({
        id: TEACHER_ID,
        email: 'teacher.demo@greenfield.edu.gh',
        name: 'Mr. Kweku Asante',
        role: 'teacher',
        school: SCHOOL_NAME,
        organizationName: SCHOOL_NAME,
        institution_id: INSTITUTION_ID,
        phone: '0244300400',
        classCode: 'CLASS-3NL3UE',
        updatedAt: new Date().toISOString()
      })
    }, { onConflict: 'key' });

  if (error) {
    console.error('KV upsert error:', error);
  } else {
    console.log('✓ Teacher KV profile patched with school:', SCHOOL_NAME);
  }
}

fixTeacher().catch(console.error);
