const fs = require('fs');
let code = fs.readFileSync('src/app/components/teacher/TeacherIndividualStudentView.tsx', 'utf8');

// 1. Add import
if (!code.includes('generateAITeachingStrategies')) {
  code = code.replace(
    "import { sendStudentReminder } from '../../utils/api';",
    "import { sendStudentReminder } from '../../utils/api';\nimport { generateAITeachingStrategies, AIStudentTeachingStrategies } from '../../utils/aiService';"
  );
}

// 2. Add state inside component
const stateHookPos = code.indexOf('const [isSendingReminder, setIsSendingReminder] = useState(false);');
if (stateHookPos !== -1 && !code.includes('const [aiStrategies, setAiStrategies]')) {
  const insertText = `
  const [aiStrategies, setAiStrategies] = useState<AIStudentTeachingStrategies | null>(null);
  const [isLoadingStrategies, setIsLoadingStrategies] = useState(false);
`;
  code = code.slice(0, stateHookPos) + insertText + code.slice(stateHookPos);
}

// 3. Replace the 3 functions with the useEffect logic + fallback logic
const startGetInsights = code.indexOf('  // Get quick insights');
const endGetResources = code.indexOf('const quickInsights = getQuickInsights();');
if (startGetInsights !== -1 && endGetResources !== -1) {
  const replacement = `
  useEffect(() => {
    async function fetchStrategies() {
      if (!selectedStudent || !hasAssessments) {
        setAiStrategies(null);
        return;
      }
      setIsLoadingStrategies(true);
      try {
        const data = {
          name: selectedStudent.name,
          learningStyle: latestLearning?.score,
          thinkingStyle: latestThinking?.score,
          decisionStyle: latestDecision?.score,
          age: selectedStudent.age
        };
        const result = await generateAITeachingStrategies(data);
        if (result) {
          setAiStrategies(result);
        }
      } catch (e) {
        console.error('Failed to fetch AI strategies:', e);
      } finally {
        setIsLoadingStrategies(false);
      }
    }
    fetchStrategies();
  }, [selectedStudent, latestLearning, latestThinking, latestDecision]);

  const quickInsights = aiStrategies?.quickInsights || [];
  const teachingStrategies = aiStrategies?.teachingStrategies || [];
  const educationalResources = aiStrategies?.educationalResources || [];
`;
  code = code.slice(0, startGetInsights) + replacement + code.slice(code.indexOf('return (', endGetResources));
}

// 4. In the JSX, add loading state handlers if needed, but since it falls back to empty arrays we can just render loaders if isLoadingStrategies is true.
// Find the Insights render blocks and add loading indicators.
const insightsRenderPos = code.indexOf('quickInsights.map((insight, index) => (');
if (insightsRenderPos !== -1 && !code.includes('isLoadingStrategies ? (')) {
  code = code.replace(
    'quickInsights.map((insight, index) => (',
    `isLoadingStrategies ? (
                          <div className="flex justify-center p-4"><Loader className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                        ) : quickInsights.map((insight, index) => (`
  );
  code = code.replace(
    'teachingStrategies.map((strategy, index) => (',
    `isLoadingStrategies ? (
                          <div className="flex justify-center p-4"><Loader className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                        ) : teachingStrategies.map((strategy, index) => (`
  );
  code = code.replace(
    'educationalResources.map((resource, index) => (',
    `isLoadingStrategies ? (
                          <div className="flex justify-center p-4"><Loader className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                        ) : educationalResources.map((resource, index) => (`
  );
}

fs.writeFileSync('src/app/components/teacher/TeacherIndividualStudentView.tsx', code);
console.log('Patched TeacherIndividualStudentView.tsx');
