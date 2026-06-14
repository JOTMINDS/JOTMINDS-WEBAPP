import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ChildrenThinkingAssessmentProps {
  onComplete: (results: AssessmentResults) => void;
  onBack: () => void;
}

interface AssessmentResults {
  creative: number;
  analytical: number;
  practical: number;
  reflective: number;
  answers: Record<number, number>;
}

interface Question {
  id: number;
  text: string;
  category: 'creative' | 'analytical' | 'practical' | 'reflective';
}

const questions: Question[] = [
  // Creative Thinking (1-5)
  { id: 1, text: "I love coming up with new ideas or stories.", category: 'creative' },
  { id: 2, text: "I like to draw, build, or make fun things.", category: 'creative' },
  { id: 3, text: "I enjoy turning simple things into something special.", category: 'creative' },
  { id: 4, text: "I often think of different ways to do things.", category: 'creative' },
  { id: 5, text: "I feel happy when I use my imagination.", category: 'creative' },
  
  // Thinking Carefully / Analytical (6-10)
  { id: 6, text: "I enjoy puzzles, riddles, or brain games.", category: 'analytical' },
  { id: 7, text: "I like to find out how things work.", category: 'analytical' },
  { id: 8, text: "I ask questions when I don't understand something.", category: 'analytical' },
  { id: 9, text: "I try to make sense of what I learn.", category: 'analytical' },
  { id: 10, text: "I can explain why I did something.", category: 'analytical' },
  
  // Practical Thinking (11-15)
  { id: 11, text: "I like fixing things or helping with real-life work.", category: 'practical' },
  { id: 12, text: "I enjoy trying ideas to see if they work.", category: 'practical' },
  { id: 13, text: "I can use what I've learned to solve small problems.", category: 'practical' },
  { id: 14, text: "I like learning things I can use at home or in school.", category: 'practical' },
  { id: 15, text: "I keep trying until I get things to work.", category: 'practical' },
  
  // Thoughtful / Reflective (16-20)
  { id: 16, text: "When something goes wrong, I try again a new way.", category: 'reflective' },
  { id: 17, text: "I listen to other people's ideas.", category: 'reflective' },
  { id: 18, text: "I think about what I can do better next time.", category: 'reflective' },
  { id: 19, text: "I can change my mind when I hear a good reason.", category: 'reflective' },
  { id: 20, text: "I feel proud when I learn from my mistakes.", category: 'reflective' },
];

const emojiOptions = [
  { value: '1', emoji: '😕', label: 'Not really me' },
  { value: '2', emoji: '😐', label: 'A little like me' },
  { value: '3', emoji: '🙂', label: 'Sometimes me' },
  { value: '4', emoji: '😃', label: 'Mostly me' },
  { value: '5', emoji: '🤩', label: "That's so me!" },
];

const categoryInfo = {
  creative: { emoji: '🎨', title: 'Creative Thinking', subtitle: '"I use my imagination!"', color: 'from-pink-500 to-purple-500' },
  analytical: { emoji: '🔍', title: 'Thinking Carefully', subtitle: '"I like to figure things out."', color: 'from-blue-500 to-cyan-500' },
  practical: { emoji: '🛠️', title: 'Practical Thinking', subtitle: '"I use what I know."', color: 'from-orange-500 to-amber-500' },
  reflective: { emoji: '💭', title: 'Thoughtful Thinking', subtitle: '"I learn and grow every day."', color: 'from-green-500 to-emerald-500' },
};

