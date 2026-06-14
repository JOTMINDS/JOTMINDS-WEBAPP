import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Zap,
  CheckCircle2,
  Circle,
  BarChart3,
  Brain,
  Lightbulb,
  Gauge,
} from 'lucide-react';
import {
  getImprovementMetrics,
  getCognitiveSkills,
  getDevelopmentMilestones,
  getProgressSnapshots,
  type CognitiveSkill,
  type DevelopmentMilestone,
  type ImprovementMetrics,
} from '../utils/profileImprovement';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { formatDate } from '../utils/dateFormat';

interface Props {
  userId: string;
  onBack: () => void;
}

export function ProfileImprovementTracker({ userId, onBack }: Props) {
  const [metrics, setMetrics] = useState<ImprovementMetrics | null>(null);
  const [skills, setSkills] = useState<CognitiveSkill[]>([]);
  const [milestones, setMilestones] = useState<DevelopmentMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    setLoading(true);
    try {
      const metricsData = getImprovementMetrics(userId);
      const skillsData = getCognitiveSkills(userId);
      const milestonesData = getDevelopmentMilestones(userId);

      setMetrics(metricsData);
      setSkills(skillsData);
      setMilestones(milestonesData);
    } catch (error) {
      console.error('Error loading improvement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const snapshots = getProgressSnapshots(userId);

  // Prepare chart data
  const progressData = snapshots.map((snapshot, index) => ({
    name: `#${index + 1}`,
    date: formatDate(snapshot.timestamp),
    'Learning Agility': snapshot.cognitiveScores.learningAgility,
    'Analytical Depth': snapshot.cognitiveScores.analyticalDepth,
    'Creative Capacity': snapshot.cognitiveScores.creativeCapacity,
    'Practical Execution': snapshot.cognitiveScores.practicalExecution,
    'Intuitive Speed': snapshot.cognitiveScores.intuitiveSpeed,
    'Reflective Depth': snapshot.cognitiveScores.reflectiveDepth,
  }));

  // Radar chart data (latest snapshot)
  const latestSnapshot = snapshots[snapshots.length - 1];
  const radarData = latestSnapshot ? [
    { dimension: 'Learning', value: latestSnapshot.cognitiveScores.learningAgility },
    { dimension: 'Analytical', value: latestSnapshot.cognitiveScores.analyticalDepth },
    { dimension: 'Creative', value: latestSnapshot.cognitiveScores.creativeCapacity },
    { dimension: 'Practical', value: latestSnapshot.cognitiveScores.practicalExecution },
    { dimension: 'Intuitive', value: latestSnapshot.cognitiveScores.intuitiveSpeed },
    { dimension: 'Reflective', value: latestSnapshot.cognitiveScores.reflectiveDepth },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-96 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const achievedMilestones = milestones.filter(m => m.achieved);
  const pendingMilestones = milestones.filter(m => !m.achieved);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Profile Improvement Tracker</h1>
            <p className="text-xs text-muted-foreground">
              Track your cognitive growth and skill development
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Metrics Overview */}
        {metrics && (
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
                  {metrics.overallGrowth > 0 ? '+' : ''}{metrics.overallGrowth}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Points since first assessment</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {metrics.weeklyProgress > 0 ? '+' : ''}{metrics.weeklyProgress}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Points this week</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Monthly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {metrics.monthlyProgress > 0 ? '+' : ''}{metrics.monthlyProgress}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Points this month</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Graphs */}
        {progressData.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cognitive Growth Over Time</CardTitle>
                <CardDescription>Track your progress across all dimensions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="Learning Agility" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="Analytical Depth" stroke="#8b5cf6" strokeWidth={2} />
                      <Line type="monotone" dataKey="Creative Capacity" stroke="#ec4899" strokeWidth={2} />
                      <Line type="monotone" dataKey="Practical Execution" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="Intuitive Speed" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey="Reflective Depth" stroke="#06b6d4" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Current Cognitive Profile</CardTitle>
                <CardDescription>Your latest cognitive dimensions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name="Score" dataKey="value" stroke="#5B7DB1" fill="#6B4C9A" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Skills Progression */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Skill Progression
            </CardTitle>
            <CardDescription>Your developing cognitive skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {skills.map(skill => (
              <div key={skill.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{skill.name}</span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {skill.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{skill.currentLevel}/100</span>
                    <span className="text-xs text-muted-foreground">
                      {skill.xp} XP
                    </span>
                  </div>
                </div>
                <Progress value={skill.currentLevel} className="h-2" />

                {/* Milestones for this skill */}
                <div className="flex items-center gap-2 mt-2">
                  {skill.milestones.map(milestone => (
                    <div
                      key={milestone.id}
                      className={`flex items-center gap-1 text-xs ${
                        milestone.achieved ? 'text-green-600' : 'text-gray-400'
                      }`}
                      title={milestone.description}
                    >
                      {milestone.achieved ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Circle className="h-3 w-3" />
                      )}
                      <span>{milestone.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Improving Skills */}
        {metrics && metrics.topImprovingSkills.length > 0 && (
          <Card className="border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Top Improving Skills
              </CardTitle>
              <CardDescription>Skills showing the most growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.topImprovingSkills.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                    <span className="font-medium text-green-900">{item.skill}</span>
                    <Badge className="bg-green-600 text-white">Level {item.improvement}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Development Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Development Milestones
            </CardTitle>
            <CardDescription>
              {achievedMilestones.length} of {milestones.length} achieved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {milestones.map(milestone => (
                <div
                  key={milestone.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    milestone.achieved
                      ? 'bg-green-50 border-green-500'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{milestone.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{milestone.title}</h4>
                      <p className="text-xs text-muted-foreground">{milestone.description}</p>
                      {milestone.achieved && milestone.achievedAt && (
                        <p className="text-xs text-green-600 mt-2">
                          ✓ {formatDate(milestone.achievedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stagnant Skills Alert */}
        {metrics && metrics.stagnantSkills.length > 0 && (
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <Target className="h-5 w-5 text-orange-600" />
                Skills to Focus On
              </CardTitle>
              <CardDescription>These skills haven't improved recently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.stagnantSkills.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                    <span className="font-medium text-orange-900">{item.skill}</span>
                    <span className="text-sm text-orange-600">
                      {item.daysSinceImprovement} days since improvement
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Data State */}
        {snapshots.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Lightbulb className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start Tracking Your Growth</h3>
              <p className="text-muted-foreground mb-4">
                Complete assessments to see your cognitive development over time
              </p>
              <Button onClick={onBack}>Return to Dashboard</Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
