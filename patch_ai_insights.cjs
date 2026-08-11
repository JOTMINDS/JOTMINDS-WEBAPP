const fs = require('fs');
let code = fs.readFileSync('src/app/utils/aiService.ts', 'utf8');

// Ensure algorithmicGuidance is stripped out or ignored in payload
code = code.replace(
  `Payload: \${JSON.stringify(payload)}`,
  `Scores and Profile: \${JSON.stringify({
    scores: payload.scores || (payload as any).scoresOrRequest,
    type: payload.type,
    role: payload.role,
    age: payload.age
  })}`
);

fs.writeFileSync('src/app/utils/aiService.ts', code);
console.log("Updated aiService.ts generateAIInsights payload handling");
