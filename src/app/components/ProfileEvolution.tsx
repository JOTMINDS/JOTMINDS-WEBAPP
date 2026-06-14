import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Calendar, Target, Sparkles } from 'lucide-react';
import { getProfileEvolution, getProfileHistory, ProfileEvolution as Evolution, CognitiveProfile } from '../utils/cognitiveProfileApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { formatDate } from '../utils/dateFormat';
import { recordProfileEvolutionView } from '../utils/gamification';
import { useAuth } from './AuthContext';
import { celebrateLevelUp, celebrateBadgeUnlock } from '../utils/confettiAnimations';

interface Props {
  onBack: () => void;
}

export function ProfileEvolution({ onBack }: Props) {
  const { user } = useAuth();
  const [evolution, setEvolution] = useState<Evolution | null>(null);
  const [history, setHistory] = useState<CognitiveProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvolutionData();
  }, []);

  const loadEvolutionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [evolutionData, historyData] = await Promise.all([
        getProfileEvolution(),
        getProfileHistory()
      ]);

      setEvolution(evolutionData);
      setHistory(historyData.history || []);

      // Award XP for viewing profile evolution (first time only)
      if (user && evolutionData) {
        const reward = recordProfileEvolutionView(user.id);
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
    } catch (e: any) {
      setError(e.message || 'Failed to load evolution data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !evolution) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Track Your Progress</CardTitle>
              <CardDescription>
                Complete assessments multiple times to see how your cognitive profile evolves
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Calendar className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      No Progress Data Yet
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Complete your assessments again after some time to track your cognitive growth and see improvements!
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Prepare trend data for charts
  const trendData = history.map((snapshot, index) => ({
    snapshot: `#${index + 1}`,
    date: formatDate(snapshot.generatedAt || snapshot.snapshotAt || ''),
    learningAgility: snapshot.learningAgility || 0,
    analyticalDepth: snapshot.analyticalDepth || 0,
    creativeCapacity: snapshot.creativeCapacity || 0,
    practicalExecution: snapshot.practicalExecution || 0,
    intuitiveSpeed: snapshot.intuitiveSpeed || 0,
    reflectiveDepth: snapshot.reflectiveDepth || 0,
  }));

  const formatDimensionName = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Profile Evolution</h1>
            <p className="text-xs text-muted-foreground">
              Track your cognitive growth over time
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {evolution.snapshotCount} Snapshots
          </Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Overall Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {evolution.overallGrowth > 0 ? '+' : ''}{evolution.overallGrowth}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Average change across all dimensions</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Calendar className="h-5 w-5 text-blue-600" />
                Time Span
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{evolution.timeSpan.days}</div>
              <p className="text-sm text-muted-foreground mt-1">Days of tracking</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Archetype Change
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <div className="font-semibold text-purple-900">
                  {evolution.firstSnapshot.archetype}
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="font-semibold text-purple-600">
                  {evolution.latestSnapshot.archetype}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dimension Changes */}
        <Card>
          <CardHeader>
            <CardTitle>Dimension Changes</CardTitle>
            <CardDescription>
              How each cognitive dimension has evolved from your first to latest assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(evolution.dimensionChanges).map(([dimension, change]) => (
                <div key={dimension} className="flex items-center gap-3">
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm font-medium">{formatDimensionName(dimension)}</span>
                    <div className="flex items-center gap-2">
                      {getChangeIcon(change)}
                      <span className={`font-bold ${getChangeColor(change)}`}>
                        {change > 0 ? '+' : ''}{change}
                      </span>
                    </div>
                  </div>
                  <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        change > 0 ? 'bg-green-500' : change < 0 ? 'bg-red-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${Math.min(Math.abs(change), 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Improvements */}
        {evolution.improvements.length > 0 && (
          <Card className="border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Target className="h-5 w-5 text-green-600" />
                Top Improvements
              </CardTitle>
              <CardDescription>Areas where you've grown the most</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {evolution.improvements.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                    <span className="font-medium text-green-900">{formatDimensionName(item.dimension)}</span>
                    <Badge className="bg-green-600 text-white">+{item.change}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Growth Trend</CardTitle>
            <CardDescription>
              Your cognitive dimensions over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid key="grid-trend" strokeDasharray="3 3" />
                  <XAxis key="x-axis-trend" dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis key="y-axis-trend" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    key="tooltip-trend"
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      maxWidth: '280px',
                      padding: '12px'
                    }}
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                  <Legend key="legend-trend" />
                  <Line key="line-learning" type="monotone" dataKey="learningAgility" stroke="#3b82f6" strokeWidth={2} name="Learning Agility" />
                  <Line key="line-analytical" type="monotone" dataKey="analyticalDepth" stroke="#8b5cf6" strokeWidth={2} name="Analytical" />
                  <Line key="line-creative" type="monotone" dataKey="creativeCapacity" stroke="#ec4899" strokeWidth={2} name="Creative" />
                  <Line key="line-practical" type="monotone" dataKey="practicalExecution" stroke="#10b981" strokeWidth={2} name="Practical" />
                  <Line key="line-intuitive" type="monotone" dataKey="intuitiveSpeed" stroke="#f59e0b" strokeWidth={2} name="Intuitive" />
                  <Line key="line-reflective" type="monotone" dataKey="reflectiveDepth" stroke="#06b6d4" strokeWidth={2} name="Reflective" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
