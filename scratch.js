import fs from 'fs';

const envLocal = fs.readFileSync('.env.local', 'utf8');
const lines = envLocal.split('\n');
let url = '';
let key = '';

for (const line of lines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
}

console.log('URL:', url);
console.log('KEY:', key.substring(0, 10) + '...');

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);

async function run() {
  const { data: insts } = await supabase.from('institutions').select('id, name, admin_id, co_admin_ids');
  console.log('Institutions:', insts);
  
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.log("Error fetching users:", error);
  } else {
    for (const u of users.users) {
      console.log(`User: ${u.email} | ID: ${u.id} | Role: ${u.user_metadata?.role}`);
    }
  }
}
run();
