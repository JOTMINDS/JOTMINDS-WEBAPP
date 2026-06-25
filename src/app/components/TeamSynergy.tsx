import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Users, CheckCircle2, ChevronRight, BrainCircuit, Info } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface TeamSynergyProps {
  professionals: any[]; // The processed professionals list containing scores
}

export function TeamSynergy({ professionals }: TeamSynergyProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter out users who haven't completed any assessments
  const eligibleProfessionals = professionals.filter(p => p.assessments && p.assessments.some((a: any) => a.completedAt));

  const toggleProfessional = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 5) {
        return prev; // Max 5 allowed for synergy map
      }
      return [...prev, id];
    });
  };

  const selectedTeam = professionals.filter(p => selectedIds.includes(p.id));

  // Generate Synergy Report
  const synergyReport = useMemo(() => {
    if (selectedTeam.length < 2) return null;

    let analyticalCount = 0;
    let creativeCount = 0;
    let practicalCount = 0;

    let intuitiveCount = 0;
    let reflectiveCount = 0;

    selectedTeam.forEach(member => {
      const sternbergStyle = member.sternbergData?.style;
      if (sternbergStyle === 'Analytical') analyticalCount++;
      if (sternbergStyle === 'Creative') creativeCount++;
      if (sternbergStyle === 'Practical') practicalCount++;

      const dualProcessStyle = member.dualProcessData?.style;
      if (dualProcessStyle === 'Intuitive') intuitiveCount++;
      if (dualProcessStyle === 'Reflective') reflectiveCount++;
    });

    const total = selectedTeam.length;

    let strengths = [];
    let weaknesses = [];
    let summary = "";

    if (analyticalCount > total / 2) {
      strengths.push("Strong data-driven evaluation");
      weaknesses.push("Risk of analysis paralysis; slower to move from idea to execution");
    }
    if (creativeCount > total / 2) {
      strengths.push("High innovation and out-of-the-box thinking");
      weaknesses.push("May lack focus on practical implementation details");
    }
    if (practicalCount > total / 2) {
      strengths.push("Excellent execution and operations focus");
      weaknesses.push("May miss bigger strategic shifts or highly creative solutions");
    }

    if (strengths.length === 0) {
      strengths.push("Well-balanced cognitive styles");
      weaknesses.push("No single dominant cognitive focus, which is generally good but may lack specialized deep-dives");
    }

    // Heuristic summary
    if (analyticalCount > 0 && creativeCount > 0 && practicalCount > 0) {
      summary = "This team is highly diverse cognitively. You have the necessary thinkers to generate ideas (Creative), evaluate them (Analytical), and execute them (Practical). This usually forms a highly effective 'Triarchic' group.";
    } else if (analyticalCount >= 2 && creativeCount === 0) {
      summary = "This team is heavily weighted toward Analytical thinking. They will excel at evaluating metrics, finding flaws, and optimizing processes. However, they lack Creative thinkers, meaning they might struggle to generate novel solutions when faced with entirely new problems.";
    } else if (practicalCount >= 2 && analyticalCount === 0) {
      summary = "This team focuses heavily on getting things done (Practical). They are executors. However, without Analytical thinkers, they may optimize the wrong things or rush into execution without sufficient validation.";
    } else {
      summary = "This team has a focused cognitive makeup. Be aware of the team's blind spots and consider leaning on external members for specific tasks that require differing cognitive approaches.";
    }

    return {
      analyticalCount, creativeCount, practicalCount, intuitiveCount, reflectiveCount, strengths, weaknesses, summary
    };
  }, [selectedTeam]);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Selection Column */}
      <Card className="md:col-span-1 border-indigo-100 dark:border-indigo-900/50">
        <CardHeader>
          <CardTitle className="text-lg">Select Team</CardTitle>
          <CardDescription>Select 2-5 members to analyze synergy.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {eligibleProfessionals.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No professionals have completed assessments yet.
                </div>
              )}
              {eligibleProfessionals.map((prof) => {
                const isSelected = selectedIds.includes(prof.id);
                return (
                  <button
                    key={prof.id}
                    onClick={() => toggleProfessional(prof.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 shadow-sm dark:bg-indigo-900/30 dark:border-indigo-700'
                        : 'hover:bg-accent border-transparent'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-sm">{prof.name}</p>
                      <p className="text-xs text-muted-foreground">{prof.position}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Analysis Column */}
      <div className="md:col-span-2 space-y-6">
        {selectedTeam.length < 2 ? (
          <Card className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-dashed">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Select at least 2 members</p>
            <p className="text-sm mt-1">
              Pick members from the left panel to generate a Team Synergy Report.
            </p>
          </Card>
        ) : synergyReport ? (
          <>
            <Card>
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-b">
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-indigo-600" />
                  Team Synergy Report
                </CardTitle>
                <CardDescription>
                  Analyzing {selectedTeam.length} members
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Alert className="bg-white dark:bg-gray-900 border-indigo-100 dark:border-indigo-900 mb-6">
                  <Info className="h-4 w-4 text-indigo-600" />
                  <AlertDescription className="text-indigo-900 dark:text-indigo-100 text-sm leading-relaxed font-medium">
                    {synergyReport.summary}
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-green-700 dark:text-green-400">
                      Potential Strengths
                    </h4>
                    <ul className="space-y-2">
                      {synergyReport.strengths.map((s, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-400">
                      Potential Friction Points
                    </h4>
                    <ul className="space-y-2">
                      {synergyReport.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cognitive Composition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{synergyReport.analyticalCount}</div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Analytical</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{synergyReport.creativeCount}</div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Creative</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{synergyReport.practicalCount}</div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Practical</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}
