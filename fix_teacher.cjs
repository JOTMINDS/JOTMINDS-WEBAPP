const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://femvnconxoefpctiptkj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTeacher() {
  console.log('Signing in as Headmaster to insert Teacher...');
  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email: 'headmaster@stpeter.edu',
    password: 'StPeterJotminds2026!'
  });

  if (error) {
    console.error('Error signing in:', error);
    return;
  }

  // Get institution
  const { data: inst } = await supabase
    .from('institutions')
    .select('id, code')
    .eq('admin_id', user.id)
    .single();

  // Get teacher ID
  const { data: { user: teacherAuth }, error: teacherLoginErr } = await supabase.auth.signInWithPassword({
    email: 'teacher@stpeter.edu',
    password: 'StPeterJotminds2026!'
  });

  // Re-login as headmaster
  await supabase.auth.signInWithPassword({
    email: 'headmaster@stpeter.edu',
    password: 'StPeterJotminds2026!'
  });

  console.log('Inserting teacher record...');
  const { error: insertErr } = await supabase.from('institution_members').upsert({
    institution_id: inst.id,
    user_id: teacherAuth.id,
    user_name: 'Mr. Osei',
    user_email: 'teacher@stpeter.edu',
    user_phone: '0209876543',
    role: 'teacher',
    joined_via_code: inst.code,
    status: 'approved',
    joined_at: new Date().toISOString()
  });

  if (insertErr) {
    console.error('Failed to insert teacher:', insertErr);
  } else {
    console.log('Successfully inserted teacher!');
  }
}

insertTeacher();
