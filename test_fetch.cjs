const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://femvnconxoefpctiptkj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  console.log('Signing in as Headmaster...');
  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email: 'headmaster@stpeter.edu',
    password: 'StPeterJotminds2026!'
  });

  if (error) {
    console.error('Error signing in:', error);
    return;
  }

  console.log('Fetching institution for admin ID:', user.id);
  const { data, error: fetchErr } = await supabase
    .from('institutions')
    .select('*')
    .eq('admin_id', user.id)
    .maybeSingle();

  console.log('Result:', data);
  console.log('Error:', fetchErr);

  console.log('Fetching members...');
  if (data) {
    const { data: memData, error: memErr } = await supabase
      .from('institution_members')
      .select('*')
      .eq('institution_id', data.id);
    console.log('Members:', memData);
    console.log('Member Error:', memErr);
  }
}

testFetch();
