import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ParentObservationAssessment, User } from '../types';
import { PARENT_OBSERVATION_QUESTIONS, calculateParentObservationScore } from '../utils/parentObservationData';
import { saveParentObservation, generateId } from '../utils/storage';
import { ArrowLeft, ArrowRight, CheckCircle, Eye, Heart, Brain, Target, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ParentObservationAssessmentProps {
  parent: User;
  child: User;
  onComplete: (assessment: ParentObservationAssessment) => void;
  onCancel: () => void;
}

const sectionInfo = {
  A: {
    title: "Section A: Learning Habits",
    description: "Helps identify your child's learning style",
    icon: Eye,
    color: "from-blue-500 to-cyan-500"
  },
  B: {
    title: "Section B: Thinking Patterns",
    description: "Helps identify your child's thinking style",
    icon: Brain,
    color: "from-purple-500 to-pink-500"
  },
  C: {
    title: "Section C: Decision-Making Behavior",
    description: "Helps identify your child's decision-making style",
    icon: Target,
    color: "from-green-500 to-emerald-500"
  },
  D: {
    title: "Section D: Motivation & Self-Management",
    description: "Understand what motivates your child",
    icon: Heart,
    color: "from-orange-500 to-red-500"
  }
};

export function ParentObservationAssessmentComponent({ 
  parent, 
  child, 
  onComplete, 
  onCancel 
}: ParentObservationAssessmentProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>(new Array(24).fill(0));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = ((currentQuestion + 1) / PARENT_OBSERVATION_QUESTIONS.length) * 100;
  const question = PARENT_OBSERVATION_QUESTIONS[currentQuestion];
  const currentSection = question.section;
  const sectionQuestions = PARENT_OBSERVATION_QUESTIONS.filter(q => q.section === currentSection);
  const questionIndexInSection = sectionQuestions.findIndex(q => q.id === question.id) + 1;
  const SectionIcon = sectionInfo[currentSection].icon;

  const handleResponseChange = (value: string) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = parseInt(value);
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (responses[currentQuestion] === 0) {
      toast.error('Please select a response before continuing');
      return;
    }

    if (currentQuestion < PARENT_OBSERVATION_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (responses.some(r => r === 0)) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate the score
      const score = calculateParentObservationScore(responses);
      
      // Create the assessment object
      const assessment: ParentObservationAssessment = {
        id: generateId(),
        parentId: parent.id,
        childId: child.id,
        responses,
        score,
        completedAt: new Date().toISOString()
      };

      // Save to storage
      saveParentObservation(assessment);
      
      toast.success('Assessment completed successfully!');
      onComplete(assessment);
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save assessment. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-violet-50 to-indigo-50 p-4">
        <div className="max-w-3xl mx-auto pt-8">
          <Card className="border-2 border-[#6B4C9A]">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#6B4C9A] to-[#5B7DB1] flex items-center justify-center">
                  <Eye className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl">Parent Observation Assessment</CardTitle>
              <CardDescription className="text-lg mt-2">
                Help us understand {child.name}'s learning, thinking, and decision-making patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <strong>Purpose:</strong> This assessment helps provide valuable insight into {child.name}'s natural learning habits, ways of thinking, and decision patterns — complementing their self-assessment.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="font-semibold">Assessment Structure:</h3>
                <div className="grid gap-3">
                  {Object.entries(sectionInfo).map(([key, info]) => {
                    const Icon = info.icon;
                    return (
                      <div key={key} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${info.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{info.title}</h4>
                          <p className="text-xs text-muted-foreground">{info.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Response Scale:</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">1 - Strongly Disagree</Badge>
                  <Badge variant="outline">2 - Disagree</Badge>
                  <Badge variant="outline">3 - Neutral</Badge>
                  <Badge variant="outline">4 - Agree</Badge>
                  <Badge variant="outline">5 - Strongly Agree</Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => setShowIntro(false)}
                  className="flex-1 bg-gradient-to-r from-[#6B4C9A] to-[#5B7DB1] hover:opacity-90"
                >
                  Start Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isLastQuestion = currentQuestion === PARENT_OBSERVATION_QUESTIONS.length - 1;
  const allQuestionsAnswered = responses.every(r => r > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-violet-50 to-indigo-50 p-4">
      <div className="max-w-3xl mx-auto pt-8">
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-sm">
              Question {currentQuestion + 1} of {PARENT_OBSERVATION_QUESTIONS.length}
            </Badge>
            <Badge className={`bg-gradient-to-r ${sectionInfo[currentSection].color} text-white`}>
              {sectionInfo[currentSection].title.split(':')[0]}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(progress)}% Complete
          </p>
        </div>

        {/* Question Card */}
        <Card className="border-2 border-[#6B4C9A]">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${sectionInfo[currentSection].color} flex items-center justify-center flex-shrink-0`}>
                <SectionIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg mb-1">
                  {sectionInfo[currentSection].title}
                </CardTitle>
                <CardDescription>
                  Question {questionIndexInSection} of {sectionQuestions.length}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-100">
              <p className="text-lg">{question.text}</p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Dimension:</strong> {question.dimension}
              </p>
            </div>

            <RadioGroup
              value={responses[currentQuestion]?.toString() || ''}
              onValueChange={handleResponseChange}
              className="space-y-3"
            >
              {[
                { value: '1', label: 'Strongly Disagree' },
                { value: '2', label: 'Disagree' },
                { value: '3', label: 'Neutral' },
                { value: '4', label: 'Agree' },
                { value: '5', label: 'Strongly Agree' }
              ].map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-blue-50 ${
                    responses[currentQuestion]?.toString() === option.value
                      ? 'border-[#6B4C9A] bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  onClick={() => handleResponseChange(option.value)}
                >
                  <RadioGroupItem value={option.value} id={`option-${option.value}`} />
                  <Label
                    htmlFor={`option-${option.value}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Navigation Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!allQuestionsAnswered || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
                >
                  {isSubmitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Assessment
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={responses[currentQuestion] === 0}
                  className="flex-1 bg-gradient-to-r from-[#6B4C9A] to-[#5B7DB1] hover:opacity-90"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
