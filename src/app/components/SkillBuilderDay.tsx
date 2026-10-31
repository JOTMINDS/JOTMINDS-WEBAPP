import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ArrowLeft, CheckCircle2, Gamepad2, MessageSquareText, Globe2 } from 'lucide-react';
import { completePlanDay, SkillPlan } from '../utils/skillPlanApi';
import { toast } from 'sonner';
import { recordSkillPlanCompletion } from '../utils/gamification';
import { useAuth } from './AuthContext';
import { celebrateLevelUp, celebrateBadgeUnlock } from '../utils/confettiAnimations';
import { BrainGame, GameResult } from './BrainGames';
import { GAME_META } from '../data/dailyQuestData';
import { challengeText, getDimension, playableGame, promptText } from '../data/skillBuilderContent';

interface Props {
  plan: SkillPlan;
  day: number;
  onBack: () => void;
}

const PURPLE = '#6B4C9A';

interface Draft {
  reflection: string;
  challengeDone: boolean;
  gameSummary: string | null;
}

function hashSeed(text: string, day: number): number {
  let h = 7;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return (h + day * 101) % 1_000_000;
}

function draftKey(planId: string, day: number) {
  return `skillbuilder-draft:${planId}:${day}`;
}

function readDraft(planId: string, day: number): Draft {
  try {
    const raw = localStorage.getItem(draftKey(planId, day));
    if (raw) return { reflection: '', challengeDone: false, gameSummary: null, ...JSON.parse(raw) };
  } catch { /* storage can be blocked */ }
  return { reflection: '', challengeDone: false, gameSummary: null };
}

