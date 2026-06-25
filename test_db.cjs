const { createClient } = require('@supabase/supabase-js');

const PROJECT_ID = 'femvnconxoefpctiptkj';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA';

const supabase = createClient(`https://${PROJECT_ID}.supabase.co`, ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('kv_store_fc8eb847').select('*').eq('key', 'admin:user').maybeSingle();
  if (error) {
    console.error('Error fetching admin:user from KV:', error);
  } else {
    console.log('admin:user in KV store:', data);
  }
}
test();
