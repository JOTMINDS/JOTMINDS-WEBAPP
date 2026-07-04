const fs = require('fs');
const content = fs.readFileSync('src/app/utils/professionalCognitiveScoring.ts', 'utf8');
console.log(content.match(/\.reduce\(/g).length, "reduce calls found");
