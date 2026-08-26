const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/components/AuthForm.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `      if (session?.access_token && session?.refresh_token) {
        const supabase = createClient();
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }`,
  `      if (session?.access_token) {
        const supabase = createClient();
        const setSessionRes = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token || session.access_token
        });
        if (setSessionRes.error) {
           console.error("[AuthForm] setSession error:", setSessionRes.error);
        }
      }`
);

fs.writeFileSync(file, content);
