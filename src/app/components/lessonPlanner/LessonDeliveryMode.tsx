import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Play, Pause, RotateCcw, Clock, CheckCircle2, Users, Star, Maximize2, Minimize2, ArrowRight, ArrowLeft, FileText } from 'lucide-react';
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
  const [currentPhaseIndex, setCurrentIndex] = useState(0);
  const currentPhase = plan.phases[currentPhaseIndex] || plan.phases[0];
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(currentPhase.durationMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [engagementScore, setEngagementScore] = useState<number>(4);
  const [teacherNotes, setTeacherNotes] = useState(currentPhase.teachingNotes || '');

  // Attendance state
  const [attendance, setAttendance] = useState<Array<{ studentId: string; name: string; present: boolean }>>([
    { studentId: 's1', name: 'Kwame Mensah', present: true },
    { studentId: 's2', name: 'Ama Osei', present: true },
    { studentId: 's3', name: 'Kofi Appiah', present: true },
    { studentId: 's4', name: 'Esi Boateng', present: true },
    { studentId: 's5', name: 'Yaw Addo', present: false }
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

  const toggleAttendance = (idx: number) => {
    const updated = [...attendance];
    updated[idx].present = !updated[idx].present;
    setAttendance(updated);
  };

  const handleCompleteDelivery = () => {
    const session: LessonDeliverySession = {
      sessionId: `del-${Date.now()}`,
      lessonId: plan.id,
      currentPhaseIndex,
      phaseTimeRemainingSeconds: timeRemainingSeconds,
      isTimerRunning: false,
      attendance,
      studentEngagementScore: engagementScore,
      teacherLiveNotes: teacherNotes,
      startedAt: new Date().toISOString()
    };
    toast.success('Lesson Prep completed!');
    onFinishDelivery(session);
  };

  const progressPct = Math.round(((currentPhaseIndex + 1) / plan.phases.length) * 100);

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto text-white' : 'max-w-4xl mx-auto'}`}>
      {/* Live Presentation Top Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/30 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-0.5 text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Lesson Prep Mode
            </Badge>
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-3 py-0.5 text-xs">
              Phase {currentPhaseIndex + 1} of {plan.phases.length}
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-white">
            {plan.subject}: {plan.topic} ({plan.gradeClass})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="bg-white/10 text-white border-white/20 text-xs"
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
            Exit Delivery Mode
          </Button>
        </div>
      </div>

      {/* Main Delivery Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Phase Display & Countdown Timer */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-md border-indigo-200 dark:border-indigo-900/50">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 pb-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-indigo-600 text-white text-xs px-3 py-1">
                  Active Phase: {currentPhase.name}
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
                <Button size="sm" onClick={handleNextPhase} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {currentPhaseIndex < plan.phases.length - 1 ? (
                    <>Next Phase <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></>
                  ) : (
                    <>Finish Lesson Prep & Reflect <CheckCircle2 className="w-3.5 h-3.5 ml-1.5" /></>
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
                <Star className="w-4 h-4 text-amber-500" /> Student Engagement Tracker
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

          {/* Quick Attendance Checklist */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-500" /> Attendance Check
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  {attendance.filter(a => a.present).length} / {attendance.length} Present
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {attendance.map((st, idx) => (
                <div
                  key={st.studentId}
                  onClick={() => toggleAttendance(idx)}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                    st.present
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200'
                      : 'bg-rose-50/60 border-rose-200 text-rose-950 dark:bg-rose-950/30 dark:text-rose-200'
                  }`}
                >
                  <span className="font-semibold">{st.name}</span>
                  <Badge variant="outline" className={st.present ? 'border-emerald-300 text-emerald-700' : 'border-rose-300 text-rose-700'}>
                    {st.present ? 'Present' : 'Absent'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
