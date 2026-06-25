import { createClient } from '@supabase/supabase-js';

const projectId = "femvnconxoefpctiptkj";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA";

const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

async function test() {
  const email = "test_user_xyz@example.com";
  
  console.log("Requesting sign in with OTP...");
  const { data: d1, error: e1 } = await supabase.auth.signInWithOtp({ email });
  console.log("Send OTP response:", d1, e1?.message);
}

test();
