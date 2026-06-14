import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Gamepad2, MessageSquareText, Trophy, CheckCircle2 } from 'lucide-react';
import { completePlanDay, SkillPlan } from '../utils/skillPlanApi';
import { toast } from 'sonner';
import { recordSkillPlanCompletion } from '../utils/gamification';
import { useAuth } from './AuthContext';
import { celebrateLevelUp, celebrateBadgeUnlock } from '../utils/confettiAnimations';

interface Props {
  plan: SkillPlan;
  day: number;
  onBack: () => void;
}

const PROMPT_TEXT: Record<string, string> = {
  'prompt:metacognition:0': 'What did you learn today that surprised you?',
  'prompt:metacognition:1': 'Describe a moment when you changed your mind.',
  'prompt:metacognition:2': 'How did you check that your answer was right?',
  'prompt:problem_solving:0': 'What is the hardest problem you faced today?',
  'prompt:problem_solving:1': 'List three different ways to solve the same problem.',
  'prompt:curiosity:0': 'What is one question you cannot stop thinking about?',
  'prompt:curiosity:1': 'Pick something ordinary and write 5 things you do not know about it.',
  'prompt:emotional_regulation:0': 'Name the feeling you had most today and what triggered it.',
  'prompt:emotional_regulation:1': 'Describe a moment you stayed calm when it was hard.',
};

const CHALLENGE_TEXT: Record<string, string> = {
  'challenge:metacognition:0': 'Solve one problem out loud — narrate your steps.',
  'challenge:metacognition:1': 'Re-explain something you learned to a younger person.',
  'challenge:metacognition:2': 'Pick one mistake from this week and write down what it taught you.',
  'challenge:problem_solving:0': 'Take one daily task and find a faster way to do it.',
  'challenge:problem_solving:1': 'Plan a project in 5 steps before starting.',
  'challenge:curiosity:0': 'Learn one new word and use it in conversation.',
  'challenge:curiosity:1': 'Ask three people: "What changed your mind recently?"',
  'challenge:emotional_regulation:0': 'When you feel rushed, take 3 slow breaths before acting.',
  'challenge:emotional_regulation:1': 'Write a kind message to someone — including yourself.',
};

const GAME_LABEL: Record<string, string> = {
  'memory-match': 'Memory Match',
  'n-back': 'N-Back',
  'stroop': 'Stroop',
  'pattern': 'Pattern',
};

export function SkillBuilderDay({ plan, day, onBack }: Props) {
  const { user } = useAuth();
  const activity = plan.activities.find(a => a.day === day);
  const [gameDone, setGameDone] = useState(activity?.completed ?? false);
  const [reflection, setReflection] = useState('');
  const [challengeDone, setChallengeDone] = useState(activity?.completed ?? false);
  const [saving, setSaving] = useState(false);

  if (!activity) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        <p className="mt-4 text-destructive">Day not found.</p>
      </div>
    );
  }

  const allDone = gameDone && reflection.trim().length > 0 && challengeDone;

  const finish = async () => {
    if (!allDone) return;
    setSaving(true);
    try {
      await completePlanDay(plan.planId, day);
      toast.success(`Day ${day} complete!`);

      // Check if this was the last day - if so, award XP for completing the plan
      const isLastDay = day === plan.lengthDays;
      const wasAllDone = plan.activities.filter(a => a.completed).length === plan.lengthDays - 1; // All except this one

      if (user && isLastDay && wasAllDone) {
        const reward = recordSkillPlanCompletion(user.id);
        if (reward) {
          toast.success(reward.message, {
            description: `+${reward.xpEarned} XP earned`,
            duration: 4000,
          });
          if (reward.leveledUp) {
            celebrateLevelUp();
            toast.success(`🎉 Level Up! You're now ${reward.levelTitle}`, {
              duration: 5000,
            });
          }
          reward.newBadges.forEach(badge => {
            celebrateBadgeUnlock(badge.rarity);
            toast.success(`🏆 Badge Unlocked: ${badge.name}`, {
              description: badge.description,
              duration: 5000,
            });
          });
        }
      }

      onBack();
    } catch (e: any) {
      toast.error(e.message || 'Could not save progress');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold">Day {day}</h1>
          <p className="text-xs text-muted-foreground capitalize">
            {plan.dimensionId.replace(/_/g, ' ')}
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4 pb-32">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" /> 1. Play
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              Today's game: <strong>{GAME_LABEL[activity.gameId] ?? activity.gameId}</strong>
            </p>
            <Button
              variant={gameDone ? 'secondary' : 'default'}
              onClick={() => setGameDone(true)}
              className="w-full"
            >
              {gameDone ? <><CheckCircle2 className="h-4 w-4 mr-2" /> Played</> : 'Mark as played'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareText className="h-5 w-5" /> 2. Reflect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              {PROMPT_TEXT[activity.promptId] ?? 'Reflect on your day.'}
            </p>
            <Textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="A sentence or two is enough…"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{reflection.length}/500</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" /> 3. Try it in the wild
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              {CHALLENGE_TEXT[activity.challengeId] ?? 'Apply today’s skill.'}
            </p>
            <Button
              variant={challengeDone ? 'secondary' : 'default'}
              onClick={() => setChallengeDone(true)}
              className="w-full"
            >
              {challengeDone ? <><CheckCircle2 className="h-4 w-4 mr-2" /> I did it</> : 'Mark as done'}
            </Button>
          </CardContent>
        </Card>
      </main>

      <div className="fixed bottom-0 inset-x-0 border-t bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Button onClick={finish} disabled={!allDone || saving} className="w-full" size="lg">
            {saving ? 'Saving…' : `Complete day ${day}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
