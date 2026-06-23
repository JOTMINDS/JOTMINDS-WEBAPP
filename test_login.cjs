const { createClient } = require('@supabase/supabase-js');

const PROJECT_ID = 'femvnconxoefpctiptkj';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA';

const supabase = createClient(`https://${PROJECT_ID}.supabase.co`, ANON_KEY);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin_1781776954893@jotminds.demo',
    password: 'Password123!'
  });
  
  if (error) {
    console.error('Login error:', error);
    return;
  }
  
  const accessToken = data.session.access_token;
  
  const res = await fetch(`https://${PROJECT_ID}.supabase.co/functions/v1/make-server-fc8eb847/session`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Body:', text);
}

test();
