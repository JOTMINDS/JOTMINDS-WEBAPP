import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { AlertCircle, CheckCircle, HelpCircle, Database, Layers } from 'lucide-react';
import { teachingStyleQuestions } from '../utils/teachingStyleQuestions';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from 'recharts';

export function QuestionBankAudit() {
  const analytics = useMemo(() => {
    // 1. Total Count & Max ID
    const totalQuestions = teachingStyleQuestions.length;
    const maxId = Math.max(...teachingStyleQuestions.map(q => q.id));
    
    // 2. Gap Analysis
    // We expect IDs 1 to maxId to be present.
    const allIds = new Set(teachingStyleQuestions.map(q => q.id));
    const missingIds = [];
    for (let i = 1; i <= maxId; i++) {
        if (!allIds.has(i)) {
            missingIds.push(i);
        }
    }

    // 3. Section Analysis
    const sectionCounts: Record<string, number> = {};
    teachingStyleQuestions.forEach(q => {
        sectionCounts[q.section] = (sectionCounts[q.section] || 0) + 1;
    });

    // 4. Dimension Analysis
    const dimensionCounts: Record<string, number> = {};
    teachingStyleQuestions.forEach(q => {
        dimensionCounts[q.dimension] = (dimensionCounts[q.dimension] || 0) + 1;
    });

    return {
        totalQuestions,
        maxId,
        missingIds,
        sectionCounts: Object.entries(sectionCounts).map(([name, count]) => ({ name, count })),
        dimensionCounts: Object.entries(dimensionCounts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count)
    };
  }, []);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="space-y-6">
        {/* Top Summary */}
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalQuestions}</div>
                    <p className="text-xs text-muted-foreground">Highest ID: {analytics.maxId}</p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Integrity Check</CardTitle>
                    {analytics.missingIds.length > 0 ? (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {analytics.missingIds.length > 0 ? `${analytics.missingIds.length} Missing` : "Complete"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {analytics.missingIds.length > 0 
                            ? `Gap detected: IDs ${analytics.missingIds[0]} - ${analytics.missingIds[analytics.missingIds.length - 1]}`
                            : "Sequence is continuous"}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Sections</CardTitle>
                    <Layers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analytics.sectionCounts.length}</div>
                    <p className="text-xs text-muted-foreground">Sections A - N</p>
                </CardContent>
            </Card>
        </div>

        {/* Visualizer */}
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>ID Sequence Map</CardTitle>
                    <CardDescription>Visual representation of the question database gaps.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-1">
                        {Array.from({ length: analytics.maxId }, (_, i) => i + 1).map(id => {
                            const exists = !analytics.missingIds.includes(id);
                            const q = teachingStyleQuestions.find(q => q.id === id);
                            
                            return (
                                <div 
                                    key={id}
                                    className={`w-3 h-3 rounded-[1px] ${exists ? 'bg-primary/80' : 'bg-red-200'} `}
                                    title={exists ? `ID: ${id} (Sec ${q?.section})` : `ID: ${id} MISSING`}
                                />
                            );
                        })}
                    </div>
                    <div className="flex gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-primary/80 rounded-[1px]" />
                            <span>Active Question</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-200 rounded-[1px]" />
                            <span>Missing ID</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Dimension Balance</CardTitle>
                    <CardDescription>Distribution of questions across cognitive axes.</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.dimensionCounts} layout="vertical" margin={{ left: 20 }}>
                            <XAxis key="x-axis" type="number" hide />
                            <YAxis key="y-axis" dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                            <RechartsTooltip
                                key="tooltip"
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ borderRadius: '8px' }}
                            />
                            <Bar key="bar" dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                {analytics.dimensionCounts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
