import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Brain, HelpCircle, X, CheckCircle2, Award, Target, Sparkles } from 'lucide-react';

interface ScoreOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentType?: string;
}

export const ScoreOverviewModal: React.FC<ScoreOverviewModalProps> = ({
  isOpen,
  onClose,
  assessmentType = 'cognitive'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-xl shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <CardHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-t-xl flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs">
                Scoring Methodology
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs">
                Peer-Reviewed Framework
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2 mt-1">
              <Brain className="w-5 h-5 text-indigo-400" /> How Your Score is Calculated
            </CardTitle>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="text-slate-300 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {/* Overview Statement */}
          <div className="bg-indigo-50/70 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-1">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block">
              Multi-Dimensional Cognitive Weighting Algorithm
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              JotMinds does not measure generic IQ. Instead, scores are derived from standardized psychological and educational frameworks to map how your brain receives, processes, and applies information.
            </p>
          </div>

          {/* 3 Core Scientific Models */}
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <h4 className="font-bold text-xs text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-purple-600" /> 1. Triarchic Model (Thinking Styles)
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Evaluates 3 distinct dimensions: <strong>Analytical (Executive)</strong> problem solving, <strong>Creative (Legislative)</strong> idea generation, and <strong>Practical (Judicial)</strong> real-world execution. Scale: 0–100%.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <h4 className="font-bold text-xs text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600" /> 2. Experiential Learning Cycle (Learning Styles)
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Measures 4 processing quadrants: Concrete Experience (CE), Reflective Observation (RO), Abstract Conceptualization (AC), and Active Experimentation (AE).
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" /> 3. Kahneman Dual-Process Model (Decision Making)
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Calculates System 1 (Intuitive/Rapid) vs System 2 (Deliberate/Analytical) reasoning balance under time and complexity constraints.
              </p>
            </div>
          </div>

          <Button onClick={onClose} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
            Got It! Close Guide
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
