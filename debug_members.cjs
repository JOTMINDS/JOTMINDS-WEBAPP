/**
 * Debug: Check if admin can read institution_members via Supabase RLS
 * Run with: node debug_members.cjs
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://femvnconxoefpctiptkj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugMembers() {
  // Sign in as admin
  const { data: { session } } = await supabase.auth.signInWithPassword({
    email: 'principal@greenfield.edu.gh',
    password: 'JotMindsDemo2026!'
  });

  console.log('\n=== Admin user ID:', session?.user?.id, '===\n');

  // 1. Get institution
  const { data: inst, error: instErr } = await supabase
    .from('institutions')
    .select('id, name, admin_id, code')
    .eq('admin_id', session.user.id)
    .single();

  if (instErr) console.error('Institution error:', instErr);
  else console.log('✓ Institution found:', inst?.name, '| ID:', inst?.id);

  if (!inst) return;

  // 2. Get members
  const { data: members, error: membersErr } = await supabase
    .from('institution_members')
    .select('*')
    .eq('institution_id', inst.id);

  if (membersErr) {
    console.error('✗ Members RLS error:', membersErr);
  } else {
    console.log(`\n✓ Members returned: ${members?.length || 0}`);
    members?.forEach(m => {
      console.log(`  - ${m.user_name} (${m.role}, ${m.status})`);
    });
  }

  // 3. Get invitations
  const { data: invites, error: invErr } = await supabase
    .from('institution_invitations')
    .select('*')
    .eq('institution_id', inst.id);

  if (invErr) console.error('\n✗ Invitations RLS error:', invErr);
  else console.log(`\n✓ Invitations returned: ${invites?.length || 0}`);

  console.log('\n=== Done ===\n');
}

debugMembers().catch(console.error);
