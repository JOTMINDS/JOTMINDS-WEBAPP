const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://femvnconxoefpctiptkj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const email = 'alexattachey@jotminds.com';
  console.log(`Checking for user with email: ${email}`);
  
  // Check users table
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .ilike('email', email);
    
  if (userError) {
    console.error('Error querying users table:', userError);
  } else {
    console.log(`Found ${users.length} matching users in 'users' table.`);
    if (users.length > 0) {
      console.log(users);
    }
  }
}

checkUser();
