import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Brain, Flame, Trophy, Target, ChevronRight, ChevronLeft, Check, Star, Zap, TrendingUp } from 'lucide-react';

interface BrainGymProps {
  userId: string;
  onComplete: (results: DailyChallengeResults) => void;
  onBack: () => void;
}

export interface DailyChallengeResults {
  challengeId: string;
  completedAt: string;
  score: number;
  responses: { questionId: string; answer: number; correct: boolean; timeSpent: number }[];
  category: 'learning' | 'thinking' | 'decision';
  streak: number;
  totalPoints: number;
}

const dailyChallenges = {
  learning: [
    {
      id: 'learn-1',
      category: 'learning' as const,
      question: "You're learning to code. What helps you most?",
      options: [
        { text: '🎯 Build a real app right away', value: 4, skill: 'hands-on', emoji: '🚀' },
        { text: '📚 Read documentation thoroughly first', value: 2, skill: 'reflective', emoji: '📖' },
        { text: '🎨 Watch video tutorials and examples', value: 3, skill: 'visual', emoji: '🎬' },
        { text: '👥 Code with friends and discuss', value: 3, skill: 'collaborative', emoji: '🤝' },
      ],
      tip: 'Hands-on practice speeds up skill mastery!'
    },
    {
      id: 'learn-2',
      category: 'learning' as const,
      question: 'When studying for exams, you prefer to:',
      options: [
        { text: '✍️ Practice with past questions', value: 4, skill: 'active', emoji: '📝' },
        { text: '🧠 Summarize notes in your own words', value: 3, skill: 'processing', emoji: '💭' },
        { text: '🗣️ Teach the material to someone else', value: 4, skill: 'teaching', emoji: '👨‍🏫' },
        { text: '📊 Create mind maps and diagrams', value: 3, skill: 'visual', emoji: '🎨' },
      ],
      tip: 'Active recall is more effective than re-reading!'
    },
    {
      id: 'learn-3',
      category: 'learning' as const,
      question: 'A new skill you want to master:',
      options: [
        { text: '🎸 Learn by trying, making mistakes, improving', value: 4, skill: 'experiential', emoji: '🔥' },
        { text: '📖 Study theory first, then apply', value: 2, skill: 'theoretical', emoji: '🎓' },
        { text: '👀 Watch experts, then copy their method', value: 3, skill: 'observational', emoji: '👁️' },
        { text: '💡 Mix theory and practice equally', value: 4, skill: 'balanced', emoji: '⚖️' },
      ],
      tip: 'Experiential learning creates lasting muscle memory!'
    },
    {
      id: 'learn-4',
      category: 'learning' as const,
      question: 'In group projects, you learn best by:',
      options: [
        { text: '🛠️ Taking charge and doing the work', value: 3, skill: 'leadership', emoji: '👑' },
        { text: '🤔 Analyzing what others suggest', value: 2, skill: 'analytical', emoji: '🔍' },
        { text: '💬 Brainstorming ideas with the team', value: 4, skill: 'collaborative', emoji: '💡' },
        { text: '📋 Organizing and coordinating tasks', value: 3, skill: 'organizational', emoji: '📊' },
      ],
      tip: 'Collaboration multiplies learning speed!'
    },
    {
      id: 'learn-5',
      category: 'learning' as const,
      question: 'You remember information best when you:',
      options: [
        { text: '✋ Write it down by hand', value: 4, skill: 'kinesthetic', emoji: '✍️' },
        { text: '👂 Hear it explained aloud', value: 3, skill: 'auditory', emoji: '🔊' },
        { text: '👁️ See it in diagrams or images', value: 3, skill: 'visual', emoji: '📸' },
        { text: '🔄 Repeat it multiple times', value: 2, skill: 'repetition', emoji: '🔁' },
      ],
      tip: 'Writing by hand activates more brain regions!'
    },
  ],
  thinking: [
    {
      id: 'think-1',
      category: 'thinking' as const,
      question: 'Your phone stops working. You:',
      options: [
        { text: '🔧 Troubleshoot step by step logically', value: 4, skill: 'analytical', emoji: '🧩' },
        { text: '💡 Try unusual fixes that might work', value: 3, skill: 'creative', emoji: '✨' },
        { text: '📱 Check online for similar issues', value: 3, skill: 'resourceful', emoji: '🔍' },
        { text: '🤷 Ask tech-savvy friends for help', value: 2, skill: 'collaborative', emoji: '👥' },
      ],
      tip: 'Analytical thinking prevents hasty mistakes!'
    },
    {
      id: 'think-2',
      category: 'thinking' as const,
      question: 'Planning a surprise party, you focus on:',
      options: [
        { text: '📋 Detailed timeline and budget', value: 3, skill: 'practical', emoji: '💰' },
        { text: '🎨 Unique creative theme ideas', value: 4, skill: 'creative', emoji: '🎉' },
        { text: '🧮 Calculate costs vs. attendees', value: 3, skill: 'analytical', emoji: '📊' },
        { text: '⚡ Wing it and improvise on the day', value: 2, skill: 'spontaneous', emoji: '🎲' },
      ],
      tip: 'Creativity + planning = unforgettable events!'
    },
    {
      id: 'think-3',
      category: 'thinking' as const,
      question: 'Solving a complex math problem:',
      options: [
        { text: '📐 Break it into smaller steps', value: 4, skill: 'analytical', emoji: '🔢' },
        { text: '🎯 Look for patterns or shortcuts', value: 4, skill: 'strategic', emoji: '💡' },
        { text: '📖 Review similar solved examples', value: 3, skill: 'learning', emoji: '📚' },
        { text: '🤔 Try different methods until one works', value: 3, skill: 'experimental', emoji: '🧪' },
      ],
      tip: 'Breaking problems down makes them manageable!'
    },
    {
      id: 'think-4',
      category: 'thinking' as const,
      question: 'Your favorite type of puzzle is:',
      options: [
        { text: '🧩 Logic puzzles with clear rules', value: 4, skill: 'analytical', emoji: '🎯' },
        { text: '🎨 Creative challenges with no right answer', value: 3, skill: 'creative', emoji: '🌈' },
        { text: '🔍 Mystery solving and detective work', value: 4, skill: 'deductive', emoji: '🕵️' },
        { text: '⚡ Fast-paced strategy games', value: 3, skill: 'strategic', emoji: '♟️' },
      ],
      tip: 'Different puzzles train different thinking muscles!'
    },
    {
      id: 'think-5',
      category: 'thinking' as const,
      question: 'When brainstorming business ideas:',
      options: [
        { text: '💡 Think of wild, innovative concepts', value: 4, skill: 'creative', emoji: '🚀' },
        { text: '📊 Analyze market gaps systematically', value: 4, skill: 'analytical', emoji: '📈' },
        { text: '🎯 Focus on solving real problems', value: 4, skill: 'practical', emoji: '🔧' },
        { text: '🌍 Copy successful models from abroad', value: 2, skill: 'adaptive', emoji: '🌏' },
      ],
      tip: 'Best ideas solve real problems creatively!'
    },
  ],
  decision: [
    {
      id: 'decide-1',
      category: 'decision' as const,
      question: 'Friend asks to borrow money. You:',
      options: [
        { text: '💭 Trust your gut feeling about them', value: 3, skill: 'intuitive', emoji: '✨' },
        { text: '🧮 Consider if they can pay back', value: 4, skill: 'analytical', emoji: '💰' },
        { text: '❤️ Help immediately—they\'re a friend', value: 2, skill: 'empathetic', emoji: '🤝' },
        { text: '📋 Set clear repayment terms first', value: 4, skill: 'strategic', emoji: '📝' },
      ],
      tip: 'Balance empathy with practical wisdom!'
    },
    {
      id: 'decide-2',
      category: 'decision' as const,
      question: 'Choosing between two job offers:',
      options: [
        { text: '💡 Pick the one that feels right', value: 2, skill: 'intuitive', emoji: '✨' },
        { text: '📊 Compare salary, benefits, growth', value: 4, skill: 'analytical', emoji: '📈' },
        { text: '👥 Ask mentors for their opinion', value: 3, skill: 'consultative', emoji: '🎓' },
        { text: '⚖️ List pros/cons systematically', value: 4, skill: 'systematic', emoji: '📋' },
      ],
      tip: 'Major decisions deserve thorough analysis!'
    },
    {
      id: 'decide-3',
      category: 'decision' as const,
      question: 'Picking courses for next semester:',
      options: [
        { text: '❤️ Choose what sounds interesting', value: 2, skill: 'interest-driven', emoji: '🎨' },
        { text: '🎯 Select based on career goals', value: 4, skill: 'strategic', emoji: '🚀' },
        { text: '📊 Check difficulty and workload', value: 3, skill: 'practical', emoji: '📚' },
        { text: '👨‍🏫 Ask seniors which are best', value: 3, skill: 'informed', emoji: '💬' },
      ],
      tip: 'Align choices with your long-term goals!'
    },
    {
      id: 'decide-4',
      category: 'decision' as const,
      question: 'Under time pressure, you usually:',
      options: [
        { text: '⚡ Make quick instinctive choices', value: 3, skill: 'decisive', emoji: '⏰' },
        { text: '🧠 Take a breath and think clearly', value: 4, skill: 'composed', emoji: '🧘' },
        { text: '😰 Feel stressed and freeze up', value: 1, skill: 'developing', emoji: '😓' },
        { text: '👥 Ask for quick input from others', value: 2, skill: 'collaborative', emoji: '🤝' },
      ],
      tip: 'Staying calm improves decision quality under pressure!'
    },
    {
      id: 'decide-5',
      category: 'decision' as const,
      question: 'Buying a new laptop, you prioritize:',
      options: [
        { text: '💻 Specifications and performance data', value: 4, skill: 'analytical', emoji: '⚡' },
        { text: '💰 Best value for money', value: 4, skill: 'practical', emoji: '💵' },
        { text: '😍 Design and how it looks', value: 2, skill: 'aesthetic', emoji: '✨' },
        { text: '⭐ Reviews and recommendations', value: 3, skill: 'informed', emoji: '📱' },
      ],
      tip: 'Research prevents expensive regrets!'
    },
  ],
};

