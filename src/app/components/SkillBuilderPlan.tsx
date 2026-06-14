import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { ArrowLeft, CheckCircle2, Circle, Lock, Briefcase } from 'lucide-react';
import { getSkillPlan, SkillPlan } from '../utils/skillPlanApi';
import { SkillBuilderDay } from './SkillBuilderDay';

interface Props {
  planId: string;
  onBack: () => void;
}

export function SkillBuilderPlan({ planId, onBack }: Props) {
  const [plan, setPlan] = useState<SkillPlan | null>(null);
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setPlan(await getSkillPlan(planId));
    } catch (e: any) {
      setError(e.message || 'Failed to load plan');
    }
  };

  useEffect(() => { load(); }, [planId]);

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
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const done = plan.activities.filter(a => a.completed).length;
  const pct = Math.round((done / plan.lengthDays) * 100);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold capitalize">
            {plan.dimensionId.replace(/_/g, ' ')}
          </h1>
          <p className="text-xs text-muted-foreground">
            {plan.lengthDays}-day plan · {done}/{plan.lengthDays} complete
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {plan.sourceCareer && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
            <Briefcase className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                Created from Career Match
              </p>
              <p className="text-blue-800 dark:text-blue-200">
                {plan.sourceCareer}
              </p>
            </div>
          </div>
        )}

        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="text-muted-foreground">{pct}%</span>
            </div>
            <Progress value={pct} />
          </CardContent>
        </Card>

        <div className="space-y-2">
          {plan.activities.map(act => {
            const isLocked = act.day > plan.currentDay && !act.completed;
            return (
              <Card
                key={act.day}
                className={`transition-colors ${
                  isLocked ? 'opacity-60' : 'cursor-pointer hover:border-primary'
                }`}
                onClick={() => !isLocked && setOpenDay(act.day)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {act.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : isLocked ? (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      Day {act.day}
                    </CardTitle>
                    {act.completed && (
                      <Badge variant="secondary">Done</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Game · Reflection · Challenge
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
