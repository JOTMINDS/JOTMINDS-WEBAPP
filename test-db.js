const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data: insts } = await supabase.from('institutions').select('id, name');
  console.log('Institutions:', insts);
  const { data: members } = await supabase.from('institution_members').select('*');
  console.log('Members:', members);
}
run();
