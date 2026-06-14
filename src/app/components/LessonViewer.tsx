import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Lightbulb,
  BookOpen,
  Target,
  Star,
} from 'lucide-react';
import {
  getLesson,
  startWorkoutSession,
  submitExercise,
  completeWorkoutSession,
  type CognitiveLesson,
  type WorkoutSession,
  type Exercise,
} from '../utils/cognitiveWorkout';
import { addSkillXP } from '../utils/skillMastery';
import { Textarea } from './ui/textarea';

interface Props {
  userId: string;
  lessonId: string;
  onComplete: (session: WorkoutSession) => void;
  onBack: () => void;
}

export function LessonViewer({ userId, lessonId, onComplete, onBack }: Props) {
  const [lesson, setLesson] = useState<CognitiveLesson | null>(null);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [currentStep, setCurrentStep] = useState<'intro' | 'content' | 'exercises' | 'summary'>('intro');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [exerciseResults, setExerciseResults] = useState<{ correct: boolean; points: number; explanation: string }[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    const lessonData = getLesson(lessonId);
    if (lessonData) {
      setLesson(lessonData);
      const sessionData = startWorkoutSession(userId, lessonId);
      setSession(sessionData);
    }
  }, [lessonId, userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  if (!lesson || !session) {
    return <div className="p-8 text-center">Loading lesson...</div>;
  }

  const currentExercise = lesson.exercises[currentExerciseIndex];
  const totalSteps = 3 + lesson.exercises.length; // intro + content + exercises + summary
  const currentStepNumber = currentStep === 'intro' ? 1 : currentStep === 'content' ? 2 : currentStep === 'exercises' ? 3 + currentExerciseIndex : totalSteps;

  const progressPercentage = (currentStepNumber / totalSteps) * 100;

  const handleNextFromIntro = () => {
    setCurrentStep('content');
  };

  const handleNextFromContent = () => {
    setCurrentStep('exercises');
    setStartTime(Date.now());
  };

  const handleSubmitExercise = () => {
    if (!userAnswer && currentExercise.type === 'multiple_choice') return;

    const exerciseTimeSpent = Math.floor((Date.now() - startTime) / 1000);
    const result = submitExercise(session.id, currentExercise.id, userAnswer, exerciseTimeSpent);

    setExerciseResults([...exerciseResults, result]);
    setShowExplanation(true);
  };

  const handleNextExercise = () => {
    setShowExplanation(false);
    setUserAnswer(null);

    if (currentExerciseIndex < lesson.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setStartTime(Date.now());
    } else {
      // All exercises completed
      const completedSession = completeWorkoutSession(session.id);

      // Award skill XP
      lesson.skillPoints.forEach(({ skill, points }) => {
        addSkillXP(userId, skill, points, `Lesson: ${lesson.title}`);
      });

      setSession(completedSession);
      setCurrentStep('summary');
    }
  };

  const handleComplete = () => {
    if (session.completedAt) {
      onComplete(session);
    }
  };

  // Render different steps
  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold text-lg">{lesson.title}</h1>
              <p className="text-xs text-muted-foreground">
                {lesson.estimatedTime} min • {lesson.xpReward} XP
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-4">
          <Progress value={progressPercentage} className="mb-6" />

          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{lesson.title}</CardTitle>
                  <CardDescription className="capitalize">{lesson.category} • {lesson.difficulty}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold mb-2 text-blue-900">What You'll Learn</h3>
                <p className="text-blue-800">{lesson.description}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                  <div className="text-sm font-semibold">{lesson.estimatedTime} Minutes</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <Target className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                  <div className="text-sm font-semibold">{lesson.exercises.length} Exercises</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <Star className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
                  <div className="text-sm font-semibold">{lesson.xpReward} XP Reward</div>
                </div>
              </div>

              <Button onClick={handleNextFromIntro} size="lg" className="w-full">
                Start Lesson
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (currentStep === 'content') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold text-lg">{lesson.title}</h1>
              <Progress value={progressPercentage} className="mt-2" />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Introduction */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-lg">{lesson.content.introduction}</p>
            </CardContent>
          </Card>

          {/* Key Points */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Key Points</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lesson.content.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lesson.content.examples.map((example, idx) => (
                <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-semibold text-blue-900 mb-2">{example.scenario}</div>
                  <div className="text-blue-800 text-sm">{example.explanation}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-white to-yellow-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lesson.content.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-yellow-900">
                    <span className="text-yellow-600">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-900">{lesson.content.summary}</p>
            </CardContent>
          </Card>

          <Button onClick={handleNextFromContent} size="lg" className="w-full">
            Continue to Exercises
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </main>
      </div>
    );
  }

  if (currentStep === 'exercises') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold text-lg">
                Exercise {currentExerciseIndex + 1} of {lesson.exercises.length}
              </h1>
              <Progress value={progressPercentage} className="mt-2" />
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle>Exercise {currentExerciseIndex + 1}</CardTitle>
              <CardDescription className="capitalize">{currentExercise.type.replace('_', ' ')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-lg">{currentExercise.question}</p>
              </div>

              {currentExercise.type === 'multiple_choice' && currentExercise.options && (
                <div className="space-y-2">
                  {currentExercise.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setUserAnswer(idx)}
                      disabled={showExplanation}
                      className={`w-full p-4 text-left rounded-lg border-2 transition ${
                        userAnswer === idx
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${showExplanation ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {(currentExercise.type === 'reflection' || currentExercise.type === 'scenario' || currentExercise.type === 'practice') && (
                <Textarea
                  value={userAnswer || ''}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={6}
                  disabled={showExplanation}
                />
              )}

              {showExplanation && exerciseResults[currentExerciseIndex] && (
                <div className={`p-4 rounded-lg border-2 ${
                  exerciseResults[currentExerciseIndex].correct
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="font-semibold mb-2 flex items-center gap-2">
                    {exerciseResults[currentExerciseIndex].correct ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-green-900">Correct! +{exerciseResults[currentExerciseIndex].points} points</span>
                      </>
                    ) : (
                      <span className="text-blue-900">Good effort!</span>
                    )}
                  </div>
                  <p className="text-sm">{exerciseResults[currentExerciseIndex].explanation}</p>
                </div>
              )}

              <div className="flex gap-3">
                {!showExplanation ? (
                  <Button
                    onClick={handleSubmitExercise}
                    size="lg"
                    className="flex-1"
                    disabled={!userAnswer}
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={handleNextExercise} size="lg" className="flex-1">
                    {currentExerciseIndex < lesson.exercises.length - 1 ? 'Next Exercise' : 'Complete Lesson'}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Summary step
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Lesson Complete!</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <Card className="border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Excellent Work!</CardTitle>
            <CardDescription>You completed {lesson.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-white rounded-lg border text-center">
                <div className="text-3xl font-bold text-green-600">{session.score}</div>
                <div className="text-sm text-muted-foreground">Points Earned</div>
              </div>
              <div className="p-4 bg-white rounded-lg border text-center">
                <div className="text-3xl font-bold text-blue-600">{session.totalXPEarned}</div>
                <div className="text-sm text-muted-foreground">XP Gained</div>
              </div>
              <div className="p-4 bg-white rounded-lg border text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.floor(timeSpent / 60)}m
                </div>
                <div className="text-sm text-muted-foreground">Time Spent</div>
              </div>
            </div>

            {session.perfectScore && (
              <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200 text-center">
                <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="font-semibold text-yellow-900">Perfect Score!</div>
                <div className="text-sm text-yellow-800">You got every exercise correct</div>
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold mb-2">Skills Improved:</div>
              <div className="flex flex-wrap gap-2">
                {lesson.skillPoints.map(({ skill, points }) => (
                  <Badge key={skill} variant="secondary">
                    {skill.replace('_', ' ')} +{points} XP
                  </Badge>
                ))}
              </div>
            </div>

            <Button onClick={handleComplete} size="lg" className="w-full">
              Back to Workout Center
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
