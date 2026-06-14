import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  CheckCircle, 
  ArrowRight, 
  Target, 
  TrendingUp,
  Award
} from 'lucide-react';

interface SectionSummaryProps {
  sectionNumber: number;
  totalSections: number;
  questionsAnswered: number;
  totalQuestions: number;
  sectionTitle: string;
  motivationalMessage: string;
  onContinue: () => void;
}

export const SectionSummary: React.FC<SectionSummaryProps> = ({
  sectionNumber,
  totalSections,
  questionsAnswered,
  totalQuestions,
  sectionTitle,
  motivationalMessage,
  onContinue
}) => {
  const overallProgress = (questionsAnswered / totalQuestions) * 100;
  const sectionProgress = (sectionNumber / totalSections) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{ background: 'linear-gradient(to bottom, #F8F9FA 0%, #FFFFFF 100%)' }}>
      <Card className="max-w-2xl w-full shadow-xl border-2 border-purple-200">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <CardTitle className="text-3xl mb-2">
            Section {sectionNumber} Complete! 🎯
          </CardTitle>
          <CardDescription className="text-lg">
            {sectionTitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">{questionsAnswered}</p>
              <p className="text-xs text-blue-700">Questions Done</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">{Math.round(overallProgress)}%</p>
              <p className="text-xs text-green-700">Overall Progress</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-900">{totalSections - sectionNumber}</p>
              <p className="text-xs text-purple-700">Sections Left</p>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Overall Progress</span>
              <span className="font-semibold text-purple-600">
                {questionsAnswered} / {totalQuestions}
              </span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {/* Section Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Sections Completed</span>
              <span className="font-semibold text-green-600">
                {sectionNumber} / {totalSections}
              </span>
            </div>
            <Progress value={sectionProgress} className="h-2" />
          </div>

          {/* Motivational Message */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
            <p className="text-center font-medium text-purple-900">
              {motivationalMessage}
            </p>
          </div>

          {/* XP Reward */}
          <div className="flex items-center justify-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <span className="text-2xl">⭐</span>
            <span className="font-semibold text-amber-900">+10 XP earned!</span>
          </div>

          {/* Continue Button */}
          <Button
            onClick={onContinue}
            className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            Continue to Next Section
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>

          {/* Tip */}
          <div className="text-center text-sm text-gray-500">
            💡 Tip: Take a quick break if you need to. Your progress is saved!
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
