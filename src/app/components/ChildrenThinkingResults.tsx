import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Sparkles, Download, Share2, Home, Trophy, Star } from 'lucide-react';

interface ChildrenThinkingResultsProps {
  results: {
    creative: number;
    analytical: number;
    practical: number;
    reflective: number;
  };
  userName: string;
  onBackToDashboard: () => void;
  onShareResults?: () => void;
}

interface ThinkingStyle {
  name: string;
  friendlyName: string;
  emoji: string;
  score: number;
  maxScore: number;
  description: string;
  strengths: string[];
  growthTips: string[];
  color: string;
}

const getScoreDescription = (score: number): { level: string; emoji: string; message: string } => {
  if (score >= 21) return { level: 'Amazing', emoji: '🌟', message: "You're amazing at this kind of thinking!" };
  if (score >= 16) return { level: 'Great', emoji: '👍', message: "You're getting really good at it!" };
  if (score >= 11) return { level: 'Learning', emoji: '🙂', message: "You're learning how to use this kind of thinking." };
  return { level: 'Growing', emoji: '🌱', message: "You're just starting to grow this thinking skill." };
};

export function ChildrenThinkingResults({ results, userName, onBackToDashboard, onShareResults }: ChildrenThinkingResultsProps) {
  const thinkingStyles: ThinkingStyle[] = [
    {
      name: 'Creative',
      friendlyName: 'The Imagination Hero',
      emoji: '🎨',
      score: results.creative,
      maxScore: 25,
      description: 'You dream big and love new ideas! Your imagination helps you see things in special ways.',
      strengths: [
        'Coming up with new ideas',
        'Drawing and making things',
        'Thinking of different solutions',
        'Using your imagination'
      ],
      growthTips: [
        'Try drawing a new creature every week',
        'Make up stories before bedtime',
        'Build things with blocks or craft materials',
        'Ask "What if...?" questions'
      ],
      color: 'from-pink-500 to-purple-500'
    },
    {
      name: 'Analytical',
      friendlyName: 'The Puzzle Solver',
      emoji: '🔍',
      score: results.analytical,
      maxScore: 25,
      description: 'You notice small details and love figuring things out! Your curious mind helps you solve problems.',
      strengths: [
        'Solving puzzles and riddles',
        'Asking great questions',
        'Finding patterns',
        'Understanding how things work'
      ],
      growthTips: [
        'Try a new puzzle each week',
        'Ask "Why?" and "How?" questions',
        'Play detective games',
        'Sort and organize your toys'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Practical',
      friendlyName: 'The Fix-It Star',
      emoji: '🛠️',
      score: results.practical,
      maxScore: 25,
      description: 'You make things work and help others! You love trying ideas and seeing what happens.',
      strengths: [
        'Helping with real tasks',
        'Fixing and building',
        'Using what you learn',
        'Trying until things work'
      ],
      growthTips: [
        'Help organize something at home',
        'Try making a simple snack',
        'Build something useful',
        'Show others how to do something'
      ],
      color: 'from-orange-500 to-amber-500'
    },
    {
      name: 'Reflective',
      friendlyName: 'The Wise Thinker',
      emoji: '💭',
      score: results.reflective,
      maxScore: 25,
      description: 'You learn from everything you do! You think carefully and understand feelings.',
      strengths: [
        'Learning from mistakes',
        'Listening to others',
        'Thinking before acting',
        'Being kind and thoughtful'
      ],
      growthTips: [
        'Talk about your day at bedtime',
        'Think about what went well today',
        'Listen carefully when others speak',
        'Draw or write about your feelings'
      ],
      color: 'from-green-500 to-emerald-500'
    }
  ];

  // Sort by score to find primary and secondary styles
  const sortedStyles = [...thinkingStyles].sort((a, b) => b.score - a.score);
  const primaryStyle = sortedStyles[0];
  const secondaryStyle = sortedStyles[1];

  const generatePersonalMessage = () => {
    const primary = primaryStyle.friendlyName;
    const secondary = secondaryStyle.friendlyName;
    
    return `${userName}, you're ${primary} who also has skills as ${secondary}! Your mind is full of ideas and you think in smart ways. Keep exploring and learning every day!`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Celebration Header */}
        <Card className="border-4 border-yellow-300 shadow-2xl bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center gap-3 mb-4">
              <Trophy className="h-16 w-16 text-yellow-500 animate-bounce" />
              <Star className="h-12 w-12 text-yellow-400 animate-pulse" />
              <Trophy className="h-16 w-16 text-yellow-500 animate-bounce" />
            </div>
            <CardTitle className="text-4xl mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎉 Awesome Work, {userName}! 🎉
            </CardTitle>
            <CardDescription className="text-xl">
              You've discovered your Thinking Superpowers!
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="bg-white p-6 rounded-lg border-2 border-purple-200 shadow-lg">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-5xl">{primaryStyle.emoji}</span>
                <div className="flex-1">
                  <h3 className="text-2xl mb-2">
                    Your Main Superpower: <span className={`bg-gradient-to-r ${primaryStyle.color} bg-clip-text text-transparent font-bold`}>
                      {primaryStyle.friendlyName}
                    </span>
                  </h3>
                  <p className="text-lg leading-relaxed">
                    {generatePersonalMessage()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results for Each Style */}
        <div className="grid gap-6">
          {thinkingStyles.map((style, index) => {
            const scoreInfo = getScoreDescription(style.score);
            const percentage = (style.score / style.maxScore) * 100;
            const isPrimary = style.name === primaryStyle.name;
            
            return (
              <Card
                key={style.name}
                className={`${isPrimary ? 'border-4 border-yellow-400 shadow-xl' : 'border-2 border-gray-200'} transition-all hover:shadow-lg`}
              >
                <CardHeader className={`bg-gradient-to-r ${style.color} text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-5xl">{style.emoji}</span>
                      <div>
                        <CardTitle className="text-2xl">{style.friendlyName}</CardTitle>
                        <CardDescription className="text-white opacity-90 text-base">
                          {style.name} Thinking
                        </CardDescription>
                      </div>
                    </div>
                    {isPrimary && (
                      <Badge className="bg-yellow-400 text-yellow-900 text-base px-4 py-2">
                        ⭐ Your Top Power!
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6 pt-6">
                  {/* Score */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">Your Score</span>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{scoreInfo.emoji}</span>
                        <span className="text-2xl">{style.score} / {style.maxScore}</span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-4 mb-2" />
                    <p className="text-center text-base bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                      {scoreInfo.message}
                    </p>
                  </div>

                  {/* Description */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-lg leading-relaxed">{style.description}</p>
                  </div>

                  {/* Strengths */}
                  <div>
                    <h4 className="text-lg mb-3 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                      <strong>What You're Good At:</strong>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {style.strengths.map((strength, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
                          <span className="text-lg">✓</span>
                          <span>{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Growth Tips */}
                  <div>
                    <h4 className="text-lg mb-3 flex items-center gap-2">
                      <span className="text-xl">💡</span>
                      <strong>Ways to Grow Even More:</strong>
                    </h4>
                    <div className="space-y-2">
                      {style.growthTips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <span className="text-lg">→</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Next Steps */}
        <Card className="border-4 border-purple-300 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">🌟 Keep Growing Your Brain! 🌟</CardTitle>
            <CardDescription className="text-lg">
              Every time you use your mind, it gets stronger — just like muscles!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-6 rounded-lg border-2 border-purple-200 space-y-4">
              <p className="text-lg">
                <strong>Remember:</strong> You have ALL FOUR thinking powers! Your brain can be creative, careful, practical, AND thoughtful. The more you use them, the stronger they become!
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {thinkingStyles.map((style) => (
                  <div key={style.name} className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="text-3xl mb-1">{style.emoji}</div>
                    <div className="text-sm">{style.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onBackToDashboard}
            size="lg"
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to My Dashboard
          </Button>
          {onShareResults && (
            <Button
              variant="outline"
              size="lg"
              className="text-lg flex-1"
              onClick={onShareResults}
            >
              <Share2 className="mr-2 h-5 w-5" />
              Share Results
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            className="text-lg flex-1"
            onClick={() => window.print()}
          >
            <Download className="mr-2 h-5 w-5" />
            Save My Results
          </Button>
        </div>
      </div>
    </div>
  );
}
