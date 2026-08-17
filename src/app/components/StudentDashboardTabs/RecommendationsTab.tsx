import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Sparkles, BookOpen, Lightbulb, Target, CheckCircle2, 
  Brain, Zap, Layers, Compass, ArrowRight, Bookmark 
} from 'lucide-react';
import { Assessment, User } from '../../types';
import { toast } from 'sonner';

interface RecommendationsTabProps {
  user: User;
  assessments: Assessment[];
  onNavigateToTab?: (tabId: string) => void;
}

export function RecommendationsTab({ user, assessments, onNavigateToTab }: RecommendationsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'learning' | 'exam' | 'career'>('all');
  const [savedTips, setSavedTips] = useState<Set<number>>(new Set());

  // Determine student's dominant styles
  const latestKolb = assessments.filter(a => a.type === 'kolb' || (a.type as string) === 'learning')[0];
  const latestSternberg = assessments.filter(a => a.type === 'sternberg' || (a.type as string) === 'thinking')[0];
  const latestDual = assessments.filter(a => a.type === 'dual-process' || (a.type as string) === 'decision')[0];

  const learningStyle = (latestKolb?.score as any)?.kolb?.style || 'Assimilating';
  const thinkingStyle = (latestSternberg?.score as any)?.sternberg?.style || 'Analytical';
  const decisionStyle = (latestDual?.score as any)?.dualProcess?.style || 'Balanced';

  const toggleSaveTip = (id: number) => {
    setSavedTips(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info('Removed from saved study tips');
      } else {
        next.add(id);
        toast.success('Saved to your study toolkit!');
      }
      return next;
    });
  };

  const recommendationsList = [
    {
      id: 1,
      category: 'learning',
      title: 'Active Concept Synthesis',
      description: `Based on your ${learningStyle} learning style, convert theoretical reading into structured visual mind maps or flowcharts. Summarizing key topics visually increases your retention by up to 45%.`,
      tag: 'Study Strategy',
      icon: BookOpen,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: 2,
      category: 'exam',
      title: 'Timed Revision Sprints',
      description: `Leverage your ${thinkingStyle} thinking preference by practicing problem-solving under timed 25-minute Pomodoro intervals. Analyze your errors logically right after each sprint.`,
      tag: 'Exam Prep',
      icon: Target,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      id: 3,
      category: 'learning',
      title: 'Peer Teaching & Discussion',
      description: `Explain difficult concepts to a classmate in your own words. Teaching others validates your comprehension and exposes any subtle gaps in your understanding.`,
      tag: 'Collaboration',
      icon: Lightbulb,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 4,
      category: 'exam',
      title: 'Reflective Decision Pause',
      description: `With your ${decisionStyle} decision style, avoid rushing multiple-choice questions. Re-read the question stems carefully and eliminate two obviously incorrect choices first.`,
      tag: 'Exam Technique',
      icon: Brain,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 5,
      category: 'career',
      title: 'Subject & Career Alignment',
      description: `Your combination of ${thinkingStyle} thinking and ${learningStyle} learning thrives in analytical and technical disciplines. Focus on building projects that demonstrate practical problem-solving.`,
      tag: 'Future Readiness',
      icon: Compass,
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 6,
      category: 'learning',
      title: 'Interleaved Practice Sessions',
      description: `Switch between related subjects (e.g., Physics and Mathematics) during a single study session rather than spending 4 hours on one subject to keep your brain engaged.`,
      tag: 'Brain Efficiency',
      icon: Zap,
      color: 'bg-pink-50 text-pink-700 border-pink-200'
    }
  ];

  const filteredRecs = selectedCategory === 'all' 
    ? recommendationsList 
    : recommendationsList.filter(r => r.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#6B4C9A] via-[#7B61FF] to-[#1E8A6E] rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Personalized Toolkit
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Personalized Recommendations & Study Tips
          </h2>
          <p className="text-white/90 text-sm md:text-base leading-relaxed">
            Tailored study techniques, exam preparation methods, and cognitive growth strategies customized for your <strong className="text-amber-200">{learningStyle}</strong> learning style and <strong className="text-emerald-200">{thinkingStyle}</strong> thinking profile.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10 pointer-events-none">
          <Brain className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-950 p-3 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#6B4C9A] text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
          >
            All Recommendations
          </button>
          <button
            onClick={() => setSelectedCategory('learning')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'learning'
                ? 'bg-[#6B4C9A] text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
          >
            Study Strategies
          </button>
          <button
            onClick={() => setSelectedCategory('exam')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'exam'
                ? 'bg-[#6B4C9A] text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
          >
            Exam Prep
          </button>
          <button
            onClick={() => setSelectedCategory('career')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'career'
                ? 'bg-[#6B4C9A] text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
          >
            Future & Career
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold">{savedTips.size}</span> saved tips
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecs.map(rec => {
          const IconComponent = rec.icon;
          const isSaved = savedTips.has(rec.id);

          return (
            <Card key={rec.id} className="hover:shadow-md transition-shadow border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${rec.color} shrink-0`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider mb-1">
                        {rec.tag}
                      </Badge>
                      <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                        {rec.title}
                      </CardTitle>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleSaveTip(rec.id)}
                    className={`h-8 w-8 ${isSaved ? 'text-amber-500 hover:text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
                    title={isSaved ? 'Remove Bookmark' : 'Bookmark Tip'}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {rec.description}
                </p>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-900 flex items-center justify-between text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> High Impact Method
                  </span>
                  {onNavigateToTab && (
                    <button
                      onClick={() => onNavigateToTab('skill-builder')}
                      className="text-[#6B4C9A] hover:underline font-semibold flex items-center gap-1"
                    >
                      Practice in Skill Builder <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
