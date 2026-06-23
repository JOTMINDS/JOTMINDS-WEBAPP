const fs = require('fs');
const path = 'src/app/utils/storage.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace all localStorage.setItem calls with a safe version
content = content.replace(/localStorage\.setItem\(([^,]+),\s*([^)]+)\);/g, `try {
    localStorage.setItem($1, $2);
  } catch (e) {
    console.error('LocalStorage quota exceeded or error:', e);
  }`);

fs.writeFileSync(path, content);
