const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function main() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const env = Object.fromEntries(envContent.split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split('=')));
  
  const supabaseUrl = env.VITE_SUPABASE_URL || "https://uimqikdihbovsclzclch.supabase.co";
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('Logging in...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'Alex.Attachey@gmail.com',
    password: '0248838540',
  });
  
  if (error) {
    console.error('Login error:', error);
    return;
  }
  
  console.log('User metadata role:', data.user.user_metadata.role);
  
  console.log('Fetching session from backend...');
  const res = await fetch('https://jotminds.com/make-server-fc8eb847/session', {
    headers: {
      'Authorization': `Bearer ${data.session.access_token}`
    }
  });
  
  const result = await res.json();
  console.log('Session response:', JSON.stringify(result, null, 2));
}

main();
