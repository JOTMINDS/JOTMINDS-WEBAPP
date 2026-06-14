import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Assessment } from '../types';
import { UserCheck, Target, TrendingUp, MessageSquare, CheckCircle2, AlertCircle, Star } from 'lucide-react';
import { Separator } from './ui/separator';
import { saveReview } from '../utils/storage';
import { formatDate } from '../utils/dateFormat';

interface SupervisorReviewProps {
  employeeName: string;
  assessments: Assessment[];
  supervisorId?: string;
  professionalId?: string;
  onReviewSubmitted?: () => void;
  subjectTerm?: string;
}

interface ReviewData {
  roleAlignment: string;
  performanceRating: string;
  strengths: string;
  developmentAreas: string;
  recommendedActions: string;
  goals: string;
  supervisorComments: string;
  reviewDate: string;
}

export function SupervisorReview({ 
  employeeName, 
  assessments, 
  supervisorId, 
  professionalId,
  onReviewSubmitted,
  subjectTerm = 'Employee'
}: SupervisorReviewProps) {
  const [reviewData, setReviewData] = useState<ReviewData>({
    roleAlignment: '',
    performanceRating: '',
    strengths: '',
    developmentAreas: '',
    recommendedActions: '',
    goals: '',
    supervisorComments: '',
    reviewDate: new Date().toISOString().split('T')[0]
  });

  const [submitted, setSubmitted] = useState(false);

  const latestLearning = assessments
    .filter(a => a.type === 'kolb' && a.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
  
  const latestThinking = assessments
    .filter(a => a.type === 'sternberg' && a.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
  
  const latestDecision = assessments
    .filter(a => a.type === 'dual-process' && a.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];

  const handleSubmit = () => {
    if (supervisorId && professionalId) {
      saveReview({
        supervisorId,
        professionalId,
        ...reviewData
      });
      setSubmitted(true);
      
      // Reset form and notify parent
      setTimeout(() => {
        setSubmitted(false);
        setReviewData({
          roleAlignment: '',
          performanceRating: '',
          strengths: '',
          developmentAreas: '',
          recommendedActions: '',
          goals: '',
          supervisorComments: '',
          reviewDate: new Date().toISOString().split('T')[0]
        });
        onReviewSubmitted?.();
      }, 2000);
    } else {
      // Legacy behavior for professional dashboard
      console.log('Supervisor Review Submitted:', reviewData);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  const getSuggestedRoles = () => {
    const roles: string[] = [];
    
    if (latestLearning) {
      const style = latestLearning.score.kolb?.style;
      switch (style) {
        case 'Diverging':
          roles.push('Team Facilitator', 'Creative Director', 'Human Resources', 'Counselor');
          break;
        case 'Assimilating':
          roles.push('Research Analyst', 'Systems Designer', 'Strategic Planner', 'Data Scientist');
          break;
        case 'Converging':
          roles.push('Project Manager', 'Engineer', 'Financial Analyst', 'Technical Specialist');
          break;
        case 'Accommodating':
          roles.push('Sales Representative', 'Operations Manager', 'Field Technician', 'Entrepreneur');
          break;
      }
    }

    if (latestThinking) {
      const style = latestThinking.score.sternberg?.style;
      if (style === 'Analytical') roles.push('Quality Assurance', 'Auditor');
      if (style === 'Creative') roles.push('Innovation Lead', 'Product Designer');
      if (style === 'Practical') roles.push('Customer Success', 'Operations Lead');
    }

    return [...new Set(roles)];
  };

  const suggestedRoles = getSuggestedRoles();

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200 shadow-medium hover:shadow-large transition-shadow bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg gradient-purple flex items-center justify-center flex-shrink-0">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2 text-purple-900">
                Supervisor Assessment & Review
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Provide feedback and align {employeeName}'s cognitive profile with organizational goals
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Assessment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            {subjectTerm} Cognitive Profile Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Learning Style</h4>
              {latestLearning ? (
                <>
                  <Badge className="mb-2">{latestLearning.score.kolb?.style}</Badge>
                  <p className="text-xs text-muted-foreground">
                    Assessed {formatDate(latestLearning.completedAt!)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Not assessed</p>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Thinking Style</h4>
              {latestThinking ? (
                <>
                  <Badge className="mb-2">{latestThinking.score.sternberg?.style}</Badge>
                  <p className="text-xs text-muted-foreground">
                    Assessed {formatDate(latestThinking.completedAt!)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Not assessed</p>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Decision Style</h4>
              {latestDecision ? (
                <>
                  <Badge className="mb-2">{latestDecision.score.dualProcess?.style}</Badge>
                  <p className="text-xs text-muted-foreground">
                    Assessed {formatDate(latestDecision.completedAt!)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Not assessed</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Roles */}
      {suggestedRoles.length > 0 && (
        <Alert>
          <Star className="h-4 w-4" />
          <AlertDescription>
            <strong>Suggested Roles Based on Cognitive Profile:</strong>{' '}
            {suggestedRoles.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Review Form */}
      <Card>
        <CardHeader>
          <CardTitle>Supervisor Evaluation Form</CardTitle>
          <CardDescription>
            Complete this assessment to provide structured feedback and support professional development
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Alignment */}
          <div className="space-y-2">
            <Label htmlFor="roleAlignment">
              Current Role Alignment
            </Label>
            <Select
              value={reviewData.roleAlignment}
              onValueChange={(value) => setReviewData({...reviewData, roleAlignment: value})}
            >
              <SelectTrigger id="roleAlignment">
                <SelectValue placeholder="How well does the cognitive profile align with current role?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent Fit - Thriving in current role</SelectItem>
                <SelectItem value="good">Good Fit - Performing well with minor adjustments</SelectItem>
                <SelectItem value="moderate">Moderate Fit - Some misalignment noted</SelectItem>
                <SelectItem value="poor">Poor Fit - Consider role reassignment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Performance Rating */}
          <div className="space-y-2">
            <Label htmlFor="performanceRating">
              Overall Performance Rating
            </Label>
            <Select
              value={reviewData.performanceRating}
              onValueChange={(value) => setReviewData({...reviewData, performanceRating: value})}
            >
              <SelectTrigger id="performanceRating">
                <SelectValue placeholder="Select performance rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exceeds">Exceeds Expectations</SelectItem>
                <SelectItem value="meets">Meets Expectations</SelectItem>
                <SelectItem value="developing">Developing - Needs Support</SelectItem>
                <SelectItem value="improvement">Needs Improvement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Strengths */}
          <div className="space-y-2">
            <Label htmlFor="strengths" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Observed Strengths
            </Label>
            <Textarea
              id="strengths"
              placeholder="List specific strengths you've observed that align with their cognitive profile..."
              value={reviewData.strengths}
              onChange={(e) => setReviewData({...reviewData, strengths: e.target.value})}
              rows={4}
            />
          </div>

          {/* Development Areas */}
          <div className="space-y-2">
            <Label htmlFor="developmentAreas" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              Areas for Development
            </Label>
            <Textarea
              id="developmentAreas"
              placeholder={`Identify areas where the ${subjectTerm.toLowerCase()} could grow or improve...`}
              value={reviewData.developmentAreas}
              onChange={(e) => setReviewData({...reviewData, developmentAreas: e.target.value})}
              rows={4}
            />
          </div>

          {/* Recommended Actions */}
          <div className="space-y-2">
            <Label htmlFor="recommendedActions" className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Recommended Actions & Development Plan
            </Label>
            <Textarea
              id="recommendedActions"
              placeholder="Suggest specific training, projects, or experiences to support development..."
              value={reviewData.recommendedActions}
              onChange={(e) => setReviewData({...reviewData, recommendedActions: e.target.value})}
              rows={4}
            />
          </div>

          {/* Goals */}
          <div className="space-y-2">
            <Label htmlFor="goals">
              Performance Goals for Next Review Period
            </Label>
            <Textarea
              id="goals"
              placeholder="Set clear, measurable goals aligned with cognitive strengths..."
              value={reviewData.goals}
              onChange={(e) => setReviewData({...reviewData, goals: e.target.value})}
              rows={4}
            />
          </div>

          <Separator />

          {/* Supervisor Comments */}
          <div className="space-y-2">
            <Label htmlFor="supervisorComments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              Additional Supervisor Comments
            </Label>
            <Textarea
              id="supervisorComments"
              placeholder="Any additional observations, concerns, or feedback..."
              value={reviewData.supervisorComments}
              onChange={(e) => setReviewData({...reviewData, supervisorComments: e.target.value})}
              rows={4}
            />
          </div>

          {/* Review Date */}
          <div className="space-y-2">
            <Label htmlFor="reviewDate">
              Review Date
            </Label>
            <Input
              id="reviewDate"
              type="date"
              value={reviewData.reviewDate}
              onChange={(e) => setReviewData({...reviewData, reviewDate: e.target.value})}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} className="flex-1" disabled={submitted}>
              {submitted ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Review Submitted
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setReviewData({
                roleAlignment: '',
                performanceRating: '',
                strengths: '',
                developmentAreas: '',
                recommendedActions: '',
                goals: '',
                supervisorComments: '',
                reviewDate: new Date().toISOString().split('T')[0]
              })}
            >
              Clear Form
            </Button>
          </div>

          {submitted && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                Review submitted successfully! This feedback will support {employeeName}'s professional development and align their role with organizational goals.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-base">Review Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li className="flex gap-2">
              <span>•</span>
              <span>Use assessment results to inform your evaluation, not replace it</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Provide specific, actionable feedback based on observed behaviors</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Consider how cognitive strengths can be leveraged for team success</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Identify development opportunities that align with natural preferences</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Schedule follow-up discussions to review progress on goals</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
