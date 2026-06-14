import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { DailyChallengeResults } from './BrainGym';
import { Trophy, Flame, Star, TrendingUp, Brain, Zap, Target, PartyPopper, ArrowLeft, RotateCcw } from 'lucide-react';

interface BrainGymResultsProps {
  results: DailyChallengeResults;
  onBack: () => void;
  onRetry: () => void;
}

export function BrainGymResults({ results, onBack, onRetry }: BrainGymResultsProps) {
  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: 'Outstanding! 🌟', color: 'from-yellow-400 to-orange-500', message: "You're a cognitive superstar!" };
    if (score >= 75) return { label: 'Excellent! 🎯', color: 'from-green-400 to-emerald-500', message: 'Your brain is firing on all cylinders!' };
    if (score >= 60) return { label: 'Good Progress! 💪', color: 'from-blue-400 to-cyan-500', message: "Keep training and you'll master this!" };
    return { label: 'Keep Training! 🚀', color: 'from-purple-400 to-pink-500', message: 'Every rep makes you stronger!' };
  };

  const performance = getPerformanceLevel(results.score);
  const correctCount = results.responses.filter(r => r.correct).length;
  const avgTimePerQuestion = Math.round(
    results.responses.reduce((sum, r) => sum + r.timeSpent, 0) / results.responses.length / 1000
  );

  const getCategoryIcon = () => {
    switch (results.category) {
      case 'learning': return Brain;
      case 'thinking': return Zap;
      case 'decision': return Target;
    }
  };

  const CategoryIcon = getCategoryIcon();

  const tips = {
    learning: [
      'Try the Feynman Technique: Teach what you learn to someone else',
      'Space out your study sessions for better retention',
      'Use multiple senses when learning (write, speak, visualize)',
    ],
    thinking: [
      'Practice breaking complex problems into smaller parts',
      'Challenge assumptions - ask "why" and "what if"',
      'Cross-pollinate ideas from different subjects',
    ],
    decision: [
      'Use the 10-10-10 rule: Consider impact in 10 mins, 10 months, 10 years',
      'Write down pros/cons for important decisions',
      'Trust data for big decisions, intuition for small ones',
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="shadow-soft">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button onClick={onRetry} variant="outline" className="shadow-soft">
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>

        {/* Main Results Card */}
        <Card className="border-2 shadow-large overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
          
          <CardHeader className="relative text-center pb-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="flex justify-center mb-4">
              <div className={`h-24 w-24 rounded-full bg-gradient-to-r ${performance.color} flex items-center justify-center shadow-xl animate-bounce`}>
                <PartyPopper className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl sm:text-4xl mb-2">{performance.label}</CardTitle>
            <CardDescription className="text-lg">{performance.message}</CardDescription>
          </CardHeader>

          <CardContent className="relative pt-8 space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-4 relative">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="white"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(results.score / 100) * 439.6} 439.6`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="text-center">
                  <div className="text-5xl font-bold text-white">{results.score}</div>
                  <div className="text-sm text-white/90">Score</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <CategoryIcon className="h-5 w-5" />
                <span className="capitalize">{results.category} Challenge</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="border-2 border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-2">
                    <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-700 dark:text-green-300">{correctCount}/{results.responses.length}</div>
                  <p className="text-sm text-green-600 dark:text-green-400">Optimal Choices</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-2">
                    <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center">
                      <Flame className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">{results.streak}</div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Day Streak</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-2">
                    <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{results.totalPoints}</div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Points Earned</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Stats */}
            <Card className="border-2 border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Performance Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Time per Question</span>
                  <Badge variant="secondary" className="text-sm">{avgTimePerQuestion}s</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Challenge Category</span>
                  <Badge variant="secondary" className="text-sm capitalize">{results.category}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <Badge variant="secondary" className="text-sm">{Math.round((correctCount / results.responses.length) * 100)}%</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tips Section */}
            <Card className="border-2 border-cyan-200 dark:border-cyan-700 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  Brain Boost Tips
                </CardTitle>
                <CardDescription>
                  Expert strategies to master {results.category} skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tips[results.category].map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Continue Training CTA */}
            <Card className="border-2 border-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-700 dark:to-pink-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Flame className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Keep Your Streak Alive! 🔥</h3>
                  <p className="text-sm text-muted-foreground">
                    Come back tomorrow for a new challenge and build your cognitive strength daily!
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button 
                    onClick={onRetry}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Try Different Challenge
                  </Button>
                  <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}