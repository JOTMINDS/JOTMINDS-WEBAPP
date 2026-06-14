import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import { ArrowLeft, Plus, Sparkles, Target } from 'lucide-react';
import { listSkillPlans, generateSkillPlan, SkillPlan } from '../utils/skillPlanApi';
import { SkillBuilderPlan } from './SkillBuilderPlan';

interface Props {
  onBack: () => void;
}

const DIMENSION_LABELS: Record<string, string> = {
  metacognition: 'Metacognition',
  problem_solving: 'Problem Solving',
  curiosity: 'Curiosity',
  emotional_regulation: 'Emotional Regulation',
};

function progressPct(plan: SkillPlan) {
  const done = plan.activities.filter(a => a.completed).length;
  return Math.round((done / plan.lengthDays) * 100);
}

export function SkillBuilder({ onBack }: Props) {
  const [plans, setPlans] = useState<SkillPlan[] | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const result = await listSkillPlans();
      setPlans(result);
    } catch (e: any) {
      setError(e.message || 'Failed to load plans');
      setPlans([]);
    }
  };

  useEffect(() => { load(); }, []);

  const createDefaultPlan = async () => {
    setCreating(true);
    try {
      await generateSkillPlan({
        dimensionId: 'metacognition',
        tier: 'adult',
        lengthDays: 7,
        sourceResultId: '',
      });
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to create plan');
    } finally {
      setCreating(false);
    }
  };

  if (selectedPlanId) {
    return (
      <SkillBuilderPlan
        planId={selectedPlanId}
        onBack={() => { setSelectedPlanId(null); load(); }}
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
          <p className="text-xs text-muted-foreground">Grow the skills you scored lowest on</p>
        </div>
        <Sparkles className="h-5 w-5 text-primary" />
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        {plans === null && (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        )}

        {plans && plans.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" /> No active plans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A Skill Builder plan is a 7-day micro-curriculum: one game, one reflection, and one
                challenge per day, tuned to a dimension you want to grow.
              </p>
              <Button onClick={createDefaultPlan} disabled={creating} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {creating ? 'Creating…' : 'Start a 7-day Metacognition plan'}
              </Button>
            </CardContent>
          </Card>
        )}

        {plans && plans.map(plan => (
          <Card
            key={plan.planId}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => setSelectedPlanId(plan.planId)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>{DIMENSION_LABELS[plan.dimensionId] ?? plan.dimensionId}</CardTitle>
                <Badge variant={plan.status === 'completed' ? 'secondary' : 'default'}>
                  {plan.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Day {plan.currentDay} of {plan.lengthDays}</span>
                <span className="text-muted-foreground">{progressPct(plan)}%</span>
              </div>
              <Progress value={progressPct(plan)} />
            </CardContent>
          </Card>
        ))}

        {plans && plans.length > 0 && (
          <Button variant="outline" onClick={createDefaultPlan} disabled={creating} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {creating ? 'Creating…' : 'Add another plan'}
          </Button>
        )}
      </main>
    </div>
  );
}
