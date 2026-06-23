require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Try to create a dummy institution or update an existing one
  const { data: insts, error: fetchErr } = await supabase.from('institutions').select('id').limit(1);
  if (fetchErr) {
    console.error("Fetch error:", fetchErr);
    return;
  }
  
  if (insts.length === 0) {
    console.log("No institutions found");
    return;
  }

  const instId = insts[0].id;
  console.log("Updating logo for institution:", instId);
  
  // Create a 10KB dummy base64 string
  const dummyBase64 = "data:image/png;base64," + "A".repeat(10000);
  
  const { error } = await supabase
    .from('institutions')
    .update({ logo: dummyBase64 })
    .eq('id', instId);
    
  if (error) {
    console.error("Update error:", error);
  } else {
    console.log("Update successful!");
  }
}

run();
