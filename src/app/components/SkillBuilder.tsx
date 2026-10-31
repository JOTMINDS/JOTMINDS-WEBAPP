import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import { ArrowLeft, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { listSkillPlans, generateSkillPlan, SkillPlan } from '../utils/skillPlanApi';
import { getCognitiveProfile, CognitiveProfile } from '../utils/cognitiveProfileApi';
import { SkillBuilderPlan } from './SkillBuilderPlan';
import { useAuth } from './AuthContext';
import { DIMENSIONS, getDimension, gameTitle, scoreDimensions, tierForAge } from '../data/skillBuilderContent';

interface Props {
  onBack: () => void;
}

const PURPLE = '#6B4C9A';

function doneCount(plan: SkillPlan) {
  return plan.activities.filter(a => a.completed).length;
}

function nextDayOf(plan: SkillPlan) {
  return plan.activities.find(a => !a.completed)?.day ?? null;
}

export function SkillBuilder({ onBack }: Props) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SkillPlan[] | null>(null);
  const [profile, setProfile] = useState<CognitiveProfile | null>(null);
  const [selected, setSelected] = useState<{ planId: string; day?: number } | null>(null);
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHow, setShowHow] = useState<boolean | null>(null);

  const load = async () => {
    setError(null);
    const [plansResult, profileResult] = await Promise.allSettled([listSkillPlans(), getCognitiveProfile()]);
    if (plansResult.status === 'fulfilled') {
      setPlans(plansResult.value);
    } else {
      setError(plansResult.reason?.message || 'We could not load your plans.');
      setPlans([]);
    }
    setProfile(profileResult.status === 'fulfilled' ? profileResult.value : null);
  };

  useEffect(() => { load(); }, []);

  const scores = useMemo(() => scoreDimensions(profile), [profile]);
  const bestFit = scores[0]?.id ?? null;
  // Lowest-scoring skill first, so the best fit is the first thing a student sees.
  const orderedDimensions = useMemo(() => {
    const rank = (id: string) => { const i = scores.findIndex(s => s.id === id); return i === -1 ? 99 : i; };
    return [...DIMENSIONS].sort((a, b) => rank(a.id) - rank(b.id));
  }, [scores]);

  const activePlans = (plans ?? []).filter(p => p.status === 'active');
  const finishedPlans = (plans ?? []).filter(p => p.status !== 'active');
  const activeByDimension = new Map(activePlans.map(p => [p.dimensionId, p]));
  const todayPlan = activePlans.find(p => nextDayOf(p) !== null) ?? null;
  const how = showHow ?? (plans !== null && plans.length === 0);

  const startPlan = async (dimensionId: string) => {
    setCreating(dimensionId);
    setError(null);
    try {
      const plan = await generateSkillPlan({
        dimensionId,
        tier: tierForAge(user?.age),
        lengthDays: 7,
        sourceResultId: profile?.sourceResults?.kolb ?? profile?.sourceResults?.sternberg ?? profile?.sourceResults?.dualProcess ?? '',
      });
      await load();
      setSelected({ planId: plan.planId });
    } catch (e: any) {
      setError(e.message || 'We could not start the plan. Please try again.');
    } finally {
      setCreating(null);
    }
  };

  if (selected) {
    return (
      <SkillBuilderPlan
        planId={selected.planId}
        initialDay={selected.day}
        onBack={() => { setSelected(null); load(); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold">Skill Builder</h1>
          <p className="text-xs text-muted-foreground">7 days. 10 minutes a day. One skill.</p>
        </div>
        <Sparkles className="h-5 w-5" style={{ color: PURPLE }} aria-hidden />
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-5">
        {error && (
          <Card className="border-destructive" role="alert">
            <CardContent className="p-4 text-sm text-destructive flex items-center justify-between gap-3">
              <span>{error}</span>
              <Button size="sm" variant="outline" onClick={load}>Try again</Button>
            </CardContent>
          </Card>
        )}

        {/* What it is */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-between text-left"
              onClick={() => setShowHow(!how)}
              aria-expanded={how}
            >
              <span className="font-semibold text-foreground">What is Skill Builder?</span>
              {how ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
            </button>
            {how && (
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Pick one thinking skill and practise it for 7 days. Your Cognitive Profile shows which skills have the most room to grow.
                  Each day has three small steps:
                </p>
                <ol className="space-y-2">
                  <li className="flex gap-3"><span aria-hidden>🎮</span><span><strong>Play</strong> a 1–2 minute brain game.</span></li>
                  <li className="flex gap-3"><span aria-hidden>✍️</span><span><strong>Reflect</strong> by writing one or two sentences.</span></li>
                  <li className="flex gap-3"><span aria-hidden>🌍</span><span><strong>Try it</strong> in real life with one small task.</span></li>
                </ol>
                <p className="text-muted-foreground">Finish all 7 days to earn XP and a badge.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {plans === null && (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </>
        )}

        {/* What to do today */}
        {todayPlan && (() => {
          const day = nextDayOf(todayPlan)!;
          const act = todayPlan.activities.find(a => a.day === day)!;
          const dim = getDimension(todayPlan.dimensionId);
          return (
            <Card className="border-2" style={{ borderColor: dim.color }}>
              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: dim.color }}>Your next step</p>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {dim.emoji} {dim.label}: Day {day} of {todayPlan.lengthDays}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Play {gameTitle(act.gameId)}, write a short reflection, then try one real-life task. About 10 minutes.
                  </p>
                </div>
                <Button
                  className="w-full text-white"
                  style={{ background: PURPLE }}
                  size="lg"
                  onClick={() => setSelected({ planId: todayPlan.planId, day })}
                >
                  Start Day {day}
                </Button>
              </CardContent>
            </Card>
          );
        })()}

        {/* Your plans */}
        {plans && plans.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-semibold text-foreground">Your plans</h2>
            {[...activePlans, ...finishedPlans].map(plan => {
              const dim = getDimension(plan.dimensionId);
              const done = doneCount(plan);
              const pct = Math.round((done / plan.lengthDays) * 100);
              const finished = plan.status === 'completed';
              return (
                <Card
                  key={plan.planId}
                  className="cursor-pointer hover:border-primary transition-colors"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected({ planId: plan.planId })}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected({ planId: plan.planId }); } }}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-foreground">{dim.emoji} {dim.label}</p>
                      <span className={`text-xs rounded-full px-2 py-0.5 ${finished ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' : 'bg-muted text-muted-foreground'}`}>
                        {finished ? 'Finished 🎉' : 'In progress'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{finished ? `All ${plan.lengthDays} days done` : `${done} of ${plan.lengthDays} days done`}</span>
                      <span>{pct}%</span>
                    </div>
                    <Progress value={pct} />
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )}

        {/* Pick a skill */}
        {plans && (
          <section className="space-y-3">
            <div>
              <h2 className="font-semibold text-foreground">
                {plans.length === 0 ? 'Pick a skill to start' : 'Grow another skill'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {scores.length > 0
                  ? 'Scores come from your Cognitive Profile (0 to 100). A lower score means more room to grow.'
                  : 'Complete your assessments to see which skill fits you best. You can still pick one now.'}
              </p>
            </div>
            {orderedDimensions.map(dim => {
              const score = scores.find(s => s.id === dim.id);
              const active = activeByDimension.get(dim.id);
              const isBest = bestFit === dim.id;
              return (
                <Card key={dim.id} className={isBest ? 'border-2' : ''} style={isBest ? { borderColor: dim.color } : undefined}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">{dim.emoji} {dim.label}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{dim.plain}</p>
                      </div>
                      {isBest && (
                        <span className="shrink-0 text-xs font-semibold rounded-full px-2 py-0.5 text-white" style={{ background: dim.color }}>
                          Best fit
                        </span>
                      )}
                    </div>
                    {score && (
                      <p className="text-xs text-muted-foreground">
                        Your profile: <strong className="text-foreground">{score.score}/100</strong>
                        {' '}({score.parts.map(p => `${p.label} ${p.value}`).join(', ')})
                        {isBest && ' · Your lowest area right now.'}
                      </p>
                    )}
                    {active ? (
                      <Button variant="outline" className="w-full" onClick={() => setSelected({ planId: active.planId })}>
                        Plan in progress. Open it
                      </Button>
                    ) : (
                      <Button
                        className="w-full text-white"
                        style={{ background: dim.color }}
                        disabled={creating !== null}
                        onClick={() => startPlan(dim.id)}
                      >
                        {creating === dim.id ? 'Starting…' : 'Start 7-day plan'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
