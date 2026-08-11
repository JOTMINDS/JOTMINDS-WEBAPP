const fs = require('fs');
let code = fs.readFileSync('src/app/components/EducationalResources.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  "import { BookOpen, ExternalLink, Video, FileText, Lightbulb } from 'lucide-react';",
  "import { BookOpen, ExternalLink, Video, FileText, Lightbulb, Loader } from 'lucide-react';\nimport { useState, useEffect } from 'react';\nimport { generateAIEducationalResources, AIEducationalResource } from '../utils/aiService';"
);

// 2. Replace hardcoded functions with state & useEffect
const renderPos = code.indexOf('return (');
const setupCode = `
  const [aiResources, setAiResources] = useState<AIEducationalResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchResources() {
      setLoading(true);
      try {
        const res = await generateAIEducationalResources({
          learningStyle,
          thinkingStyle,
          decisionStyle,
          userType
        });
        if (res && res.length > 0) {
          setAiResources(res);
        } else {
          setAiResources([]);
        }
      } catch (e) {
        console.error('Error loading AI educational resources:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, [learningStyle, thinkingStyle, decisionStyle, userType]);

  const resources = aiResources;
`;

code = code.slice(0, code.indexOf('const getResourcesForLearningStyle')) + setupCode + code.slice(renderPos);

fs.writeFileSync('src/app/components/EducationalResources.tsx', code);
console.log("Updated EducationalResources.tsx to use AI");
