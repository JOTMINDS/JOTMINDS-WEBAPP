const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/components/StudentDashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `const hasSternberg = hasCompletedAssessment('sternberg');`,
  `const hasSternberg = hasCompletedAssessment('sternberg') || 
                         hasCompletedAssessment('jhs-thinking') || 
                         hasCompletedAssessment('shs-thinking') || 
                         hasCompletedAssessment('child-thinking') || 
                         hasCompletedAssessment('adult-thinking');`
);

fs.writeFileSync(file, content);
