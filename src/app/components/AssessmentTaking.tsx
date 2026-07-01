import { useState, useEffect } from 'react';
import { getPersonalizedQuestions } from '../utils/assessmentQuestions';
import { calculateKolbScore, calculateSternbergScore, calculateDualProcessScore } from '../utils/scoring';
import { generateId, saveAssessmentProgress, getAssessmentProgress, clearAssessmentProgress } from '../utils/storage';
import { submitAssessment, saveProgress, getProgress } from '../utils/api';
import { generateCognitiveProfile } from '../utils/cognitiveProfileApi';
import { generateCareerMatches } from '../utils/careerApi';
import { Assessment, AssessmentScore } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Slider } from './ui/slider';
import { ArrowLeft, ArrowRight, CheckCircle, BookOpen, Brain, Target, Info, Clock, Save, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionResponse {
  value: number;           // Likert 1-5
  confidence: number;      // Confidence 1-5
  responseTime: number;    // milliseconds
  timestamp: string;       // ISO timestamp
}

interface AssessmentTakingProps {
  userId: string;
  assessmentType: 'kolb' | 'sternberg' | 'dual-process';
  onComplete: (assessment: Assessment) => void;
  onCancel: () => void;
  isOrganizational?: boolean;
  userAge?: number; // NEW: User's age for age-appropriate question selection
}

const assessmentTitles = {
  kolb: "Your Learning Style",
  sternberg: "Your Thinking Style",
  'dual-process': 'Your Decision Style',
};

const orgAssessmentTitles = {
  kolb: "Learning Agility Assessment",
  sternberg: "Thinking Diversity Assessment",
  'dual-process': 'Decision Intelligence Assessment',
};

const assessmentDescriptions = {
  kolb: 'Discover how you learn',
  sternberg: 'Understand how you think',
  'dual-process': 'Learn how you make decisions',
};

const orgAssessmentDescriptions = {
  kolb: 'Measure how you learn from experience, reflect, conceptualize, and apply ideas.',
  sternberg: 'Evaluate analytical, creative, and practical thinking capabilities.',
  'dual-process': 'Analyze your balance between intuitive and analytical decision-making.',
};

export function AssessmentTaking({ userId, assessmentType, onComplete, onCancel, isOrganizational = false, userAge }: AssessmentTakingProps) {
  // Get personalized questions for this user (12 questions)
  // NEW: Questions are now randomized on each assessment attempt for better validity
  // Ages 15-18 automatically receive questions from the expanded teen question bank (300 questions)
  const [questions, setQuestions] = useState(() => getPersonalizedQuestions(assessmentType, userId, isOrganizational, userAge, true)); // randomize=true
  const [showIntro, setShowIntro] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>(
    new Array(questions.length).fill(null).map(() => ({
      value: 0,
      confidence: 3, // Default to neutral confidence
      responseTime: 0,
      timestamp: ''
    }))
  );
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [hasResumableProgress, setHasResumableProgress] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveAttempts, setSaveAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent double submission
  const submittedRef = useState(false);

  // Check for saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // First check localStorage (immediate, always available)
        const savedProgress = getAssessmentProgress(userId, assessmentType, isOrganizational);
        console.log('Checking for saved progress in localStorage:', { userId, assessmentType, isOrganizational, savedProgress });
        
        // Validate localStorage data integrity
        if (savedProgress) {
          const isValid = 
            savedProgress.userId === userId &&
            savedProgress.assessmentType === assessmentType &&
            Array.isArray(savedProgress.responses) &&
            Array.isArray(savedProgress.questions) &&
            savedProgress.responses.length <= savedProgress.questions.length;
          
          if (!isValid) {
            console.warn('Invalid localStorage progress detected, clearing corrupted data');
            clearAssessmentProgress(userId, assessmentType, isOrganizational);
            toast.warning('Previous progress was corrupted and has been cleared');
            return;
          }
        }
        
        // Then try to get from backend (for cross-device sync)
        try {
          const backendProgress = await getProgress(assessmentType);
          console.log('[Progress] Backend response:', backendProgress);
          
          // FIX: Backend returns { success: true, progress: {...} }
          const progressData = backendProgress?.progress;
          
          if (progressData && progressData.answers && progressData.answers.length > 0) {
            console.log('Found backend progress:', progressData);
            
            // Validate backend data integrity
            const backendIsValid = 
              Array.isArray(progressData.answers) &&
              progressData.answers.length <= questions.length &&
              typeof progressData.currentQuestion === 'number' &&
              progressData.currentQuestion >= 0;
            
            if (!backendIsValid) {
              console.warn('Invalid backend progress detected, ignoring');
              toast.warning('Backend progress was invalid, using local data');
            } else {
              // Backend progress takes precedence if it's newer or has more answers
              const shouldUseBackend = 
                !savedProgress || 
                progressData.answers.length > (savedProgress.responses?.length || 0) ||
                (progressData.lastUpdated && savedProgress.lastSaved && 
                 new Date(progressData.lastUpdated) > new Date(savedProgress.lastSaved));
              
              if (shouldUseBackend) {
                // Merge backend progress with localStorage format
                const mergedProgress = {
                  userId,
                  assessmentType,
                  isOrganizational,
                  currentQuestion: Math.min(progressData.currentQuestion || 0, questions.length - 1),
                  responses: progressData.answers.slice(0, questions.length), // Prevent overflow
                  questions: questions, // Use current personalized questions
                  lastSaved: progressData.lastUpdated || new Date().toISOString(),
                };
                
                // Save merged progress to localStorage for offline access
                try {
                  saveAssessmentProgress(mergedProgress);
                } catch (saveError) {
                  console.error('Failed to save merged progress to localStorage:', saveError);
                  // Continue anyway - backend data is still available
                }
                
                setHasResumableProgress(true);
                setLastSaveTime(mergedProgress.lastSaved);
                console.log('Using backend progress (newer/more complete)');
                toast.success('Progress restored from another device!');
                return;
              }
            }
          }
        } catch (backendError: any) {
          // Differentiate between network errors and auth errors
          if (backendError.message === 'Failed to fetch') {
            console.warn('Network error fetching backend progress, using localStorage');
          } else if (backendError.message?.includes('Unauthorized')) {
            console.warn('Session expired, using localStorage');
            toast.warning('Session expired - using offline data');
          } else {
            console.warn('Backend progress fetch failed, using localStorage:', backendError);
          }
        }
        
        // Use localStorage progress if available and valid
        if (savedProgress && savedProgress.questions) {
          // Additional safety: ensure progress matches current questions length
          if (savedProgress.questions.length !== questions.length) {
            console.warn('Saved questions length mismatch, clearing progress');
            clearAssessmentProgress(userId, assessmentType, isOrganizational);
            toast.warning('Assessment has been updated. Please start fresh.');
            return;
          }
          
          setHasResumableProgress(true);
          setLastSaveTime(savedProgress.lastSaved);
          // Use the saved questions to ensure consistency
          setQuestions(savedProgress.questions);
          console.log('Found saved progress from:', savedProgress.lastSaved);
        }
      } catch (error) {
        console.error('Failed to load saved progress:', error);
        toast.error('Error loading saved progress. Starting fresh.');
        // Clear potentially corrupted data
        try {
          clearAssessmentProgress(userId, assessmentType, isOrganizational);
        } catch (clearError) {
          console.error('Failed to clear corrupted progress:', clearError);
        }
      }
    };
    
    loadProgress();
  }, [userId, assessmentType, isOrganizational]);

  // Auto-save progress whenever responses or current question changes
  useEffect(() => {
    // Don't save if we're still on the intro screen
    if (showIntro) return;
    
    // Don't save if no answers have been given yet
    const hasAnyAnswers = responses.some(r => r > 0);
    if (!hasAnyAnswers) return;

    // Save progress including the questions
    const progress = {
      userId,
      assessmentType,
      isOrganizational,
      currentQuestion,
      responses,
      questions, // Save the specific questions shown to this user
      lastSaved: new Date().toISOString(),
    };
    
    const performSave = async () => {
      try {
        setIsSaving(true);
        
        // Save to localStorage (immediate, always works)
        saveAssessmentProgress(progress);
        setLastSaveTime(progress.lastSaved);
        console.log('Progress saved to localStorage:', progress);
        
        // Also save to backend API (for cross-device sync)
        try {
          await saveProgress(
            assessmentType,
            currentQuestion,
            responses,
            false // not completed yet
          );
          console.log('Progress synced to backend successfully');
        } catch (apiError) {
          // Backend save failed, but localStorage save succeeded
          console.warn('Backend progress save failed (localStorage backup successful):', apiError);
        }
        
        // Brief visual feedback
        setTimeout(() => setIsSaving(false), 500);
      } catch (error) {
        console.error('Failed to save progress:', error);
        if (typeof toast !== 'undefined' && toast.error) {
          toast.error('Failed to save progress');
        }
        setIsSaving(false);
      }
    };
    
    performSave();
  }, [responses, currentQuestion, showIntro, userId, assessmentType, isOrganizational]);

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleResponse = (value: string) => {
    const responseTime = Date.now() - questionStartTime;
    const newResponses = [...responses];
    newResponses[currentQuestion] = {
      ...newResponses[currentQuestion],
      value: parseInt(value),
      responseTime,
      timestamp: new Date().toISOString()
    };
    setResponses(newResponses);
    console.log('Response recorded:', {
      question: currentQuestion,
      value: parseInt(value),
      confidence: newResponses[currentQuestion].confidence,
      responseTime,
      total: newResponses.filter(r => r.value > 0).length
    });
  };

  const handleConfidenceChange = (conf: number[]) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = {
      ...newResponses[currentQuestion],
      confidence: conf[0]
    };
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setQuestionStartTime(Date.now()); // Reset timer for next question
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Prevent double submission
    if (isSubmitting || submittedRef[0]) {
      console.warn('Submission already in progress or completed');
      return;
    }

    // Validate all questions are answered
    const unansweredCount = responses.filter(r => r.value === 0).length;
    if (unansweredCount > 0) {
      toast.error(`Please answer all questions. ${unansweredCount} question${unansweredCount > 1 ? 's' : ''} remaining.`);
      return;
    }

    setIsSubmitting(true);
    submittedRef[0] = true;

    try {
      toast.info('Calculating your results...');

      let score: AssessmentScore = {};

      // Extract just the values for scoring (scoring functions expect number arrays)
      const responseValues = responses.map(r => r.value);

      // Validate responses before scoring
      const validResponses = responseValues.every(r => r >= 1 && r <= 5);
      if (!validResponses) {
        throw new Error('Invalid responses detected. Please ensure all answers are between 1-5.');
      }

      try {
        if (assessmentType === 'kolb') {
          score.kolb = calculateKolbScore(responseValues, questions);
        } else if (assessmentType === 'sternberg') {
          score.sternberg = calculateSternbergScore(responseValues, questions);
        } else {
          score.dualProcess = calculateDualProcessScore(responseValues, questions);
        }
      } catch (scoringError) {
        console.error('Score calculation error:', scoringError);
        throw new Error('Failed to calculate assessment scores. Please try again.');
      }

      // Validate calculated scores
      if (!score || Object.keys(score).length === 0) {
        throw new Error('Score calculation resulted in empty scores');
      }

      const assessment: Assessment = {
        id: generateId(),
        userId,
        type: assessmentType,
        responses: responseValues, // Keep legacy format for local storage
        questions, // Save the questions used for this assessment
        score,
        completedAt: new Date().toISOString(),
      };

      // Submit to backend with retry logic
      let submitSuccess = false;
      let retryCount = 0;
      const maxRetries = 3;

      while (!submitSuccess && retryCount < maxRetries) {
        try {
          toast.info(`Submitting to server${retryCount > 0 ? ` (attempt ${retryCount + 1}/${maxRetries})` : ''}...`);

          const result = await submitAssessment(
            assessmentType,
            responses, // Send full response data with confidence
            score,
            [], // strengths - to be calculated
            [], // weaknesses - to be calculated
            [] // recommendations - to be calculated
          );

          submitSuccess = true;
          toast.success('Assessment submitted successfully!');

          // Check if a Skill Builder plan was auto-generated
          if (result?.autoGeneratedPlan) {
            const dimensionLabels: Record<string, string> = {
              metacognition: 'Metacognition',
              problem_solving: 'Problem Solving',
              curiosity: 'Curiosity',
              emotional_regulation: 'Emotional Regulation',
            };
            const label = dimensionLabels[result.autoGeneratedPlan.dimensionId] || result.autoGeneratedPlan.dimensionId;

            toast.success(
              `🎯 We created a 7-day ${label} plan to help you grow in this area! Check your Skill Builder.`,
              { duration: 6000 }
            );
          }

          // Auto-generate cognitive profile and career matches
          try {
            const profile = await generateCognitiveProfile();
            console.log('[Profile] Generated cognitive profile:', profile.cognitiveArchetype);

            // Show archetype reveal notification
            toast.success(
              `🧠 Your cognitive archetype: ${profile.cognitiveArchetype}! View your complete profile in the dashboard.`,
              { duration: 7000 }
            );

            // Auto-generate career matches if profile is complete
            if (profile.profileCompleteness === 100) {
              try {
                const matches = await generateCareerMatches();
                console.log('[Career] Generated career matches, top match:', matches[0]?.career.title);

                toast.success(
                  `💼 Found ${matches.length} career matches! Your top match: ${matches[0]?.career.title}`,
                  { duration: 7000 }
                );
              } catch (careerError) {
                console.warn('[Career] Failed to generate matches:', careerError);
                // Non-critical, continue
              }
            } else {
              toast.info(
                `📊 Complete ${3 - profile.completedAssessments.length} more assessment(s) for career recommendations!`,
                { duration: 5000 }
              );
            }
          } catch (profileError) {
            console.warn('[Profile] Failed to generate profile:', profileError);
            // Non-critical, continue
          }

          // Clear saved progress after successful submission
          try {
            clearAssessmentProgress(userId, assessmentType, isOrganizational);
          } catch (clearError) {
            console.warn('Failed to clear progress after submission:', clearError);
            // Non-critical error, continue
          }

          // Call onComplete callback
          if (typeof onComplete === 'function') {
            onComplete(assessment);
          } else {
            console.error('onComplete is not a function:', onComplete);
            toast.error('Assessment completed but navigation failed. Please refresh the page.');
          }
        } catch (apiError: any) {
          retryCount++;
          console.error(`Backend submission attempt ${retryCount} failed:`, apiError);
          
          if (retryCount >= maxRetries) {
            // Final retry failed
            if (apiError.message === 'Failed to fetch') {
              toast.error('Network error. Your assessment is saved locally and will sync when connection is restored.');
            } else if (apiError.message?.includes('Unauthorized')) {
              toast.error('Session expired. Please log in again to submit your assessment.');
            } else {
              toast.error('Failed to submit to server after multiple attempts. Your responses are saved locally.');
            }
            
            // Still call onComplete with local data so user can see results
            if (typeof onComplete === 'function') {
              onComplete(assessment);
            }
          } else {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }
    } catch (error: any) {
      console.error('Error submitting assessment:', error);
      toast.error(error.message || 'Failed to submit assessment. Please try again.');
      // Reset submission state to allow retry
      setIsSubmitting(false);
      submittedRef[0] = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Clear saved progress when cancelling
    clearAssessmentProgress(userId, assessmentType, isOrganizational);
    onCancel();
  };

  const handleResumeProgress = () => {
    const savedProgress = getAssessmentProgress(userId, assessmentType, isOrganizational);
    if (savedProgress) {
      // Restore the exact questions that were shown before
      if (savedProgress.questions) {
        setQuestions(savedProgress.questions);
      }
      setCurrentQuestion(savedProgress.currentQuestion);
      setResponses(savedProgress.responses);
      setShowIntro(false);
      toast.success('Progress restored! Continue where you left off.');
    }
  };

  const handleStartFresh = () => {
    // Clear any saved progress
    clearAssessmentProgress(userId, assessmentType, isOrganizational);
    setHasResumableProgress(false);
    setShowIntro(false);
  };

  const isLastQuestion = currentQuestion === questions.length - 1;
  const canProceed = responses[currentQuestion].value > 0;

  // Get assessment-specific info
  const assessmentIcons: Record<typeof assessmentType, typeof BookOpen> = {
    kolb: BookOpen,
    sternberg: Brain,
    'dual-process': Target
  };
  
  const assessmentContexts: Record<typeof assessmentType, {
    stage: string;
    focus: string;
    questions: string;
    time: string;
  }> = {
    kolb: {
      stage: 'Input Stage',
      focus: 'How you absorb and process new experiences',
      questions: isOrganizational ? 
        'This assessment measures your learning agility through experience, reflection, conceptualization, and experimentation. You\'ll receive 12 personalized questions selected just for you.' :
        'Discover whether you learn best through hands-on experience, thoughtful reflection, theoretical analysis, or active testing. You\'ll receive 12 personalized questions selected just for you.',
      time: '3-5 minutes'
    },
    sternberg: {
      stage: 'Processing Stage',
      focus: 'How you analyze, create, and apply ideas',
      questions: isOrganizational ?
        'This assessment evaluates your balance of analytical, creative, and practical thinking approaches. You\'ll receive 12 personalized questions selected just for you.' :
        'Understand your dominant thinking strengths: critical analysis, creative innovation, or practical application. You\'ll receive 12 personalized questions selected just for you.',
      time: '3-5 minutes'
    },
    'dual-process': {
      stage: 'Output Stage',
      focus: 'How you choose or act based on thought or instinct',
      questions: isOrganizational ?
        'This assessment analyzes how you make decisions under different conditions and time pressures. You\'ll receive 12 personalized questions selected just for you.' :
        'Learn whether you tend to make quick intuitive decisions or prefer slower, more deliberate analysis. You\'ll receive 12 personalized questions selected just for you.',
      time: '3-5 minutes'
    }
  };

  const AssessmentIcon = assessmentIcons[assessmentType] || BookOpen;
  const assessmentInfo = assessmentContexts[assessmentType] || assessmentContexts.kolb;

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 bg-[rgb(0,0,0)]">
        <div className="max-w-3xl mx-auto py-8">
          <div className="mb-4">
            <Button variant="outline" onClick={handleCancel} className="shadow-soft bg-white/50 backdrop-blur-sm hover:bg-white/80">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {isOrganizational ? 'Back to Dashboard' : 'Back'}
            </Button>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <AssessmentIcon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle>{isOrganizational ? orgAssessmentTitles[assessmentType] : assessmentTitles[assessmentType]}</CardTitle>
                    <Badge variant="secondary">{assessmentInfo.stage}</Badge>
                  </div>
                  <CardDescription className="text-base">
                    {isOrganizational ? orgAssessmentDescriptions[assessmentType] : assessmentDescriptions[assessmentType]}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>What This Assessment Measures:</strong> {assessmentInfo.focus}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">About This Assessment</h4>
                  <p className="text-sm text-muted-foreground">{assessmentInfo.questions}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Number of Questions</p>
                      <p className="text-sm text-muted-foreground">{questions.length} questions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Estimated Time</p>
                      <p className="text-sm text-muted-foreground">{assessmentInfo.time}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Part of Your Complete Cognitive Profile
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    This is one of three assessments that together create your complete cognitive profile:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={assessmentType === 'kolb' ? 'default' : 'outline'}>
                      <BookOpen className="h-3 w-3 mr-1" /> Learning Style
                    </Badge>
                    <Badge variant={assessmentType === 'sternberg' ? 'default' : 'outline'}>
                      <Brain className="h-3 w-3 mr-1" /> Thinking Style
                    </Badge>
                    <Badge variant={assessmentType === 'dual-process' ? 'default' : 'outline'}>
                      <Target className="h-3 w-3 mr-1" /> Decision Style
                    </Badge>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">Tips for Best Results</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>Answer honestly based on how you naturally think and act</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>Don't overthink your responses - go with your first instinct</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>Complete all questions in one sitting for accurate results</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>There are no right or wrong answers - this is about understanding yourself</span>
                    </li>
                  </ul>
                </div>
              </div>

              {hasResumableProgress && (
                <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <Save className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Progress Found!</strong> You have an incomplete assessment from {new Date(lastSaveTime).toLocaleString()}. Would you like to continue or start fresh?
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  Cancel
                </Button>
                {hasResumableProgress ? (
                  <>
                    <Button variant="outline" onClick={handleStartFresh} className="flex-1">
                      Start Fresh
                    </Button>
                    <Button onClick={handleResumeProgress} className="flex-1">
                      Resume
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleStartFresh} className="flex-1">
                    Begin Assessment
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4">
      <div className="max-w-2xl mx-auto py-4 sm:py-8">
        <div className="mb-4">
          <Button variant="outline" onClick={handleCancel} size="sm" className="shadow-soft bg-white/50 backdrop-blur-sm hover:bg-white/80 dark:bg-gray-800/50 dark:hover:bg-gray-800/80">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isOrganizational ? 'Back to Dashboard' : 'Back'}
          </Button>
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl">{isOrganizational ? orgAssessmentTitles[assessmentType] : assessmentTitles[assessmentType]}</CardTitle>
                <CardDescription className="text-sm">{isOrganizational ? orgAssessmentDescriptions[assessmentType] : assessmentDescriptions[assessmentType]}</CardDescription>
              </div>
              {(lastSaveTime || isSaving) && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                  <Save className={`h-4 w-4 ${isSaving ? 'text-blue-600 animate-pulse' : 'text-green-600'}`} />
                  <span className="text-xs font-medium">{isSaving ? 'Saving...' : 'Auto-saved'}</span>
                </div>
              )}
            </div>
            
            {/* Enhanced Progress Indicator with Numeric Marker */}
            <div className="pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {responses.filter(r => r.value > 0).length} answered
                  </span>
                  <span className="text-sm font-semibold" style={{ color: '#6B4C9A' }}>
                    {Math.round(progress)}% Complete
                  </span>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
              
              {/* Question Navigation Dots */}
              <div className="flex flex-wrap gap-2 pt-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentQuestion(index);
                      setQuestionStartTime(Date.now());
                      toast.info(`Jumped to question ${index + 1}`);
                    }}
                    disabled={responses[index].value === 0 && index !== currentQuestion}
                    className={`
                      w-8 h-8 rounded-full text-xs font-semibold transition-all
                      ${index === currentQuestion
                        ? 'bg-[#6B4C9A] text-white ring-2 ring-[#6B4C9A] ring-offset-2'
                        : responses[index].value !== 0
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }
                      ${responses[index].value !== 0 && index !== currentQuestion ? 'hover:scale-110' : ''}
                    `}
                    title={`Question ${index + 1}${responses[index].value !== 0 ? ' (answered)' : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-6">
              {/* Question Text with Proper Wrapping */}
              <p className="text-base sm:text-lg leading-relaxed break-words whitespace-normal">
                {questions[currentQuestion].text}
              </p>

              {/* Enhanced Radio Options with 44×44px Hit Area */}
              <RadioGroup
                value={responses[currentQuestion].value.toString()}
                onValueChange={handleResponse}
                className="space-y-3"
              >
                <div
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer
                    min-h-[44px] touch-manipulation
                    ${responses[currentQuestion].value === 1
                      ? 'border-[#6B4C9A] bg-[#6B4C9A]/10 shadow-md'
                      : 'border-gray-200 hover:border-[#6B4C9A] hover:bg-accent'
                    }
                  `}
                  onClick={() => handleResponse('1')}
                >
                  <RadioGroupItem value="1" id="r1" className="w-5 h-5 min-w-[20px]" />
                  <Label htmlFor="r1" className="flex-1 cursor-pointer text-sm sm:text-base leading-relaxed break-words">
                    Strongly Disagree
                  </Label>
                </div>

                <div
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer
                    min-h-[44px] touch-manipulation
                    ${responses[currentQuestion].value === 2
                      ? 'border-[#6B4C9A] bg-[#6B4C9A]/10 shadow-md'
                      : 'border-gray-200 hover:border-[#6B4C9A] hover:bg-accent'
                    }
                  `}
                  onClick={() => handleResponse('2')}
                >
                  <RadioGroupItem value="2" id="r2" className="w-5 h-5 min-w-[20px]" />
                  <Label htmlFor="r2" className="flex-1 cursor-pointer text-sm sm:text-base leading-relaxed break-words">
                    Disagree
                  </Label>
                </div>

                <div
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer
                    min-h-[44px] touch-manipulation
                    ${responses[currentQuestion].value === 3
                      ? 'border-[#6B4C9A] bg-[#6B4C9A]/10 shadow-md'
                      : 'border-gray-200 hover:border-[#6B4C9A] hover:bg-accent'
                    }
                  `}
                  onClick={() => handleResponse('3')}
                >
                  <RadioGroupItem value="3" id="r3" className="w-5 h-5 min-w-[20px]" />
                  <Label htmlFor="r3" className="flex-1 cursor-pointer text-sm sm:text-base leading-relaxed break-words">
                    Neutral
                  </Label>
                </div>

                <div
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer
                    min-h-[44px] touch-manipulation
                    ${responses[currentQuestion].value === 4
                      ? 'border-[#6B4C9A] bg-[#6B4C9A]/10 shadow-md'
                      : 'border-gray-200 hover:border-[#6B4C9A] hover:bg-accent'
                    }
                  `}
                  onClick={() => handleResponse('4')}
                >
                  <RadioGroupItem value="4" id="r4" className="w-5 h-5 min-w-[20px]" />
                  <Label htmlFor="r4" className="flex-1 cursor-pointer text-sm sm:text-base leading-relaxed break-words">
                    Agree
                  </Label>
                </div>

                <div
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer
                    min-h-[44px] touch-manipulation
                    ${responses[currentQuestion].value === 5
                      ? 'border-[#6B4C9A] bg-[#6B4C9A]/10 shadow-md'
                      : 'border-gray-200 hover:border-[#6B4C9A] hover:bg-accent'
                    }
                  `}
                  onClick={() => handleResponse('5')}
                >
                  <RadioGroupItem value="5" id="r5" className="w-5 h-5 min-w-[20px]" />
                  <Label htmlFor="r5" className="flex-1 cursor-pointer text-sm sm:text-base leading-relaxed break-words">
                    Strongly Agree
                  </Label>
                </div>
              </RadioGroup>

              {/* Confidence Slider - NEW FEATURE */}
              {responses[currentQuestion].value > 0 && (
                <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <Label className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                      How confident are you in this answer?
                    </Label>
                  </div>
                  <div className="space-y-3">
                    <Slider
                      value={[responses[currentQuestion].confidence]}
                      onValueChange={handleConfidenceChange}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span className={responses[currentQuestion].confidence === 1 ? 'font-bold text-purple-600' : ''}>
                        1 - Guessing
                      </span>
                      <span className={responses[currentQuestion].confidence === 2 ? 'font-bold text-purple-600' : ''}>
                        2 - Unsure
                      </span>
                      <span className={responses[currentQuestion].confidence === 3 ? 'font-bold text-purple-600' : ''}>
                        3 - Neutral
                      </span>
                      <span className={responses[currentQuestion].confidence === 4 ? 'font-bold text-purple-600' : ''}>
                        4 - Confident
                      </span>
                      <span className={responses[currentQuestion].confidence === 5 ? 'font-bold text-purple-600' : ''}>
                        5 - Very Sure
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    💡 Your confidence helps us better understand your self-awareness
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4">
              <Button
                variant="outline"
                onClick={currentQuestion === 0 ? handleCancel : handlePrevious}
                className="w-full sm:w-auto min-h-[44px]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {currentQuestion === 0 ? 'Cancel' : 'Previous'}
              </Button>

              {isLastQuestion ? (
                <Button onClick={handleSubmit} disabled={!canProceed || isSubmitting} className="w-full sm:w-auto min-h-[44px]">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!canProceed} className="w-full sm:w-auto min-h-[44px]">
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