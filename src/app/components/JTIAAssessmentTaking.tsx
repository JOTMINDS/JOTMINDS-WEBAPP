import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Brain, BookOpen, Users, HeartHandshake, Award,
  ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck,
  Save, Sparkles, AlertCircle
} from 'lucide-react';
import { jtiaQuestions, JTIADomain, jtiaDomainDescriptions, getFullJTIAQuestionBank, getShuffledJTIAQuestionSet, JTIAQuestion } from '../utils/jtiaQuestions';
import { calculateJTIAScore, JTIAReportData } from '../utils/jtiaScoring';
import { toast } from 'sonner';

interface JTIAAssessmentTakingProps {
  userId: string;
  onComplete: (report: JTIAReportData, responses: number[]) => void;
  onCancel: () => void;
  initialResponses?: number[];
}

export const JTIAAssessmentTaking: React.FC<JTIAAssessmentTakingProps> = ({
  userId,
  onComplete,
  onCancel,
  initialResponses = []
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLength, setSelectedLength] = useState<number | null>(() => {
    const savedIds = localStorage.getItem(`jtia_session_ids_${userId}`);
    if (savedIds) {
      try {
        const parsed: number[] = JSON.parse(savedIds);
        if (parsed.length > 0) return parsed.length;
      } catch (e) {}
    }
    return null;
  });

  const [sessionQuestions, setSessionQuestions] = useState<JTIAQuestion[]>(() => {
    const fullBank = getFullJTIAQuestionBank();
    const savedIds = localStorage.getItem(`jtia_session_ids_${userId}`);
    if (savedIds) {
      try {
        const parsedIds: number[] = JSON.parse(savedIds);
        const restored = parsedIds
          .map(id => fullBank.find(q => q.id === id))
          .filter(Boolean) as JTIAQuestion[];
        if (restored.length > 0) return restored;
      } catch (e) {
        console.error("Failed to restore saved JTIA session questions", e);
      }
    }
    return [];
  });

  const startWithLength = (targetCount: number) => {
    const freshSession = getShuffledJTIAQuestionSet({ totalQuestions: targetCount, useFullBank: true });
    localStorage.setItem(`jtia_session_ids_${userId}`, JSON.stringify(freshSession.map(q => q.id)));
    setSessionQuestions(freshSession);
    setSelectedLength(targetCount);
    const arr = new Array(freshSession.length).fill(0);
    setResponses(arr);
    setCurrentIndex(0);
  };

  const [responses, setResponses] = useState<number[]>(() => {
    const saved = localStorage.getItem(`jtia_progress_${userId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && sessionQuestions.length > 0 && parsed.length === sessionQuestions.length) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved JTIA progress", e);
      }
    }
    const arr = new Array(sessionQuestions.length || 120).fill(0);
    initialResponses.forEach((val, i) => {
      if (i < arr.length) arr[i] = val;
    });
    return arr;
  });

  // Auto-save progress (must be before early return)
  useEffect(() => {
    if (selectedLength && sessionQuestions.length > 0) {
      localStorage.setItem(`jtia_progress_${userId}`, JSON.stringify(responses));
    }
  }, [responses, userId, selectedLength, sessionQuestions.length]);

  if (!selectedLength || sessionQuestions.length === 0) {
    return (
      <div className="space-y-8 max-w-3xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
            JTIA Assessment Selector
          </Badge>
        </div>

        <Card className="border-2 border-indigo-200 dark:border-indigo-800/40 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-2">Select Your Assessment Format</h2>
            <p className="text-slate-300 text-sm max-w-xl">
              Choose the depth of assessment that fits your current schedule. All options sample across the 5 Core Teacher Domains.
            </p>
          </div>

          <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Option 1: 12 Questions */}
            <div
              onClick={() => startWithLength(12)}
              className="p-6 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <Badge className="bg-emerald-600 text-white mb-3">Quick Snapshot</Badge>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Brief Overview</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Fast 3-minute diagnostic overview across key teaching scenarios.
                </p>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                Start Brief Overview (~3 min)
              </Button>
            </div>

            {/* Option 2: 60 Questions */}
            <div
              onClick={() => startWithLength(60)}
              className="p-6 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/40 bg-indigo-50/50 dark:bg-indigo-950/20 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <Badge className="bg-indigo-600 text-white mb-3">Standard</Badge>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Standard Profile</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Balanced 12-minute assessment providing deep domain insights.
                </p>
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                Start Standard Profile (~12 min)
              </Button>
            </div>

            {/* Option 3: 120 Questions */}
            <div
              onClick={() => startWithLength(120)}
              className="p-6 rounded-2xl border-2 border-purple-200 dark:border-purple-800/40 bg-purple-50/50 dark:bg-purple-950/20 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <Badge className="bg-purple-600 text-white mb-3">Comprehensive</Badge>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Comprehensive Profile</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Complete 25-minute evaluation covering all sub-competency scenarios.
                </p>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold">
                Start Comprehensive Profile (~25 min)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = sessionQuestions[currentIndex] || sessionQuestions[0];
  const totalQuestions = sessionQuestions.length;
  const answeredCount = responses.filter(r => r > 0).length;
  const progressPct = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectOption = (rating: number) => {
    const updated = [...responses];
    updated[currentIndex] = rating;
    setResponses(updated);

    if (currentIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 150);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleFinish = () => {
    // Check if any questions are unanswered
    const unanswered = responses.filter(r => r === 0).length;
    if (unanswered > 0) {
      toast.warning(`You have ${unanswered} unanswered items. Defaulting to proficient (4) for unrated items.`);
    }

    const report = calculateJTIAScore(responses, sessionQuestions);
    localStorage.removeItem(`jtia_progress_${userId}`);
    localStorage.removeItem(`jtia_session_ids_${userId}`);
    toast.success("JTIA Assessment completed successfully!");
    onComplete(report, responses);
  };

  const getDomainIcon = (domain: JTIADomain) => {
    switch (domain) {
      case "Cognitive Intelligence": return <Brain className="w-5 h-5 text-indigo-500" />;
      case "Instructional Intelligence": return <BookOpen className="w-5 h-5 text-blue-500" />;
      case "Classroom Leadership": return <Users className="w-5 h-5 text-emerald-500" />;
      case "Relationship Intelligence": return <HeartHandshake className="w-5 h-5 text-amber-500" />;
      case "Professional Intelligence": return <Award className="w-5 h-5 text-purple-500" />;
      default: return <Sparkles className="w-5 h-5 text-indigo-500" />;
    }
  };

  const scaleLabels = [
    { value: 1, label: "1 • Strongly Disagree / Seldom", desc: "Rarely applies in my practice" },
    { value: 2, label: "2 • Disagree / Occasionally", desc: "Applies inconsistently" },
    { value: 3, label: "3 • Neutral / Moderate", desc: "Applies moderately or sometimes" },
    { value: 4, label: "4 • Agree / Frequently", desc: "Consistently applies in my practice" },
    { value: 5, label: "5 • Strongly Agree / Consistently", desc: "Exemplary standard in my practice" }
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* ─── Header & Progress ───────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/30 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-3 py-1 text-xs">
              JTIA • Item {currentIndex + 1} of {totalQuestions}
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-1 text-xs">
              {progressPct}% Completed
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 px-3 py-1 text-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Full Bank Shuffled (240-Pool)
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.info("Progress saved to your browser session.");
                onCancel();
              }}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save & Exit
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Overall Assessment Progress</span>
            <span className="font-semibold">{answeredCount} / {totalQuestions} answered</span>
          </div>
          <Progress value={progressPct} className="h-2 bg-slate-800" />
        </div>
      </div>

      {/* ─── Crucial Non-Ranking Notice ─────────────────────────────────── */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3 px-4 flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span><strong>Designed for Development, Not Ranking:</strong> Your responses evaluate cognitive and teaching style to generate personalized growth pathways.</span>
        </div>
      </div>

      {/* ─── Question Card ───────────────────────────────────────────────── */}
      <Card className="shadow-lg border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-2xs">
              {getDomainIcon(currentQuestion.domain)}
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                {currentQuestion.domain}
              </span>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Sub-Competency: {currentQuestion.subCompetency}
              </h4>
            </div>
          </div>

          <Badge variant="outline" className="text-xs">
            {currentQuestion.itemType === 'scenario' ? 'Classroom Scenario' : 'Professional Preference'}
          </Badge>
        </div>

        <CardContent className="p-6 md:p-8 space-y-8">
          {/* Question Text */}
          <div className="space-y-2">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion.text}
            </h2>
            <p className="text-xs text-slate-500">
              Select the rating that best describes your typical practice or level of agreement.
            </p>
          </div>

          {/* 5-Point Likert Scale Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {scaleLabels.map(item => {
              const isSelected = responses[currentIndex] === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => handleSelectOption(item.value)}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-md scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-lg font-black">{item.value}</span>
                  <span className="text-xs font-semibold mt-1">{item.label.split(' • ')[1]}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentIndex === totalQuestions - 1 ? (
                <Button
                  onClick={handleFinish}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg font-bold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Complete Assessment
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
