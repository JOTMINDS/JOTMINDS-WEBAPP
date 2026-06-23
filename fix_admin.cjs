const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://femvnconxoefpctiptkj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAdminRole() {
  console.log('Signing in as Headmaster...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'headmaster@stpeter.edu',
    password: 'StPeterJotminds2026!'
  });

  if (error) {
    console.error('Error signing in:', error);
    return;
  }

  console.log('Updating user metadata role to school_admin...');
  const { error: updateErr } = await supabase.auth.updateUser({
    data: { role: 'school_admin' }
  });

  if (updateErr) {
    console.error('Error updating user:', updateErr);
  } else {
    console.log('Successfully updated Headmaster role to school_admin!');
  }
}

fixAdminRole();
