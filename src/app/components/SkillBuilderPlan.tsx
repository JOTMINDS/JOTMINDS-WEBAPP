import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { ArrowLeft, Briefcase, CheckCircle2, Circle, Lock } from 'lucide-react';
import { deleteSkillPlan, getSkillPlan, SkillPlan } from '../utils/skillPlanApi';
import { getCognitiveProfile, CognitiveProfile } from '../utils/cognitiveProfileApi';
import { SkillBuilderDay } from './SkillBuilderDay';
import { challengeText, gameTitle, getDimension, scoreDimensions } from '../data/skillBuilderContent';
import { toast } from 'sonner';

interface Props {
  planId: string;
  onBack: () => void;
  /** Open this day straight away (used by "Start Day N"). */
  initialDay?: number;
}

const PURPLE = '#6B4C9A';

export function SkillBuilderPlan({ planId, onBack, initialDay }: Props) {
  const [plan, setPlan] = useState<SkillPlan | null>(null);
  const [profile, setProfile] = useState<CognitiveProfile | null>(null);
  const [openDay, setOpenDay] = useState<number | null>(initialDay ?? null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      setPlan(await getSkillPlan(planId));
    } catch (e: any) {
      setError(e.message || 'We could not load this plan.');
    }
  };

  useEffect(() => { load(); }, [planId]);
  useEffect(() => { getCognitiveProfile().then(setProfile).catch(() => setProfile(null)); }, []);

  const dimScore = useMemo(
    () => (plan ? scoreDimensions(profile).find(s => s.id === plan.dimensionId) ?? null : null),
    [plan, profile],
  );

  const removePlan = async () => {
    try {
      await deleteSkillPlan(planId);
      toast.success('Plan removed');
      onBack();
    } catch (e: any) {
      toast.error(e.message || 'Could not remove the plan');
    }
  };

  if (openDay !== null && plan) {
    return (
      <SkillBuilderDay
        plan={plan}
        day={openDay}
        onBack={() => { setOpenDay(null); load(); }}
      />
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-3">
        {error ? (
          <div className="space-y-3">
            <p className="text-destructive text-sm" role="alert">{error}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack}>Back</Button>
              <Button onClick={load}>Try again</Button>
            </div>
          </div>
        ) : (
          <>
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-64 w-full" />
          </>
        )}
      </div>
    );
  }

  const dim = getDimension(plan.dimensionId);
  const done = plan.activities.filter(a => a.completed).length;
  const pct = Math.round((done / plan.lengthDays) * 100);
  const nextDay = plan.activities.find(a => !a.completed)?.day ?? null;
  const finished = nextDay === null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold">{dim.emoji} {dim.label}</h1>
          <p className="text-xs text-muted-foreground">
            {plan.lengthDays}-day plan · {done} of {plan.lengthDays} days done
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {/* What to do now */}
        <Card className="border-2" style={{ borderColor: dim.color }}>
          <CardContent className="p-4 space-y-3">
            {finished ? (
              <>
                <h2 className="text-lg font-bold text-foreground">🎉 Plan finished!</h2>
                <p className="text-sm text-muted-foreground">
                  You practised {dim.label.toLowerCase()} for {plan.lengthDays} days. Keep using it in class and at home.
                </p>
                <Button variant="outline" className="w-full" onClick={onBack}>Pick another skill</Button>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: dim.color }}>Today</p>
                <h2 className="text-lg font-bold text-foreground">Day {nextDay} of {plan.lengthDays}</h2>
                <p className="text-sm text-muted-foreground">
                  Play {gameTitle(plan.activities[nextDay - 1].gameId)}, write a short reflection, then try one real-life task. About 10 minutes.
                </p>
                <Progress value={pct} />
                <Button className="w-full text-white" style={{ background: PURPLE }} size="lg" onClick={() => setOpenDay(nextDay)}>
                  Start Day {nextDay}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Why this plan */}
        <Card>
          <CardContent className="p-4 space-y-2 text-sm">
            <h2 className="font-semibold text-foreground">Why this plan?</h2>
            <p className="text-foreground"><strong>{dim.label}</strong> means: {dim.plain}</p>
            {dim.helps && <p className="text-muted-foreground">{dim.helps}</p>}
            {dimScore ? (
              <p className="text-muted-foreground">
                In your Cognitive Profile this skill scores <strong className="text-foreground">{dimScore.score}/100</strong>
                {' '}({dimScore.parts.map(p => `${p.label} ${p.value}`).join(', ')}). Practising it can help raise that score.
              </p>
            ) : (
              <p className="text-muted-foreground">Complete your assessments to see how you score in this skill.</p>
            )}
            {plan.sourceCareer && (
              <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3">
                <Briefcase className="h-4 w-4 text-blue-700 mt-0.5 shrink-0" aria-hidden />
                <p className="text-blue-900 dark:text-blue-100">Also chosen for your career match: <strong>{plan.sourceCareer}</strong></p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Days */}
        <section className="space-y-2" aria-label="Days in this plan">
          {plan.activities.map(act => {
            const locked = !act.completed && nextDay !== null && act.day > nextDay;
            const isNext = act.day === nextDay;
            return (
              <Card
                key={act.day}
                className={`transition-colors ${locked ? 'opacity-60' : 'cursor-pointer hover:border-primary'}`}
                role="button"
                tabIndex={locked ? -1 : 0}
                aria-disabled={locked}
                onClick={() => !locked && setOpenDay(act.day)}
                onKeyDown={e => { if (!locked && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setOpenDay(act.day); } }}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="mt-0.5">
                    {act.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" aria-label="Done" />
                    ) : locked ? (
                      <Lock className="h-5 w-5 text-muted-foreground" aria-label="Locked" />
                    ) : (
                      <Circle className="h-5 w-5" style={{ color: PURPLE }} aria-label="Ready" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">
                      Day {act.day}{isNext && <span className="ml-2 text-xs font-medium" style={{ color: PURPLE }}>Up next</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      🎮 {gameTitle(act.gameId)} · ✍️ Reflect · 🌍 Try it
                    </p>
                    {!locked && !act.completed && (
                      <p className="text-sm text-muted-foreground mt-1">Real-life task: {challengeText(act.challengeId)}</p>
                    )}
                    {locked && <p className="text-xs text-muted-foreground mt-1">Finish Day {nextDay} first.</p>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <div className="pt-2 text-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button type="button" className="text-xs text-muted-foreground underline underline-offset-2">
                Remove this plan
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove this plan?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your progress in this {dim.label} plan will be deleted. You can start a new one any time.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction onClick={removePlan}>Remove</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </div>
  );
}
