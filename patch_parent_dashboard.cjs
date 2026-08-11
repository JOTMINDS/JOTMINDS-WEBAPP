const fs = require('fs');
let code = fs.readFileSync('src/app/components/ParentDashboard.tsx', 'utf8');

// 1. Add import
if (!code.includes('generateAIParentSupportTips')) {
  code = code.replace(
    "import { sendStudentReminder } from '../utils/api';",
    "import { sendStudentReminder } from '../utils/api';\nimport { generateAIParentSupportTips } from '../utils/aiService';"
  );
}

// 2. Add state hook
if (!code.includes('const [aiSupportTips, setAiSupportTips] = useState<string[]>([]);')) {
  code = code.replace(
    "const [selectedChildId, setSelectedChildId] = useState<string | null>(null);",
    `const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [aiSupportTips, setAiSupportTips] = useState<string[]>([]);
  const [isLoadingSupportTips, setIsLoadingSupportTips] = useState<boolean>(false);`
  );
}

// 3. Add useEffect to fetch AI support tips
const useEffectHook = `
  const latestAssessment = getLatestAssessment();

  useEffect(() => {
    async function fetchTips() {
      if (!latestAssessment) {
        setAiSupportTips([]);
        return;
      }
      setIsLoadingSupportTips(true);
      try {
        const tips = await generateAIParentSupportTips({
          childName: selectedChild?.name,
          score: latestAssessment.score,
          type: latestAssessment.type
        });
        if (tips && tips.length > 0) {
          setAiSupportTips(tips);
        } else {
          setAiSupportTips([]);
        }
      } catch (e) {
        console.error('Error fetching parent AI tips:', e);
      } finally {
        setIsLoadingSupportTips(false);
      }
    }
    fetchTips();
  }, [selectedChildId, latestAssessment?.completedAt]);
`;

if (!code.includes('async function fetchTips()')) {
  code = code.replace('const latestAssessment = getLatestAssessment();', useEffectHook);
}

// 4. Replace getSupportTips usage with aiSupportTips
code = code.replace('const supportTips = getSupportTips(latestAssessment);', 'const supportTips = aiSupportTips;');

fs.writeFileSync('src/app/components/ParentDashboard.tsx', code);
console.log("Updated ParentDashboard.tsx with AI parent support tips");
