import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle2, AlertCircle, Lightbulb, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from './AuthContext';
import { FeedbackPrompt } from './FeedbackPrompt';

interface AssessmentSummaryProps {
  type: 'learning' | 'thinking' | 'decision';
  results: any;
  insights: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    dominantStyle: string;
    secondaryStyle: string | null;
  };
  onBackToDashboard: () => void;
  onStartNextAssessment?: (type: 'learning' | 'thinking' | 'decision') => void;
}

export const AssessmentSummary: React.FC<AssessmentSummaryProps> = ({
  type,
  results,
  insights,
  onBackToDashboard,
  onStartNextAssessment
}) => {
  const { user } = useAuth();

  const getAssessmentTitle = () => {
    switch (type) {
      case 'learning': return 'Your Learning Style';
      case 'thinking': return 'Your Thinking Style';
      case 'decision': return 'Your Decision Style';
    }
  };

  // Determine which assessments are incomplete
  const getNextAssessment = () => {
    console.log('[AssessmentSummary] Checking for next assessment');
    console.log('[AssessmentSummary] User:', user);
    console.log('[AssessmentSummary] Assessments Completed:', user?.assessmentsCompleted);
    
    if (!user?.assessmentsCompleted) {
      console.log('[AssessmentSummary] No assessmentsCompleted array found');
      return null;
    }

    const assessmentMapping = {
      'learning': 'kolb',
      'thinking': 'sternberg',
      'decision': 'dual-process'
    };

    const typeMapping = {
      'kolb': 'learning',
      'sternberg': 'thinking',
      'dual-process': 'decision'
    };

    const completed = user.assessmentsCompleted;
    console.log('[AssessmentSummary] Completed assessments:', completed);

    // Check each assessment type
    const assessmentOrder: ('learning' | 'thinking' | 'decision')[] = ['learning', 'thinking', 'decision'];
    
    for (const assessmentType of assessmentOrder) {
      const internalType = assessmentMapping[assessmentType as keyof typeof assessmentMapping];
      console.log(`[AssessmentSummary] Checking ${assessmentType} (${internalType}):`, !completed.includes(internalType));
      if (!completed.includes(internalType)) {
        const nextAssessmentInfo = {
          type: assessmentType,
          title: assessmentType === 'learning' ? 'Learning Style' :
                 assessmentType === 'thinking' ? 'Thinking Style' :
                 'Decision Style'
        };
        console.log('[AssessmentSummary] Next assessment found:', nextAssessmentInfo);
        return nextAssessmentInfo;
      }
    }

    console.log('[AssessmentSummary] All assessments completed');
    return null; // All assessments completed
  };

  const nextAssessment = getNextAssessment();
  console.log('[AssessmentSummary] Final nextAssessment:', nextAssessment);

  // Format/Normalize style names to be consistent and beautiful
  const formatStyleName = (style: string): string => {
    const mapping: { [key: string]: string } = {
      'system1': 'Intuitive',
      'system2': 'Reflective',
      'intuitive': 'Intuitive',
      'reflective': 'Reflective',
      'analytical': 'Analytical',
      'creative': 'Creative',
      'practical': 'Practical',
      'holistic': 'Holistic',
      'visual': 'Visual',
      'auditory': 'Auditory',
      'kinesthetic': 'Kinesthetic',
      'reading/writing': 'Reading/Writing'
    };
    return mapping[style.toLowerCase()] || style;
  };

  // 1. Extract percentages flat map safely
  const rawPercentages = results?.percentages || (results?.scores ? results.percentages : results) || {};
  
  // 2. Map keys to user-friendly capitalized names
  const flatResults: { [key: string]: number } = {};
  Object.entries(rawPercentages).forEach(([key, val]) => {
    const formattedKey = formatStyleName(key);
    flatResults[formattedKey] = Number(val);
  });

  const sortedResults = Object.entries(flatResults).sort((a: any, b: any) => b[1] - a[1]);

  // 3. Normalize dominant and secondary styles
  const dominantStyle = formatStyleName(insights?.dominantStyle || sortedResults[0]?.[0] || 'balanced');
  const secondaryStyle = insights?.secondaryStyle 
    ? formatStyleName(insights.secondaryStyle) 
    : (sortedResults[1]?.[1] > 0 ? sortedResults[1]?.[0] : null);

  const strengths = insights?.strengths || [];
  const weaknesses = insights?.weaknesses || [];
  const recommendations = insights?.recommendations || [];

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom, #F8F9FA 0%, #FFFFFF 100%)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#E8F9FF' }}>
            <CheckCircle2 className="w-8 h-8" style={{ color: '#6B4C9A' }} />
          </div>
          <h1 className="text-3xl mb-2" style={{ color: '#5B7DB1' }}>Assessment Complete!</h1>
          <p className="text-lg" style={{ color: '#6B7280' }}>{getAssessmentTitle()}</p>
        </div>

        {/* Dominant Style */}
        <Card className="mb-6 shadow-lg" style={{ borderTop: '4px solid #5B7DB1' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: '#5B7DB1' }} />
              Your Primary Style: {dominantStyle}
            </CardTitle>
            <CardDescription>
              {secondaryStyle && `Secondary: ${secondaryStyle}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedResults.map(([style, percentage]) => (
                <div key={style} className="flex items-center gap-3">
                  <div className="w-32 flex-shrink-0">{style}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        background: style === dominantStyle 
                          ? 'linear-gradient(90deg, #5B7DB1 0%, #6B4C9A 100%)'
                          : '#E5E7EB'
                      }}
                    />
                  </div>
                  <div className="w-12 text-right">
                    <Badge variant={style === dominantStyle ? 'default' : 'secondary'}>
                      {percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#10B981' }}>
              <CheckCircle2 className="w-5 h-5" />
              Your Strengths
            </CardTitle>
            <CardDescription>Based on your {dominantStyle} style</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#D1FAE5' }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#10B981' }} />
                  </div>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Growth */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#FF715B' }}>
              <AlertCircle className="w-5 h-5" />
              Areas for Growth
            </CardTitle>
            <CardDescription>Potential challenges to be aware of</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#FEE2E2' }}>
                    <AlertCircle className="w-4 h-4" style={{ color: '#FF715B' }} />
                  </div>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#6B4C9A' }}>
              <Lightbulb className="w-5 h-5" />
              Personalized Recommendations
            </CardTitle>
            <CardDescription>Strategies to maximize your potential</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#E0F2FE' }}>
                    <Lightbulb className="w-4 h-4" style={{ color: '#6B4C9A' }} />
                  </div>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* For Organizations */}
        <Card className="mb-6 shadow-md" style={{ borderLeft: '4px solid #10B981' }}>
          <CardHeader>
            <CardTitle>For Educators & Organizations</CardTitle>
            <CardDescription>How to support this cognitive profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              <strong>Best Fit Roles:</strong> This {dominantStyle} profile excels in environments that value their natural 
              {type === 'learning' && ' preferred learning modality'}
              {type === 'thinking' && ' cognitive approach'}
              {type === 'decision' && ' decision-making process'}.
            </p>
            <p>
              <strong>Team Contribution:</strong> They bring unique perspectives that complement other styles and contribute to diverse, 
              well-rounded teams.
            </p>
            <p>
              <strong>Continuous Development:</strong> Regular assessment and feedback help track growth and identify evolving needs 
              for professional development.
            </p>
          </CardContent>
        </Card>

        {/* Feedback Prompt - Show only when all assessments are completed */}
        {!nextAssessment && (
          <FeedbackPrompt className="mb-6" />
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4 flex-wrap">
          <Button
            onClick={onBackToDashboard}
            size="lg"
            variant="outline"
          >
            Back to Dashboard
          </Button>
          {nextAssessment && onStartNextAssessment && (
            <Button
              onClick={() => onStartNextAssessment(nextAssessment.type)}
              size="lg"
              className="animate-pulse"
              style={{ backgroundColor: '#FF715B' }}
            >
              Take Next Assessment: {nextAssessment.title} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};