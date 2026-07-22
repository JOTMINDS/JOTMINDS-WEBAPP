import { readFileSync } from 'fs';
import { projectId, publicAnonKey } from './src/app/utils/supabase/info.js';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847`;

async function run() {
  console.log('Fetching...');
  const res = await fetch(`${BASE_URL}/assessment/results`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  });
  const data = await res.json();
  console.log(JSON.stringify(data).substring(0, 500));
}
run();