export function SkillBuilderDay({ plan, day, onBack }: Props) {
  const { user } = useAuth();
  const activity = plan.activities.find(a => a.day === day);
  const dim = getDimension(plan.dimensionId);
  const initial = readDraft(plan.planId, day);
  const [gameSummary, setGameSummary] = useState<string | null>(initial.gameSummary);
  const [playing, setPlaying] = useState(false);
  const [reflection, setReflection] = useState(initial.reflection);
  const [challengeDone, setChallengeDone] = useState(initial.challengeDone);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(draftKey(plan.planId, day), JSON.stringify({ reflection, challengeDone, gameSummary }));
    } catch { /* ignore */ }
  }, [plan.planId, day, reflection, challengeDone, gameSummary]);

  if (!activity) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        <p className="mt-4 text-destructive">We could not find this day.</p>
      </div>
    );
  }

  const gameId = playableGame(activity.gameId) ?? 'pattern';
  const meta = GAME_META[gameId];
  const alreadyDone = activity.completed;
  const stepsDone = [gameSummary !== null, reflection.trim().length > 0, challengeDone].filter(Boolean).length;
  const allDone = stepsDone === 3;

  const finish = async () => {
    if (!allDone) return;
    setSaving(true);
    try {
      const updated = await completePlanDay(plan.planId, day);
      try { localStorage.removeItem(draftKey(plan.planId, day)); } catch { /* ignore */ }
      toast.success(`Day ${day} complete! 🎉`);

      if (user && updated.status === 'completed' && plan.status !== 'completed') {
        const reward = recordSkillPlanCompletion(user.id);
        if (reward) {
          toast.success(reward.message, { description: `+${reward.xpEarned} XP earned`, duration: 4000 });
          if (reward.leveledUp) {
            celebrateLevelUp();
            toast.success(`🎉 Level Up! You're now ${reward.levelTitle}`, { duration: 5000 });
          }
          reward.newBadges.forEach(badge => {
            celebrateBadgeUnlock(badge.rarity);
            toast.success(`🏆 Badge Unlocked: ${badge.name}`, { description: badge.description, duration: 5000 });
          });
        }
      }
      onBack();
    } catch (e: any) {
      toast.error(e.message || 'We could not save your progress. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const onGameFinish = (r: GameResult) => {
    setGameSummary(r.summary);
    setPlaying(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold">Day {day} of {plan.lengthDays}</h1>
          <p className="text-xs text-muted-foreground">{dim.emoji} {dim.label}</p>
        </div>
        {!alreadyDone && <span className="text-xs text-muted-foreground">{stepsDone} of 3 steps</span>}
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4 pb-32">
        {alreadyDone ? (
          <Card className="border-2 border-green-600">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" aria-hidden />
              <div>
                <p className="font-semibold text-foreground">You finished this day.</p>
                <p className="text-sm text-muted-foreground">Here is what you did. Nice work!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">
            Today's skill: <strong className="text-foreground">{dim.label}</strong>. {dim.plain} Do the 3 steps below, then tap Complete.
          </p>
        )}

        {/* Step 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gamepad2 className="h-5 w-5" aria-hidden /> 1. Play
              {gameSummary !== null && <CheckCircle2 className="h-4 w-4 text-green-600" aria-label="Done" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {playing ? (
              <>
                <button type="button" className="text-sm text-muted-foreground" onClick={() => setPlaying(false)}>← Leave game</button>
                <BrainGame
                  gameId={gameId}
                  seed={hashSeed(plan.planId, day)}
                  onFinish={onGameFinish}
                  onSkip={() => { setGameSummary('Skipped the game'); setPlaying(false); }}
                />
              </>
            ) : (
              <>
                <p className="text-sm">
                  {meta.emoji} <strong>{meta.title}</strong>: {meta.tagline}
                </p>
                <p className="text-xs text-muted-foreground">Trains: {meta.skill}</p>
                {gameSummary !== null && (
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">✓ {gameSummary}</p>
                )}
                {!alreadyDone && (
                  <Button
                    variant={gameSummary !== null ? 'outline' : 'default'}
                    className={gameSummary !== null ? 'w-full' : 'w-full text-white'}
                    style={gameSummary !== null ? undefined : { background: PURPLE }}
                    onClick={() => setPlaying(true)}
                  >
                    {gameSummary !== null ? 'Play again' : `Play ${meta.title}`}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Step 2 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquareText className="h-5 w-5" aria-hidden /> 2. Reflect
              {reflection.trim().length > 0 && <CheckCircle2 className="h-4 w-4 text-green-600" aria-label="Done" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{promptText(activity.promptId)}</p>
            {alreadyDone ? (
              <p className="text-sm text-muted-foreground">Reflections are private and are not stored after you finish a day.</p>
            ) : (
              <>
                <label htmlFor="sb-reflection" className="sr-only">Your reflection</label>
                <Textarea
                  id="sb-reflection"
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  placeholder="One or two sentences is enough…"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">{reflection.length}/500</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Step 3 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe2 className="h-5 w-5" aria-hidden /> 3. Try it in real life
              {challengeDone && <CheckCircle2 className="h-4 w-4 text-green-600" aria-label="Done" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{challengeText(activity.challengeId)}</p>
            {!alreadyDone && (
              <>
                <p className="text-xs text-muted-foreground">
                  Not able to do it right now? Close this page and come back. Your answers are kept on this device.
                </p>
                <Button
                  variant={challengeDone ? 'outline' : 'default'}
                  className={challengeDone ? 'w-full' : 'w-full text-white'}
                  style={challengeDone ? undefined : { background: PURPLE }}
                  onClick={() => setChallengeDone(!challengeDone)}
                  aria-pressed={challengeDone}
                >
                  {challengeDone ? <><CheckCircle2 className="h-4 w-4 mr-2" /> I did it</> : 'I did it'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <div className="fixed bottom-0 inset-x-0 border-t bg-background p-4">
        <div className="max-w-2xl mx-auto">
          {alreadyDone ? (
            <Button onClick={onBack} variant="outline" className="w-full" size="lg">Back to the plan</Button>
          ) : (
            <Button
              onClick={finish}
              disabled={!allDone || saving}
              className="w-full text-white disabled:opacity-60"
              style={{ background: PURPLE }}
              size="lg"
            >
              {saving ? 'Saving…' : allDone ? `Complete Day ${day}` : `Finish all 3 steps (${stepsDone}/3)`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
