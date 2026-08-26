const fs = require('fs');
const path = require('path');
const appFile = path.join(__dirname, 'src/app/App.tsx');
let appContent = fs.readFileSync(appFile, 'utf8');
appContent = appContent.replace(
  `    } else {
      // Fallback
      setCurrentView('dashboard');
    }`,
  `    } else {
      // Fallback
      console.log('[App] Auth failed, staying on landing');
      setCurrentView('landing');
    }`
);
fs.writeFileSync(appFile, appContent);
