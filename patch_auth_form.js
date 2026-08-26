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
          refresh_token: session.refresh_token || session.access_token // fallback to ensure it doesn't skip
        });
        if (setSessionRes.error) {
           console.error("[AuthForm] setSession error:", setSessionRes.error);
        }
      }`
);

// Also fix the fallback in App.tsx just in case
const appFile = path.join(__dirname, 'src/app/App.tsx');
let appContent = fs.readFileSync(appFile, 'utf8');
appContent = appContent.replace(
  `    } else {
      // Fallback
      setCurrentView('dashboard');
    }`,
  `    } else {
      // Fallback: If refreshUser returns null, don't go to dashboard, go to auth
      console.error("[App] refreshUser returned null! Staying on landing.");
      setCurrentView('landing');
    }`
);
fs.writeFileSync(appFile, appContent);

fs.writeFileSync(file, content);
