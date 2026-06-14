import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Brain, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { 
  AdaptiveChallenge, 
  generateAdaptiveChallenge, 
  completeAdaptiveChallenge,
  getActiveChallenge
} from '../utils/adaptiveChallenges';

interface DailyChallengeRunnerProps {
  userId: string;
  onBack: () => void;
  onComplete?: () => void;
}

export function DailyChallengeRunner({ userId, onBack, onComplete }: DailyChallengeRunnerProps) {
  const [challenge, setChallenge] = useState<AdaptiveChallenge | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [exerciseResults, setExerciseResults] = useState<{ exerciseId: string; correct: boolean; timeSpent: number }[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    // Try to get an active challenge first
    let active = getActiveChallenge(userId);
    if (!active) {
      active = generateAdaptiveChallenge(userId, 'logic'); // Default to logic for now, could be randomized
    }
    setChallenge(active);
    if (active.exercises.length > 0) {
      setTimeLeft(active.exercises[0].timeLimit);
      setStartTime(Date.now());
    }
  }, [userId]);

  useEffect(() => {
    if (!challenge || isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [challenge, currentExerciseIndex, isFinished]);

  const handleTimeUp = () => {
    handleAnswerSubmit(true); // Force submit if time is up
  };

  const handleAnswerSubmit = (forced = false) => {
    if (!challenge) return;
    
    const currentExercise = challenge.exercises[currentExerciseIndex];
    const isCorrect = selectedAnswer === currentExercise.correctAnswer;
    const timeSpent = Math.min((Date.now() - startTime) / 1000, currentExercise.timeLimit);

    const newResults = [
      ...exerciseResults,
      {
        exerciseId: currentExercise.id,
        correct: isCorrect,
        timeSpent
      }
    ];
    setExerciseResults(newResults);

    if (currentExerciseIndex < challenge.exercises.length - 1) {
      // Go to next question
      setCurrentExerciseIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(challenge.exercises[currentExerciseIndex + 1].timeLimit);
      setStartTime(Date.now());
    } else {
      // Finished
      completeAdaptiveChallenge(challenge.id, newResults);
      setIsFinished(true);
    }
  };

  if (!challenge) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isFinished) {
    const correctCount = exerciseResults.filter(r => r.correct).length;
    const accuracy = (correctCount / challenge.exercises.length) * 100;

    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl mt-12">
        <CardHeader className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Challenge Complete!</CardTitle>
          <CardDescription>Great job completing your daily brain exercise.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl text-center border">
              <p className="text-sm text-muted-foreground mb-1">Score</p>
              <p className="text-3xl font-bold text-indigo-600">{correctCount * 10} XP</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl text-center border">
              <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
              <p className="text-3xl font-bold text-emerald-600">{accuracy.toFixed(0)}%</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button onClick={onBack} variant="outline">Back to Dashboard</Button>
          {onComplete && <Button onClick={onComplete}>Continue</Button>}
        </CardFooter>
      </Card>
    );
  }

  const exercise = challenge.exercises[currentExerciseIndex];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center justify-center">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              {challenge.challengeType.charAt(0).toUpperCase() + challenge.challengeType.slice(1)}
            </Badge>
            <div className="text-sm font-medium text-muted-foreground">
              Question {currentExerciseIndex + 1} of {challenge.exercises.length}
            </div>
          </div>
          <CardTitle className="text-xl">{exercise.question}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 text-orange-600 font-medium">
            <Clock className="w-5 h-5" />
            <span>{timeLeft}s remaining</span>
          </div>

          {exercise.options ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exercise.options.map((opt, i) => (
                <Button
                  key={i}
                  variant={selectedAnswer === opt ? "default" : "outline"}
                  className="h-auto py-4 text-left justify-start"
                  onClick={() => setSelectedAnswer(opt)}
                >
                  {opt}
                </Button>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-xl text-center border text-muted-foreground">
              This exercise requires a different input type (coming soon). 
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={onBack}>Cancel</Button>
          <Button 
            onClick={() => handleAnswerSubmit()} 
            disabled={!selectedAnswer && !!exercise.options}
            className="flex items-center gap-2"
          >
            {currentExerciseIndex === challenge.exercises.length - 1 ? 'Finish' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
