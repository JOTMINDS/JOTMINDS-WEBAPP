const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/components/CombinedCognitiveProfile.tsx');
let content = fs.readFileSync(file, 'utf8');

// Insert helpers before the first console.log('📈 Detailed Score Breakdown:'
const helperCode = `
  const getThinkingScores = () => {
    const scoreObj = latestSternberg?.score || {};
    return scoreObj['adult-thinking']?.scores ||
           scoreObj['jhs-thinking']?.scores ||
           scoreObj['shs-thinking']?.scores ||
           scoreObj['child-thinking']?.scores ||
           scoreObj.sternberg?.scores ||
           { analytical: 0, creative: 0, practical: 0 };
  };
  const getThinkingStyle = () => {
    const scoreObj = latestSternberg?.score || {};
    return scoreObj['adult-thinking']?.dominantStyle ||
           scoreObj['adult-thinking']?.primaryStyle ||
           scoreObj['jhs-thinking']?.primaryStyle ||
           scoreObj['shs-thinking']?.primaryStyle ||
           scoreObj['child-thinking']?.primaryStyle ||
           scoreObj.sternberg?.style ||
           'Unknown';
  };
  
  const thinkingScores = getThinkingScores();
  const actualSternbergStyle = getThinkingStyle();
  
  // Normalize the score keys since some versions use uppercase Analytical vs lowercase analytical
  const normalizedThinkingScores = {
    analytical: thinkingScores.analytical || thinkingScores.Analytical || thinkingScores.executive || thinkingScores.Executive || 0,
    creative: thinkingScores.creative || thinkingScores.Creative || thinkingScores.legislative || thinkingScores.Legislative || 0,
    practical: thinkingScores.practical || thinkingScores.Practical || thinkingScores.judicial || thinkingScores.Judicial || 0,
  };
`;

content = content.replace(
  `  console.log('📈 Detailed Score Breakdown:', {`,
  helperCode + `\n  console.log('📈 Detailed Score Breakdown:', {`
);

// Now replace usages of sternberg scores
content = content.replace(/latestSternberg\s*\.?\s*score\s*\.?\s*sternberg\s*\.?\s*scores\s*\.?\s*analytical/g, 'normalizedThinkingScores.analytical');
content = content.replace(/latestSternberg\s*\.?\s*score\s*\.?\s*sternberg\s*\.?\s*scores\s*\.?\s*creative/g, 'normalizedThinkingScores.creative');
content = content.replace(/latestSternberg\s*\.?\s*score\s*\.?\s*sternberg\s*\.?\s*scores\s*\.?\s*practical/g, 'normalizedThinkingScores.practical');

// Replace optional chaining usages
content = content.replace(/latestSternberg\s*\??\.\s*score\s*\??\.\s*sternberg\s*\??\.\s*scores\s*\??\.\s*analytical/g, 'normalizedThinkingScores.analytical');
content = content.replace(/latestSternberg\s*\??\.\s*score\s*\??\.\s*sternberg\s*\??\.\s*scores\s*\??\.\s*creative/g, 'normalizedThinkingScores.creative');
content = content.replace(/latestSternberg\s*\??\.\s*score\s*\??\.\s*sternberg\s*\??\.\s*scores\s*\??\.\s*practical/g, 'normalizedThinkingScores.practical');

// Replace style
content = content.replace(/const sternbergStyle = latestSternberg\.score\.sternberg\?\.style \|\| '';/, 'const sternbergStyle = actualSternbergStyle;');

fs.writeFileSync(file, content);
