import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BookOpen, Brain, Layers, FileCheck, Play, RotateCcw, Target, School, Sparkles, MessageSquare, Plus, FileText, CheckCircle2 } from 'lucide-react';
import { LessonPlan, ClassCognitiveSummary, LessonDeliverySession, PostLessonReflection, GeneratedAssessment, DifferentiatedInstruction } from '../../types/lessonPlannerTypes';
import { getSavedLessonPlans, getClassCognitiveSummary, saveLessonPlan } from '../../utils/lessonPlannerStorage';

// Import 10 modules
import { LessonPlanCreation } from './LessonPlanCreation';
import { CognitiveInsightEngine } from './CognitiveInsightEngine';
import { DifferentiatedInstructionView } from './DifferentiatedInstructionView';
import { AssessmentGeneratorView } from './AssessmentGeneratorView';
import { LessonDeliveryMode } from './LessonDeliveryMode';
import { PostLessonReflectionModal } from './PostLessonReflectionModal';
import { CurriculumTrackerView } from './CurriculumTrackerView';
import { TeacherPerformanceAnalyticsView } from './TeacherPerformanceAnalyticsView';
import { SchoolInsightsDashboardView } from './SchoolInsightsDashboardView';
import { LessonCopilotDrawer } from './LessonCopilotDrawer';

interface AILessonPlannerContainerProps {
  onBack?: () => void;
}

