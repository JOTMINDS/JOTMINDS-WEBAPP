import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Brain, Zap, Target, TrendingUp, Sparkles, Flame } from 'lucide-react';
import { CognitiveProfile } from '../utils/cognitiveProfileApi';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface Props {
  profile: CognitiveProfile;
}

const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  'Innovative Explorer': 'You thrive on creativity, intuition, and discovering new possibilities.',
  'Systematic Analyzer': 'You excel at deep analysis, logical reasoning, and methodical problem-solving.',
  'Pragmatic Builder': 'You focus on practical execution and turning ideas into tangible results.',
  'Versatile Thinker': 'You balance analytical, creative, and practical approaches with ease.',
  'Action-Oriented Intuitive': 'You make quick, instinctive decisions and execute rapidly.',
  'Deep Deliberator': 'You take time to reflect deeply and analyze situations thoroughly.',
  'Creative Synthesizer': 'You connect diverse ideas and see patterns others miss.',
  'Conceptual Theorist': 'You build frameworks and models to understand complex systems.',
  'Balanced Generalist': 'You demonstrate well-rounded cognitive capabilities across all dimensions.'
};

const ARCHETYPE_ICONS: Record<string, any> = {
  'Innovative Explorer': Sparkles,
  'Systematic Analyzer': Brain,
  'Pragmatic Builder': Target,
  'Versatile Thinker': Zap,
  'Action-Oriented Intuitive': Flame,
  'Deep Deliberator': Brain,
  'Creative Synthesizer': Sparkles,
  'Conceptual Theorist': Brain,
  'Balanced Generalist': TrendingUp
};

export function CognitiveFingerprint({ profile }: Props) {
  // Prepare data for radar chart
  const radarData = [
    { dimension: 'Learning Agility', value: profile.learningAgility, fullMark: 100 },
    { dimension: 'Analytical', value: profile.analyticalDepth, fullMark: 100 },
    { dimension: 'Creative', value: profile.creativeCapacity, fullMark: 100 },
    { dimension: 'Practical', value: profile.practicalExecution, fullMark: 100 },
    { dimension: 'Intuitive', value: profile.intuitiveSpeed, fullMark: 100 },
    { dimension: 'Reflective', value: profile.reflectiveDepth, fullMark: 100 },
  ];

  const ArchetypeIcon = ARCHETYPE_ICONS[profile.cognitiveArchetype] || Brain;
  const archetypeDescription = ARCHETYPE_DESCRIPTIONS[profile.cognitiveArchetype] || 'Your unique cognitive profile.';

  return (
    <div className="space-y-6">
      {/* Archetype Card */}
      <Card className="border-2 border-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-700 dark:to-pink-700 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <ArchetypeIcon className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{profile.cognitiveArchetype}</CardTitle>
              <CardDescription className="text-base">Your Cognitive Archetype</CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {Math.round(profile.profileCompleteness)}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{archetypeDescription}</p>

          {profile.profileCompleteness < 100 && (
            <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💡 Complete all three assessments for a more accurate cognitive profile.
                Missing: {['Kolb', 'Sternberg', 'Dual-Process'].filter(a =>
                  !profile.completedAssessments.includes(a.toLowerCase().replace('-', ''))
                ).join(', ')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Radar Chart - Cognitive Fingerprint */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Cognitive Fingerprint
          </CardTitle>
          <CardDescription>Your unique pattern of cognitive strengths across six core dimensions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" key="polar-grid" />
              <PolarAngleAxis
                key="polar-angle"
                dataKey="dimension"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <PolarRadiusAxis
                key="polar-radius"
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
              />
              <Radar
                key="radar-profile"
                name="Your Profile"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
              <Tooltip
                key="tooltip"
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Core Dimensions Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Core Cognitive Dimensions</CardTitle>
          <CardDescription>Detailed breakdown of your cognitive capabilities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DimensionBar
            label="Learning Agility"
            value={profile.learningAgility}
            description="Adaptability across different learning styles"
            color="blue"
          />
          <DimensionBar
            label="Analytical Depth"
            value={profile.analyticalDepth}
            description="Critical thinking and logical reasoning"
            color="purple"
          />
          <DimensionBar
            label="Creative Capacity"
            value={profile.creativeCapacity}
            description="Innovation and original thinking"
            color="pink"
          />
          <DimensionBar
            label="Practical Execution"
            value={profile.practicalExecution}
            description="Implementation and real-world application"
            color="green"
          />
          <DimensionBar
            label="Intuitive Speed"
            value={profile.intuitiveSpeed}
            description="Quick, instinctive decision-making"
            color="orange"
          />
          <DimensionBar
            label="Reflective Depth"
            value={profile.reflectiveDepth}
            description="Thoughtful, deliberate analysis"
            color="teal"
          />
        </CardContent>
      </Card>

      {/* Meta-Dimensions */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Meta-Dimensions</CardTitle>
          <CardDescription>Higher-order cognitive capabilities derived from your core profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DimensionBar
            label="Cognitive Flexibility"
            value={profile.cognitiveFlexibility}
            description="Ability to shift between different thinking modes"
            color="violet"
          />
          <DimensionBar
            label="Innovation Potential"
            value={profile.innovationPotential}
            description="Capacity for creative problem-solving"
            color="fuchsia"
          />
          <DimensionBar
            label="Execution Capability"
            value={profile.executionCapability}
            description="Effectiveness at turning plans into action"
            color="emerald"
          />
          <DimensionBar
            label="Metacognitive Awareness"
            value={profile.metacognitiveAwareness}
            description="Self-awareness of your own thinking processes"
            color="amber"
          />
        </CardContent>
      </Card>

      {/* Dominant Style */}
      <Card>
        <CardHeader>
          <CardTitle>Dominant Cognitive Style</CardTitle>
          <CardDescription>Your strongest single dimension across all assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-semibold text-lg">{profile.dominantStyle}</p>
                <p className="text-sm text-muted-foreground">Your peak cognitive strength</p>
              </div>
            </div>
            <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
              Primary
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for dimension bars
interface DimensionBarProps {
  label: string;
  value: number;
  description: string;
  color: string;
}

function DimensionBar({ label, value, description, color }: DimensionBarProps) {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-600' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-600' },
    pink: { bg: 'bg-pink-500', text: 'text-pink-600' },
    green: { bg: 'bg-green-500', text: 'text-green-600' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-600' },
    teal: { bg: 'bg-teal-500', text: 'text-teal-600' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-600' },
    fuchsia: { bg: 'bg-fuchsia-500', text: 'text-fuchsia-600' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-600' },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <span className={`font-bold ${colors.text}`}>{value}/100</span>
      </div>
      <div className="relative">
        <Progress value={value} className="h-3" />
        <div
          className={`absolute top-0 left-0 h-3 ${colors.bg} rounded-full transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
