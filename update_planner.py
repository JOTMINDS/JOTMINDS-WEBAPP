import re

with open("src/app/components/lessonPlanner/AILessonPlannerContainer.tsx", "r") as f:
    content = f.read()

content = content.replace("interface AILessonPlannerContainerProps {", "interface AILessonPlannerContainerProps {\n  students?: any[];\n  assessments?: any[];")

new_func_def = """export const AILessonPlannerContainer: React.FC<AILessonPlannerContainerProps> = ({ onBack, user, students = [], assessments = [] }) => {
  const [plans, setPlans] = useState<LessonPlan[]>(getSavedLessonPlans(user?.id));
  const [activePlan, setActivePlan] = useState<LessonPlan | undefined>(plans[0] || getSavedLessonPlans(user?.id)[0]);
  
  // Dynamically compute class cognitive summary based on students and assessments
  const computeClassSummary = (): ClassCognitiveSummary => {
    const totalStudents = students.length;
    
    // Compute Kolb Learning Styles
    let visualCount = 0, auditoryCount = 0, readWriteCount = 0, kinestheticCount = 0;
    
    const kolbAssessments = assessments.filter(a => (a.type === 'kolb' || a.type === 'learning') && (a.completed || a.completedAt));
    kolbAssessments.forEach(a => {
      const style = (a.score?.kolb?.style || a.score?.learning?.style || '').toLowerCase();
      if (style.includes('visual') || style.includes('assimilating')) visualCount++;
      else if (style.includes('auditory') || style.includes('converging')) auditoryCount++;
      else if (style.includes('read') || style.includes('diverging')) readWriteCount++;
      else kinestheticCount++;
    });

    const kolbTotal = visualCount + auditoryCount + readWriteCount + kinestheticCount;
    
    // Safe percentage calculator
    const calcPct = (count: number) => kolbTotal > 0 ? Math.round((count / kolbTotal) * 100) : 0;

    return {
      classId: 'dynamic-class',
      className: 'My Connected Students',
      totalStudents: totalStudents,
      learningStylesBreakdown: {
        visualPct: calcPct(visualCount),
        auditoryPct: calcPct(auditoryCount),
        readWritePct: calcPct(readWriteCount),
        kinestheticPct: calcPct(kinestheticCount)
      },
      topCognitiveStrengths: kolbTotal > 0 ? ['Adaptive Learning', 'Problem Solving'] : [],
      riskAlerts: [],
      flaggedStudents: [],
      recommendedTeachingStyle: {
        title: 'Differentiated Guided Practice',
        strategies: [
          'Use real student data to tailor recommendations.'
        ]
      }
    };
  };

  const [classSummary, setClassSummary] = useState<ClassCognitiveSummary>(computeClassSummary());
"""

content = re.sub(
    r"export const AILessonPlannerContainer: React\.FC<AILessonPlannerContainerProps> = \(\{ onBack, user \}\) => \{.*?const \[classSummary, setClassSummary\] = useState<ClassCognitiveSummary>\(getClassCognitiveSummary\(\)\);",
    new_func_def,
    content,
    flags=re.DOTALL
)

with open("src/app/components/lessonPlanner/AILessonPlannerContainer.tsx", "w") as f:
    f.write(content)

