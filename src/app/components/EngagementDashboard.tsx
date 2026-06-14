import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Target,
  Zap,
  Calendar,
  Award,
  AlertTriangle,
  Lightbulb,
  BarChart3,
} from 'lucide-react';
import {
  getEngagementMetrics,
  generateEngagementInsights,
  type EngagementMetrics,
  type EngagementInsight,
} from '../utils/engagementTracking';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Props {
  userId: string;
  onBack: () => void;
}

export function EngagementDashboard({ userId, onBack }: Props) {
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [insights, setInsights] = useState<EngagementInsight[]>([]);

  useEffect(() => {
    loadEngagementData();
  }, [userId]);

  const loadEngagementData = () => {
    const engagementMetrics = getEngagementMetrics(userId);
    const engagementInsights = generateEngagementInsights(engagementMetrics);

    setMetrics(engagementMetrics);
    setInsights(engagementInsights);
  };

  if (!metrics) {
    return <div className="p-8 text-center">Loading engagement data...</div>;
  }

  const COLORS = ['#5B7DB1', '#6B4C9A', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

  const featureUsageData = [
    { name: 'Assessments', value: metrics.featureUsage.assessments },
    { name: 'Brain Gym', value: metrics.featureUsage.brainGym },
    { name: 'Career', value: metrics.featureUsage.careerExploration },
    { name: 'Profile', value: metrics.featureUsage.profileViews },
    { name: 'Skill Plans', value: metrics.featureUsage.skillPlans },
    { name: 'Gamification', value: metrics.featureUsage.gamification },
  ].filter(item => item.value > 0);

  const weeklyTrendData = metrics.weeklyActivity.map(week => ({
    week: week.week.slice(5),
    sessions: week.sessions,
    time: Math.round(week.timeSpent),
    activities: week.activities,
  }));

  const peakTimesData = metrics.peakActivityTimes.map(time => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      time: `${days[time.dayOfWeek]} ${time.hour}:00`,
      count: time.activityCount,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Engagement Analytics
            </h1>
            <p className="text-xs text-muted-foreground">
              Track your learning activity and platform usage
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Engagement Score */}
        <Card className="border-2 border-primary bg-gradient-to-br from-white to-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">{metrics.engagementScore}</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Overall Engagement</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Your engagement score reflects your activity level, consistency, and feature usage
                </p>
                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      metrics.engagementScore >= 80
                        ? 'bg-green-600'
                        : metrics.engagementScore >= 60
                        ? 'bg-blue-600'
                        : metrics.engagementScore >= 40
                        ? 'bg-yellow-600'
                        : 'bg-orange-600'
                    }
                  >
                    {metrics.engagementScore >= 80
                      ? 'Excellent'
                      : metrics.engagementScore >= 60
                      ? 'Good'
                      : metrics.engagementScore >= 40
                      ? 'Fair'
                      : 'Needs Improvement'}
                  </Badge>
                  {metrics.streakData.currentStreak > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {metrics.streakData.currentStreak} Day Streak
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Active Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{metrics.activeDays}</div>
              <p className="text-xs text-muted-foreground mt-1">Days with activity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{metrics.totalSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">Learning sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                Time Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(metrics.totalTimeSpent)}m
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total learning time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-600" />
                Avg Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {Math.round(metrics.averageSessionDuration)}m
              </div>
              <p className="text-xs text-muted-foreground mt-1">Per session</p>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Insights & Recommendations
            </h3>
            {insights.map((insight) => (
              <Card
                key={insight.id}
                className={
                  insight.type === 'positive'
                    ? 'border-l-4 border-l-green-500'
                    : insight.type === 'warning'
                    ? 'border-l-4 border-l-orange-500'
                    : 'border-l-4 border-l-blue-500'
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {insight.type === 'positive' && (
                      <Award className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    )}
                    {insight.type === 'warning' && (
                      <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    )}
                    {insight.type === 'suggestion' && (
                      <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        <Badge
                          variant={
                            insight.priority === 'high'
                              ? 'destructive'
                              : insight.priority === 'medium'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      {insight.recommendation && (
                        <p className="text-sm text-primary font-medium mt-2">
                          💡 {insight.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Weekly Activity */}
          {weeklyTrendData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity Trend</CardTitle>
                <CardDescription>Your learning activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line
                        type="monotone"
                        dataKey="sessions"
                        stroke="#5B7DB1"
                        strokeWidth={2}
                        name="Sessions"
                      />
                      <Line
                        type="monotone"
                        dataKey="activities"
                        stroke="#6B4C9A"
                        strokeWidth={2}
                        name="Activities"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feature Usage */}
          {featureUsageData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>How you use the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={featureUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {featureUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Peak Activity Times */}
          {peakTimesData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Peak Activity Times</CardTitle>
                <CardDescription>When you're most active</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakTimesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#5B7DB1" name="Activity Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Streak Information */}
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Streak Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border-2 border-orange-200">
                  <div className="text-3xl font-bold text-orange-600">
                    {metrics.streakData.currentStreak}
                  </div>
                  <div className="text-sm text-muted-foreground">Current Streak</div>
                </div>
                <div className="p-4 bg-white rounded-lg border-2 border-orange-200">
                  <div className="text-3xl font-bold text-orange-600">
                    {metrics.streakData.longestStreak}
                  </div>
                  <div className="text-sm text-muted-foreground">Longest Streak</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {metrics.streakData.currentStreak > 0
                  ? `Keep it up! Come back tomorrow to maintain your ${metrics.streakData.currentStreak}-day streak.`
                  : 'Start a new streak by being active today!'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Activity Breakdown</CardTitle>
            <CardDescription>Detailed usage across platform features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Assessments', count: metrics.featureUsage.assessments, icon: '📊', color: '#5B7DB1' },
                { name: 'Brain Gym', count: metrics.featureUsage.brainGym, icon: '🧠', color: '#6B4C9A' },
                { name: 'Career Exploration', count: metrics.featureUsage.careerExploration, icon: '🚀', color: '#10b981' },
                { name: 'Profile Views', count: metrics.featureUsage.profileViews, icon: '👤', color: '#f59e0b' },
                { name: 'Skill Plans', count: metrics.featureUsage.skillPlans, icon: '🎯', color: '#3b82f6' },
                { name: 'Gamification', count: metrics.featureUsage.gamification, icon: '🎮', color: '#8b5cf6' },
              ].map((feature) => (
                <div key={feature.name} className="flex items-center gap-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{feature.name}</span>
                      <span className="text-sm font-bold" style={{ color: feature.color }}>
                        {feature.count}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${Math.min((feature.count / Math.max(...Object.values(metrics.featureUsage))) * 100, 100)}%`,
                          backgroundColor: feature.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
