import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/std@0.224.0/dotenv/load.ts";

const supabase = createClient(
  Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")!,
  Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")!
);

async function run() {
  const { data: insts } = await supabase.from('institutions').select('id, name');
  console.log('Institutions:', insts);
  
  const { data: members } = await supabase.from('institution_members').select('*');
  console.log('Members count:', members?.length);
  if (members && members.length > 0) {
    console.log('Sample members:', members.slice(0, 5));
  }
}

run();