export const AILessonPlannerContainer: React.FC<AILessonPlannerContainerProps> = ({ onBack }) => {
  const [plans, setPlans] = useState<LessonPlan[]>(getSavedLessonPlans());
  const [activePlan, setActivePlan] = useState<LessonPlan>(plans[0] || getSavedLessonPlans()[0]);
  const [classSummary, setClassSummary] = useState<ClassCognitiveSummary>(getClassCognitiveSummary());
  const [activeTab, setActiveTab] = useState<string>('create');
  
  // Delivery & Reflection State
  const [isDelivering, setIsDelivering] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const handlePlanCreated = (newPlan: LessonPlan) => {
    setPlans(getSavedLessonPlans());
    setActivePlan(newPlan);
    setActiveTab('insights');
  };

  const handleFinishDelivery = (session: LessonDeliverySession) => {
    setIsDelivering(false);
    setShowReflectionModal(true);
  };

  if (isDelivering && activePlan) {
    return (
      <LessonDeliveryMode
        plan={activePlan}
        onFinishDelivery={handleFinishDelivery}
        onExit={() => setIsDelivering(false)}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header & Navigation */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/30 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 px-3 py-0.5 text-xs">
              JotMinds Intelligence Suite
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-0.5 text-xs">
              10-Module AI Lesson Planner
            </Badge>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" /> AI-Powered Lesson Planner & Teaching Intelligence
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Connecting student cognitive profiles $\rightarrow$ lesson planning $\rightarrow$ 3-tier differentiation $\rightarrow$ live presentation $\rightarrow$ curriculum analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCopilotOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-md text-xs"
          >
            <Sparkles className="w-4 h-4 mr-1.5" /> AI Copilot Chat
          </Button>
          {activePlan && (
            <Button
              onClick={() => setIsDelivering(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md"
            >
              <Play className="w-4 h-4 mr-1.5" /> Start Live Presentation
            </Button>
          )}
        </div>
      </div>

      {/* Active Lesson Selector Bar */}
      {plans.length > 0 && (
        <Card className="shadow-xs border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Lesson:</span>
              <select
                value={activePlan?.id}
                onChange={(e) => {
                  const p = plans.find(plan => plan.id === e.target.value);
                  if (p) setActivePlan(p);
                }}
                className="text-xs font-semibold p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.subject}: {p.topic} ({p.gradeClass}) • {p.durationMinutes} min
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setActiveTab('create')} className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> New Lesson
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 10 Module Tabs Workspace */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="flex overflow-x-auto scrollbar-none p-1.5 rounded-xl gap-1 bg-slate-100 dark:bg-slate-900 md:grid md:grid-cols-9">
          <TabsTrigger value="create" className="text-xs font-semibold">
            1. Creation
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-xs font-semibold">
            2. Cognitive
          </TabsTrigger>
          <TabsTrigger value="differentiated" className="text-xs font-semibold">
            3. Differentiated
          </TabsTrigger>
          <TabsTrigger value="assessment" className="text-xs font-semibold">
            4. Assessment
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="text-xs font-semibold">
            7. Curriculum
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs font-semibold">
            8. Teacher Analytics
          </TabsTrigger>
          <TabsTrigger value="school" className="text-xs font-semibold">
            9. School Dashboard
          </TabsTrigger>
          <TabsTrigger value="delivery" className="text-xs font-semibold">
            5. Presentation
          </TabsTrigger>
          <TabsTrigger value="reflection" className="text-xs font-semibold">
            6. Reflection
          </TabsTrigger>
        </TabsList>

        {/* Module 1 */}
        <TabsContent value="create">
          <LessonPlanCreation
            classSummary={classSummary}
            onPlanCreated={handlePlanCreated}
          />
        </TabsContent>

        {/* Module 2 */}
        <TabsContent value="insights">
          <CognitiveInsightEngine summary={classSummary} />
        </TabsContent>

        {/* Module 3 */}
        <TabsContent value="differentiated">
          <DifferentiatedInstructionView
            plan={activePlan}
            onUpdateInstruction={(diff) => {
              const updated = { ...activePlan, differentiatedInstruction: diff };
              setActivePlan(updated);
              saveLessonPlan(updated);
            }}
          />
        </TabsContent>

        {/* Module 4 */}
        <TabsContent value="assessment">
          <AssessmentGeneratorView
            plan={activePlan}
            onAssessmentGenerated={(assmt) => {
              const updated = { ...activePlan, assessment: assmt };
              setActivePlan(updated);
              saveLessonPlan(updated);
            }}
          />
        </TabsContent>

        {/* Module 7 */}
        <TabsContent value="curriculum">
          <CurriculumTrackerView />
        </TabsContent>

        {/* Module 8 */}
        <TabsContent value="analytics">
          <TeacherPerformanceAnalyticsView />
        </TabsContent>

        {/* Module 9 */}
        <TabsContent value="school">
          <SchoolInsightsDashboardView summary={classSummary} />
        </TabsContent>

        {/* Module 5 Launcher */}
        <TabsContent value="delivery">
          <Card className="text-center p-8 space-y-4 max-w-xl mx-auto border-indigo-200 dark:border-indigo-900/50">
            <Play className="w-12 h-12 text-indigo-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Launch Live Classroom Presentation Mode
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Open full-screen delivery mode with live activity timer, teaching notes, student attendance, and engagement trackers.
            </p>
            <Button onClick={() => setIsDelivering(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              <Play className="w-4 h-4 mr-2" /> Launch Full-Screen Delivery
            </Button>
          </Card>
        </TabsContent>

        {/* Module 6 Launcher */}
        <TabsContent value="reflection">
          <Card className="text-center p-8 space-y-4 max-w-xl mx-auto border-purple-200 dark:border-purple-900/50">
            <CheckCircle2 className="w-12 h-12 text-purple-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Log Post-Lesson Reflection
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Record completion status, student understanding ratings (Excellent, Good, Average, Poor), and follow-up teaching notes.
            </p>
            <Button onClick={() => setShowReflectionModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
              Log Reflection Now
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Module 6 Post-Lesson Reflection Modal */}
      {showReflectionModal && activePlan && (
        <PostLessonReflectionModal
          plan={activePlan}
          onClose={() => setShowReflectionModal(false)}
          onSaved={(reflection) => {
            console.log('Reflection saved:', reflection);
          }}
        />
      )}

      {/* Module 10 AI Copilot Drawer */}
      <LessonCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        context={{ activePlan, classSummary }}
      />
    </div>
  );
};
