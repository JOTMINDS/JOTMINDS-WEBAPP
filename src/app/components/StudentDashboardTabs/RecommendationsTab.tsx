import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Sparkles, BookOpen, Lightbulb, Target, CheckCircle2, 
  Brain, Zap, Layers, Compass, ArrowRight, Bookmark, Loader2 
} from 'lucide-react';
import { Assessment, User } from '../../types';
import { toast } from 'sonner';
import { generateAIStudentRecommendations, AIStudentRecommendationItem } from '../../utils/aiService';

interface RecommendationsTabProps {
  user: User;
  assessments: Assessment[];
  onNavigateToTab?: (tabId: string) => void;
}

export function RecommendationsTab({ user, assessments, onNavigateToTab }: RecommendationsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'learning' | 'exam' | 'career'>('all');
  const [savedTips, setSavedTips] = useState<Set<number>>(new Set());
  const [recommendations, setRecommendations] = useState<AIStudentRecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Determine student's dominant styles
  const latestKolb = assessments.filter(a => a.type === 'kolb' || (a.type as string) === 'learning')[0];
  const latestSternberg = assessments.filter(a => a.type === 'sternberg' || (a.type as string) === 'thinking')[0];
  const latestDual = assessments.filter(a => a.type === 'dual-process' || (a.type as string) === 'decision')[0];

  const learningStyle = (latestKolb?.score as any)?.kolb?.style || 'Assimilating';
  const thinkingStyle = (latestSternberg?.score as any)?.sternberg?.style || 'Analytical';
  const decisionStyle = (latestDual?.score as any)?.dualProcess?.style || 'Balanced';

  useEffect(() => {
    let isMounted = true;
    async function loadAIRecommendations() {
      setIsLoading(true);
      const recs = await generateAIStudentRecommendations({
        userId: user.id,
        name: user.name,
        learningStyle,
        thinkingStyle,
        decisionStyle,
        educationLevel: user.educationLevel || user.className
      });
      if (isMounted) {
        setRecommendations(recs);
        setIsLoading(false);
      }
    }
    loadAIRecommendations();
    return () => { isMounted = false; };
  }, [user.id, learningStyle, thinkingStyle, decisionStyle]);

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

  const getCategoryIcon = (category: string) => {
    if (category === 'exam') return Target;
    if (category === 'career') return Compass;
    return BookOpen;
  };

  const getCategoryColor = (category: string) => {
    if (category === 'exam') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (category === 'career') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  const filteredRecs = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.category === selectedCategory);

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
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                </div>
              </div>
              <div className="h-12 bg-slate-100 dark:bg-slate-900 rounded" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecs.map(rec => {
            const IconComponent = getCategoryIcon(rec.category);
            const categoryColor = getCategoryColor(rec.category);
            const isSaved = savedTips.has(rec.id);

            return (
              <Card key={rec.id} className="hover:shadow-md transition-shadow border-gray-200 dark:border-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${categoryColor} shrink-0`}>
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
      )}
    </div>
  );
}
