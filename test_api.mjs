import { readFileSync } from 'fs';

const projectId = "femvnconxoefpctiptkj";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847`;

async function run() {
  console.log('Fetching...');
  const res = await fetch(`${BASE_URL}/assessment/results`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  });
  const data = await res.json();
  console.log(JSON.stringify(data).substring(0, 1000));
}
run();