export function BrainGym({ userId, onComplete, onBack }: BrainGymProps) {
  const [currentCategory, setCurrentCategory] = useState<'learning' | 'thinking' | 'decision'>('learning');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<{ questionId: string; answer: number; timeSpent: number }[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const challenges = dailyChallenges[currentCategory];
  const currentChallenge = challenges[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / challenges.length) * 100;

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (value: number) => {
    const timeSpent = Date.now() - questionStartTime;
    
    setSelectedAnswer(value);
    setShowFeedback(true);

    // Record response
    const newResponse = {
      questionId: currentChallenge.id,
      answer: value,
      timeSpent,
    };

    setResponses([...responses, newResponse]);

    // Auto-advance after showing feedback
    setTimeout(() => {
      if (currentQuestionIndex < challenges.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        // Complete this category
        completeChallenge();
      }
    }, 2000);
  };

  const completeChallenge = () => {
    // Calculate score based on optimal answers
    const score = responses.reduce((total, response) => total + response.answer, 0);
    const maxScore = challenges.length * 4;
    const percentageScore = Math.round((score / maxScore) * 100);

    const results: DailyChallengeResults = {
      challengeId: `${currentCategory}-${new Date().toISOString().split('T')[0]}`,
      completedAt: new Date().toISOString(),
      score: percentageScore,
      responses: responses.map(r => ({ ...r, correct: r.answer >= 3 })),
      category: currentCategory,
      streak: 1, // Will be calculated from storage
      totalPoints: score * 10, // 10 points per value point
    };

    onComplete(results);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      // Remove last response
      setResponses(responses.slice(0, -1));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="shadow-soft">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Badge variant="secondary" className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Brain className="mr-1 h-4 w-4" />
            Brain Gym
          </Badge>
        </div>

        {/* Progress Card */}
        <Card className="border-2 shadow-large bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/10">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    {currentCategory === 'learning' ? <Brain className="h-5 w-5 text-white" /> :
                     currentCategory === 'thinking' ? <Zap className="h-5 w-5 text-white" /> :
                     <Target className="h-5 w-5 text-white" />}
                  </div>
                  <div>
                    <p className="font-semibold capitalize">{currentCategory} Challenge</p>
                    <p className="text-xs text-muted-foreground">Question {currentQuestionIndex + 1} of {challenges.length}</p>
                  </div>
                </div>
                <span className="font-semibold text-lg">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="border-2 shadow-large">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                <span className="text-white text-xl font-bold">{currentQuestionIndex + 1}</span>
              </div>
              <CardTitle className="text-2xl leading-relaxed flex-1">
                {currentChallenge.question}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Answer Options */}
            <div className="grid gap-3">
              {currentChallenge.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showFeedback && handleAnswerSelect(option.value)}
                  disabled={showFeedback}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    showFeedback && selectedAnswer === option.value
                      ? option.value >= 3
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
                        : 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-400'
                      : selectedAnswer === option.value && !showFeedback
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-400'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:scale-[1.02]'
                  } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{option.emoji}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{option.text}</div>
                      <div className="text-xs text-muted-foreground capitalize mt-1">
                        {option.skill} skill
                      </div>
                    </div>
                    {showFeedback && selectedAnswer === option.value && (
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        option.value >= 3 ? 'bg-green-500' : 'bg-orange-500'
                      }`}>
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Feedback */}
            {showFeedback && (
              <Card className="border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 animate-in fade-in slide-in-from-bottom-4">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">💡 Brain Boost Tip</p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">{currentChallenge.tip}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            {!showFeedback && (
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  💭 Choose what feels most natural to you
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Motivation Card */}
        <Card className="border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-sm text-center text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              <p>
                Daily challenges strengthen your cognitive skills and build mental agility! 🧠✨
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}