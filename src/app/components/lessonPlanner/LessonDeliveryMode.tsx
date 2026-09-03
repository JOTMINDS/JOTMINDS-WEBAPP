import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Play, Pause, RotateCcw, Clock, CheckCircle2, Users, Star, Maximize2, Minimize2, ArrowRight, ArrowLeft, FileText, CheckSquare, AlertTriangle, Lightbulb, Sparkles, Layers } from 'lucide-react';
import { LessonPlan, LessonDeliverySession } from '../../types/lessonPlannerTypes';
import { toast } from 'sonner';

interface LessonDeliveryModeProps {
  plan: LessonPlan;
  onFinishDelivery: (session: LessonDeliverySession) => void;
  onExit: () => void;
}

export const LessonDeliveryMode: React.FC<LessonDeliveryModeProps> = ({
  plan,
  onFinishDelivery,
  onExit
}) => {
  const [prepTab, setPrepTab] = useState<'checklist' | 'live'>('checklist');
  const [currentPhaseIndex, setCurrentIndex] = useState(0);
  const currentPhase = plan.phases[currentPhaseIndex] || plan.phases[0];
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(currentPhase.durationMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [engagementScore, setEngagementScore] = useState<number>(4);
  const [teacherNotes, setTeacherNotes] = useState(currentPhase.teachingNotes || '');

  // Pre-flight checklist items
  const [checklist, setChecklist] = useState([
    { id: 'c1', label: 'Review learning objectives with target success criteria', checked: true },
    { id: 'c2', label: 'Gather required materials & manipulative visual aids', checked: true },
    { id: 'c3', label: 'Check differentiated task cards for support & extension groups', checked: false },
    { id: 'c4', label: 'Anticipate common student misconceptions on this topic', checked: false },
    { id: 'c5', label: 'Set up classroom seating for peer pair work', checked: false },
  ]);

  // Sync phase timer when changing phases
  useEffect(() => {
    setTimeRemainingSeconds(currentPhase.durationMinutes * 60);
    setIsTimerRunning(false);
    setTeacherNotes(currentPhase.teachingNotes || '');
  }, [currentPhaseIndex]);

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeRemainingSeconds > 0) {
      interval = setInterval(() => {
        setTimeRemainingSeconds(prev => prev - 1);
      }, 1000);
    } else if (timeRemainingSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      toast.info(`Time for phase "${currentPhase.name}" has elapsed!`);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemainingSeconds, currentPhase.name]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const allChecklistDone = checklist.every(c => c.checked);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeRemainingSeconds(currentPhase.durationMinutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextPhase = () => {
    if (currentPhaseIndex < plan.phases.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleCompleteDelivery();
    }
  };

  const handlePreviousPhase = () => {
    if (currentPhaseIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleCompleteDelivery = () => {
    const session: LessonDeliverySession = {
      sessionId: `del-${Date.now()}`,
      lessonId: plan.id,
      currentPhaseIndex,
      phaseTimeRemainingSeconds: timeRemainingSeconds,
      isTimerRunning: false,
      attendance: [],
      studentEngagementScore: engagementScore,
      teacherLiveNotes: teacherNotes,
      startedAt: new Date().toISOString()
    };
    toast.success('Lesson Prep completed! Proceeding to reflection...');
    onFinishDelivery(session);
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto text-white' : 'max-w-4xl mx-auto'}`}>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/30 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-0.5 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Pre-Class Launchpad
            </Badge>
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-3 py-0.5 text-xs">
              {plan.gradeClass} • {plan.durationMinutes} mins
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-white">
            {plan.subject}: {plan.topic}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Complete your pre-class checklist, review cognitive warnings, and launch live interactive lesson delivery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex gap-1">
            <button
              onClick={() => setPrepTab('checklist')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                prepTab === 'checklist' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              1. Pre-Flight Checklist
            </button>
            <button
              onClick={() => setPrepTab('live')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                prepTab === 'live' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              2. Live Facilitation
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="bg-white/10 text-white border-white/20 text-xs hidden sm:flex"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 mr-1" /> : <Maximize2 className="w-3.5 h-3.5 mr-1" />}
            {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExit}
            className="bg-white/10 text-white border-white/20 text-xs"
          >
            Exit
          </Button>
        </div>
      </div>

      {/* ─── TAB 1: PRE-FLIGHT CHECKLIST & COGNITIVE WARNINGS ─── */}
      {prepTab === 'checklist' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Checklist Card */}
            <Card className="md:col-span-2 shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <CheckSquare className="w-4 h-4 text-indigo-600" /> Pre-Class Readiness Checklist
                  </span>
                  <Badge variant="outline" className={allChecklistDone ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'text-slate-500'}>
                    {checklist.filter(c => c.checked).length} of {checklist.length} Ready
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Crucial preparation steps to verify before entering the classroom.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {checklist.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`p-3.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      item.checked
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200'
                        : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${item.checked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white dark:bg-slate-800'}`}>
                        {item.checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`font-medium ${item.checked ? 'line-through opacity-80' : ''}`}>
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="pt-3">
                  <Button
                    onClick={() => setPrepTab('live')}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-5 shadow-md cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 mr-2" /> Launch Live Classroom Delivery
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cognitive Alerts & Misconceptions */}
            <div className="space-y-4">
              <Card className="shadow-sm border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Misconception Watch
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-amber-950 dark:text-amber-200 space-y-2">
                  <p className="leading-relaxed">
                    Watch out for students confusing the inverse operation when isolating variables across the equal sign.
                  </p>
                  <div className="bg-white/80 dark:bg-slate-900 p-2.5 rounded-lg border border-amber-200 text-[11px] text-slate-700 dark:text-slate-300">
                    <strong>Quick Fix:</strong> Use a two-pan balance scale metaphor on the whiteboard.
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" /> Class Cognitive Reminders
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-indigo-950 dark:text-indigo-200 space-y-2">
                  <p className="leading-relaxed">
                    <strong>Visual Learners:</strong> 45% of this class requires color-coded steps.
                  </p>
                  <p className="leading-relaxed">
                    <strong>Pacing Note:</strong> Keep direct instruction to 15 mins to prevent attention drop in the final third.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: LIVE FACILITATION & COUNTDOWN ─── */}
      {prepTab === 'live' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Cols: Active Phase Display & Countdown Timer */}
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-md border-indigo-200 dark:border-indigo-900/50">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 pb-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-indigo-600 text-white text-xs px-3 py-1">
                    Phase {currentPhaseIndex + 1} of {plan.phases.length}: {currentPhase.name}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-mono font-bold text-lg text-slate-900 dark:text-white">
                      {formatTime(timeRemainingSeconds)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Activity Display */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Current Activity</h3>
                  <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {currentPhase.activity}
                  </p>
                </div>

                {/* Teaching Notes & Scaffolding */}
                {currentPhase.teachingNotes && (
                  <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/50 space-y-1">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-600" /> Teacher Live Notes & Scaffolding
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {currentPhase.teachingNotes}
                    </p>
                  </div>
                )}

                {/* Countdown Timer Controls */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Activity Countdown Timer</span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={toggleTimer} className={isTimerRunning ? 'bg-amber-600' : 'bg-emerald-600'}>
                      {isTimerRunning ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
                      {isTimerRunning ? 'Pause Timer' : 'Start Timer'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={resetTimer}>
                      <RotateCcw className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={handlePreviousPhase} disabled={currentPhaseIndex === 0}>
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Previous Phase
                  </Button>
                  <Button size="sm" onClick={handleNextPhase} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                    {currentPhaseIndex < plan.phases.length - 1 ? (
                      <>Next Phase <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></>
                    ) : (
                      <>Finish Lesson & Complete Compulsory Reflection <CheckCircle2 className="w-3.5 h-3.5 ml-1.5" /></>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Col: Attendance & Live Engagement Rating */}
          <div className="space-y-6">
            {/* Live Engagement Tracker */}
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500" /> Student Engagement Rating
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setEngagementScore(star)}
                      className={`p-2 rounded-lg transition-all ${
                        star <= engagementScore ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 scale-110' : 'bg-slate-100 text-slate-400 dark:bg-slate-900'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-center text-slate-500">
                  Current Rating: <strong>{engagementScore} / 5 Stars</strong>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
