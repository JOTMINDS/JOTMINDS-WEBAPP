import fs from 'fs';

async function testEdgeFunction() {
  const url = 'https://femvnconxoefpctiptkj.supabase.co/functions/v1/server/make-server-fc8eb847/institutions/promote-member';
  const req = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': 'admin-token-123'
    },
    body: JSON.stringify({
      institutionId: '12345678-1234-1234-1234-123456789012',
      targetUserId: '87654321-4321-4321-4321-210987654321'
    })
  });
  
  const status = req.status;
  const text = await req.text();
  console.log(`Status: ${status}`);
  console.log(`Body: ${text}`);
}

testEdgeFunction();
