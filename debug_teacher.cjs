/**
 * Debug: Check teacher KV profile and student KV entries
 * Run with: node debug_teacher.cjs
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://femvnconxoefpctiptkj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA';
const supabase = createClient(supabaseUrl, supabaseKey);

const projectId = 'femvnconxoefpctiptkj';
const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847`;

async function debug() {
  // Sign in as teacher
  const { data: { session } } = await supabase.auth.signInWithPassword({
    email: 'teacher.demo@greenfield.edu.gh',
    password: 'JotMindsDemo2026!'
  });

  if (!session) { console.error('Login failed'); return; }
  console.log('\n=== Teacher user ID:', session.user.id, '===\n');

  // Fetch teacher session/KV profile from backend
  const res = await fetch(`${BASE_URL}/session`, {
    headers: { 'Authorization': `Bearer ${session.access_token}` }
  });
  const data = await res.json();
  console.log('Teacher KV profile:', JSON.stringify(data.user || data, null, 2));

  // Fetch what /teacher/students returns
  const studRes = await fetch(`${BASE_URL}/teacher/students`, {
    headers: { 'Authorization': `Bearer ${session.access_token}` }
  });
  const studData = await studRes.json();
  console.log('\n/teacher/students response:', JSON.stringify(studData, null, 2));

  // Check institution_members for this teacher
  const { data: members } = await supabase
    .from('institution_members')
    .select('*')
    .eq('user_id', session.user.id);
  console.log('\nTeacher institution_members entries:', JSON.stringify(members, null, 2));

  // Check what students are in institution_members
  const { data: studentMembers } = await supabase
    .from('institution_members')
    .select('*')
    .eq('role', 'student');
  console.log('\nStudent institution_members entries:', studentMembers?.length, 'students');
  studentMembers?.forEach(m => console.log(' -', m.user_name, '| user_id:', m.user_id, '| institution_id:', m.institution_id));
}

debug().catch(console.error);
