import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Eye, 
  Clock, 
  Target, 
  CheckCircle, 
  ArrowRight,
  BookOpen,
  HelpCircle
} from 'lucide-react';

interface AssessmentPreviewProps {
  type: 'learning' | 'thinking' | 'decision';
  questionCount: number;
  estimatedTime: number;
  onStart: () => void;
  onClose: () => void;
}

export const AssessmentPreview: React.FC<AssessmentPreviewProps> = ({
  type,
  questionCount,
  estimatedTime,
  onStart,
  onClose
}) => {
  const getPreviewContent = () => {
    switch (type) {
      case 'learning':
        return {
          title: 'Learning Style Assessment',
          description: 'Discover how you learn best and what study methods work for you',
          icon: <BookOpen className="h-8 w-8" />,
          color: 'from-blue-500 to-cyan-500',
          sampleQuestions: [
            'When I study, I prefer to...',
            'I remember information better when...',
            'In group projects, I usually...'
          ],
          insights: [
            'Your preferred learning methods',
            'Study strategies that work for you',
            'How to maximize your learning potential'
          ]
        };
      case 'thinking':
        return {
          title: 'Thinking Style Assessment',
          description: 'Understand how you process information and solve problems',
          icon: <Target className="h-8 w-8" />,
          color: 'from-purple-500 to-pink-500',
          sampleQuestions: [
            'When facing a new challenge, I...',
            'I make decisions by...',
            'I approach problems by...'
          ],
          insights: [
            'Your cognitive strengths',
            'How you approach challenges',
            'Ways to enhance your thinking'
          ]
        };
      case 'decision':
        return {
          title: 'Decision Style Assessment',
          description: 'Learn about your decision-making patterns and preferences',
          icon: <HelpCircle className="h-8 w-8" />,
          color: 'from-green-500 to-emerald-500',
          sampleQuestions: [
            'When making important choices, I...',
            'I consider options by...',
            'After deciding, I usually...'
          ],
          insights: [
            'Your decision-making approach',
            'Factors that influence your choices',
            'Tips for better decisions'
          ]
        };
    }
  };

  const content = getPreviewContent();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${content.color} flex items-center justify-center text-white`}>
              {content.icon}
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{content.title}</CardTitle>
              <CardDescription className="text-base mt-1">
                {content.description}
              </CardDescription>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-3 pt-4 border-t">
            <Badge variant="outline" className="flex items-center gap-1 py-2 px-3">
              <Target className="h-4 w-4" />
              {questionCount} questions
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 py-2 px-3">
              <Clock className="h-4 w-4" />
              ~{estimatedTime} minutes
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 py-2 px-3">
              <CheckCircle className="h-4 w-4" />
              Auto-save progress
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Sample Questions */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Eye className="h-5 w-5 text-purple-600" />
              Sample Questions
            </h3>
            <div className="space-y-2">
              {content.sampleQuestions.map((question, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">{question}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What You'll Learn */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-green-600" />
              What You'll Discover
            </h3>
            <div className="space-y-2">
              {content.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">💡 Tips for Success</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Answer honestly - there are no right or wrong answers</li>
              <li>• Take your time - your progress is automatically saved</li>
              <li>• Choose the option that best describes you</li>
              <li>• You can go back and change answers before submitting</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={onStart}
              className={`flex-1 bg-gradient-to-r ${content.color} hover:opacity-90 text-white`}
            >
              Start Assessment
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
