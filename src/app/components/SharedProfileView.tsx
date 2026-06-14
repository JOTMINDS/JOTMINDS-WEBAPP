import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { Share2, Sparkles, TrendingUp, Brain, Zap, Target, Eye, CheckCircle2 } from 'lucide-react';
import { getSharedProfile } from '../utils/cognitiveProfileApi';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  shareToken: string;
}

export function SharedProfileView({ shareToken }: Props) {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedProfile = async () => {
      try {
        const data = await getSharedProfile(shareToken);
        setProfile(data.profile);
      } catch (e: any) {
        setError(e.message || 'Failed to load shared profile');
      } finally {
        setLoading(false);
      }
    };

    loadSharedProfile();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4">
        <div className="max-w-4xl mx-auto space-y-4 pt-8">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {error || 'This shared profile link is invalid or has expired.'}
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Go to JotMinds
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare radar chart data
  const radarData = [
    { dimension: 'Learning Agility', value: profile.learningAgility || 0 },
    { dimension: 'Analytical Depth', value: profile.analyticalDepth || 0 },
    { dimension: 'Creative Capacity', value: profile.creativeCapacity || 0 },
    { dimension: 'Practical Execution', value: profile.practicalExecution || 0 },
    { dimension: 'Intuitive Speed', value: profile.intuitiveSpeed || 0 },
    { dimension: 'Reflective Depth', value: profile.reflectiveDepth || 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Share2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Shared Cognitive Profile</h1>
          </div>
          <p className="text-muted-foreground">
            Someone shared their cognitive profile with you
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4 space-y-6 py-8">
        {/* Archetype Card */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl flex items-center gap-3">
                <Brain className="h-8 w-8 text-purple-600" />
                {profile.cognitiveArchetype}
              </CardTitle>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {profile.profileCompleteness}% Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">
                Completed {profile.completedAssessments?.length || 0} assessment(s)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Core Dimensions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Cognitive Dimensions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid key="polar-grid-shared" stroke="#e5e7eb" />
                  <PolarAngleAxis
                    key="polar-angle-shared"
                    dataKey="dimension"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    key="polar-radius-shared"
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                  />
                  <Radar
                    key="radar-shared"
                    name="Profile"
                    dataKey="value"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    key="tooltip-shared"
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Meta-Dimensions Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Cognitive Flexibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">
                {profile.cognitiveFlexibility}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Ability to adapt thinking styles
              </p>
            </CardContent>
          </Card>

          <Card className="border-pink-200 bg-gradient-to-br from-white to-pink-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-600" />
                Innovation Potential
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-pink-600">
                {profile.innovationPotential}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Creative problem-solving capacity
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Execution Capability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-600">
                {profile.executionCapability}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Turning ideas into reality
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                Metacognitive Awareness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600">
                {profile.metacognitiveAwareness}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Self-awareness of thinking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Card */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none">
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold mb-2">Discover Your Own Cognitive Profile</h3>
            <p className="mb-4 text-blue-100">
              Take our assessments to understand your unique thinking styles and strengths
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => window.location.href = '/'}
            >
              Get Started with JotMinds
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur px-4 py-6 mt-12">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>Powered by <strong>JotMinds</strong> - Cognitive Assessment Platform</p>
          <p className="mt-1">Helping you understand how you think</p>
        </div>
      </footer>
    </div>
  );
}
