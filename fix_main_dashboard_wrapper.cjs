const fs = require('fs');
const path = 'src/app/components/StudentDashboardTabs/MainDashboardTab.tsx';
let content = fs.readFileSync(path, 'utf8');

const prefix = `import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { TabsContent } from '../ui/tabs';
import { Sparkles, Brain, Clock, Zap, Target, BookOpen, AlertCircle, ArrowRight, Activity, SmilePlus, Lightbulb, Lock, Trophy, Flame } from 'lucide-react';
import { CardV2, CardV2Grid } from '../ui/card-v2';
import { StudentDailyChallenges } from '../StudentDailyChallenges';
import { AssessmentReport } from '../AssessmentReport';
import { AILearningCoach } from '../AILearningCoach';

interface MainDashboardTabProps {
  user: any;
  assessments: any[];
  brainGymProgress: any;
  setActiveTab: (val: string) => void;
  setShowJHSAssessment: (val: boolean) => void;
  setShowSHSAssessment: (val: boolean) => void;
  setShowAdultAssessment: (val: boolean) => void;
  setShowChildrenAssessment: (val: boolean) => void;
  setViewingReport: (val: any) => void;
  setViewingCombinedProfile: (val: boolean) => void;
  setShowingCognitiveGrowth: (val: boolean) => void;
  setShowingBrainGym: (val: boolean) => void;
  setShowingSkillBuilder: (val: boolean) => void;
  setShowingCognitiveProfile: (val: boolean) => void;
  setShowingCareerRecommendations: (val: boolean) => void;
}

export function MainDashboardTab({
  user,
  assessments,
  brainGymProgress,
  setActiveTab,
  setShowJHSAssessment,
  setShowSHSAssessment,
  setShowAdultAssessment,
  setShowChildrenAssessment,
  setViewingReport,
  setViewingCombinedProfile,
  setShowingCognitiveGrowth,
  setShowingBrainGym,
  setShowingSkillBuilder,
  setShowingCognitiveProfile,
  setShowingCareerRecommendations
}: MainDashboardTabProps) {
  return (
    <>
`;

const suffix = `
    </>
  );
}
`;

fs.writeFileSync(path, prefix + content + suffix);
