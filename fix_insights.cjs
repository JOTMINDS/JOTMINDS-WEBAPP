const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/components/CombinedCognitiveProfile.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `const sternbergScores = latestSternberg.score.sternberg?.scores;`,
  `const sternbergScores = normalizedThinkingScores;`
);

fs.writeFileSync(file, content);