export function ChildrenThinkingAssessment({ onComplete, onBack }: ChildrenThinkingAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showInstructions, setShowInstructions] = useState(true);

  const question = questions[currentQuestion];
  const progress = (Object.keys(answers).length / questions.length) * 100;
  const currentCategory = question.category;
  const categoryDetails = categoryInfo[currentCategory];

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [question.id]: parseInt(value) });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate results
      const results: AssessmentResults = {
        creative: 0,
        analytical: 0,
        practical: 0,
        reflective: 0,
        answers,
      };

      questions.forEach((q) => {
        const answer = answers[q.id] || 0;
        results[q.category] += answer;
      });

      onComplete(results);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="border-4 border-purple-300 shadow-2xl bg-white">
            <CardHeader className="text-center pb-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-t-lg">
              <div className="text-6xl mb-4 animate-bounce">🌈</div>
              <CardTitle className="text-4xl mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                JOTMINDS
              </CardTitle>
              <CardTitle className="text-3xl mb-3">
                My Thinking Adventure!
              </CardTitle>
              <CardDescription className="text-lg">
                Discover how your mind works — in fun and simple ways!
              </CardDescription>
              <Badge className="mx-auto mt-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 text-base">
                For Ages 6 – 10
              </Badge>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
                <div className="flex items-start gap-3">
                  <span className="text-4xl">👋</span>
                  <div>
                    <p className="text-lg leading-relaxed">
                      <strong>Hi friend! I'm your Jotminds Buddy.</strong> Let's find out how you love to think, solve puzzles, and share ideas.
                    </p>
                    <p className="text-lg leading-relaxed mt-2">
                      There are <strong>no right or wrong answers</strong> — just what feels true for you!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-orange-200">
                <h3 className="text-xl mb-4 flex items-center gap-2">
                  <span>🧩</span>
                  <strong>HOW TO ANSWER</strong>
                </h3>
                <p className="text-lg mb-4">
                  Choose the face that shows how much the sentence sounds like you:
                </p>
                <div className="space-y-3">
                  {emojiOptions.map((option) => (
                    <div key={option.value} className="flex items-center gap-3 text-lg">
                      <span className="text-3xl">{option.emoji}</span>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
                <h3 className="text-xl mb-3 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                  <strong>What You'll Discover</strong>
                </h3>
                <p className="text-lg mb-3">We'll explore 4 different ways you think:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎨</span>
                    <span>The Imagination Hero</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔍</span>
                    <span>The Puzzle Solver</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🛠️</span>
                    <span>The Fix-It Star</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💭</span>
                    <span>The Wise Thinker</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={onBack}
                  size="lg"
                  className="text-lg"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>
                <Button
                  onClick={() => setShowInstructions(false)}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg flex-1"
                >
                  Let's Start My Adventure!
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Header */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow-lg border-2 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-2xl">{categoryDetails.emoji}</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-gray-600 mt-2 text-center">
            {Math.round(progress)}% Complete — You're doing great! 🌟
          </p>
        </div>

        {/* Question Card */}
        <Card className="border-4 border-purple-300 shadow-2xl bg-white">
          <CardHeader className={`text-center pb-6 bg-gradient-to-r ${categoryDetails.color} text-white rounded-t-lg`}>
            <div className="text-5xl mb-3">{categoryDetails.emoji}</div>
            <CardTitle className="text-2xl mb-1">
              {categoryDetails.title}
            </CardTitle>
            <CardDescription className="text-white text-lg opacity-90">
              {categoryDetails.subtitle}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-8 pb-8">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200 min-h-[100px] flex items-center justify-center">
              <p className="text-2xl text-center leading-relaxed">
                {question.text}
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <p className="text-center text-lg mb-4">
                Choose the face that matches you best:
              </p>
              <RadioGroup
                value={answers[question.id]?.toString() || ''}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {emojiOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 ${
                      answers[question.id]?.toString() === option.value
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                    onClick={() => handleAnswer(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={`option-${option.value}`} className="hidden" />
                    <Label
                      htmlFor={`option-${option.value}`}
                      className="flex items-center gap-4 cursor-pointer flex-1 text-lg"
                    >
                      <span className="text-4xl">{option.emoji}</span>
                      <span className="flex-1">{option.label}</span>
                      {answers[question.id]?.toString() === option.value && (
                        <CheckCircle2 className="h-6 w-6 text-purple-500" />
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between gap-4 pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentQuestion === 0}
                size="lg"
                className="text-lg"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!answers[question.id]}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg flex-1"
              >
                {currentQuestion === questions.length - 1 ? 'See My Results!' : 'Next Question'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
