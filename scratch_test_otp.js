import { createClient } from '@supabase/supabase-js';

const projectId = "femvnconxoefpctiptkj";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847`;

async function test() {
  const email = "test_user_xyz@example.com";
  const otp = "123456";
  
  console.log("Sending OTP...");
  const res1 = await fetch(`${BASE_URL}/send-otp`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}` 
    },
    body: JSON.stringify({ email, otp })
  });
  
  console.log("Send OTP response:", res1.status, await res1.text());
  
  console.log("Verifying OTP...");
  const res2 = await fetch(`${BASE_URL}/verify-otp`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}` 
    },
    body: JSON.stringify({ email, otp })
  });
  
  console.log("Verify OTP response:", res2.status, await res2.text());
}

test();
