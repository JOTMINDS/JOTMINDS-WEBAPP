import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Brain,
  Lightbulb,
  Target,
  Clock,
  TrendingUp,
  BookOpen,
  Zap,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Info,
  Calendar,
  Filter,
  Bell,
  BellOff,
  Star,
  BarChart2,
  User,
  Flame,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react';
import {
  interpretProfile,
  generateRecommendations,
  rankRecommendations,
  generateStudyPlan,
  generateSmartReminders,
  getCoachInsights,
  getCognitiveArchetype,
  generateWeeklyPlan,
  type CognitiveArchetype,
  type WeeklyStudyPlan,
  type ReminderConfig
} from '../utils/aiRecommendations';
import { getAllAssessmentResults } from '../utils/api';

interface AILearningCoachProps {
  userId: string;
  onBack: () => void;
  onStartActivity?: (activityId: string) => void;
}

type TabType = 'profile' | 'recommendations' | 'weekly-planner' | 'reminders' | 'coach';

const PRIORITY_COLORS: Record<string, string> = {
  high: '#10B981',
  medium: '#F59E0B',
  low: '#6B7280'
};

const PRIORITY_BG: Record<string, string> = {
  high: 'bg-green-50 border-green-200',
  medium: 'bg-yellow-50 border-yellow-200',
  low: 'bg-gray-50 border-gray-200'
};

const DAY_SHORT: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun'
};

export const AILearningCoach: React.FC<AILearningCoachProps> = ({
  userId,
  onBack,
  onStartActivity
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileInterpretation, setProfileInterpretation] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyStudyPlan | null>(null);
  const [reminders, setReminders] = useState<any[]>([]);
  const [coachInsights, setCoachInsights] = useState<any>(null);
  const [archetype, setArchetype] = useState<CognitiveArchetype | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlanDuration, setSelectedPlanDuration] = useState(30);
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [expandedRec, setExpandedRec] = useState<string | null>(null);

  // Recommendation filters
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTime, setFilterTime] = useState<number>(120);
  const [showFilters, setShowFilters] = useState(false);

  // Reminder config
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>({
    studyDays: [1, 2, 3, 4, 5],
    preferredTime: 'evening',
    sessionDuration: 30,
    reminderTypes: ['streak', 'lesson', 'assessment', 'break']
  });
  const [remindersSaved, setRemindersSaved] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      const { results } = await getAllAssessmentResults();

      const profile: any = { id: userId, assessmentScores: {} };
      results.forEach((result: any) => {
        const type = result.assessmentType;
        profile.assessmentScores[type] = result.scores || {};
        if (type === 'learning') profile.learningStyle = result.primaryStyle;
        else if (type === 'thinking') profile.thinkingStyle = result.primaryStyle;
        else if (type === 'decision') profile.decisionStyle = result.primaryStyle;
      });

      setUserProfile(profile);

      if (Object.keys(profile.assessmentScores).length > 0) {
        const interpretation = interpretProfile(userId, profile);
        setProfileInterpretation(interpretation);

        const arc = getCognitiveArchetype(profile);
        setArchetype(arc);

        const recs = generateRecommendations(userId, profile);
        const rankedRecs = rankRecommendations(recs, {
          availableTime: 60,
          recentActivities: [],
          goals: []
        });
        setRecommendations(rankedRecs);

        const plan = generateStudyPlan(userId, profile, selectedPlanDuration);
        setStudyPlan(plan);

        const weekly = generateWeeklyPlan(profile, weeklyHours * 60);
        setWeeklyPlan(weekly);
        setSelectedDay(weekly.days[0].day);

        const smartReminders = generateSmartReminders(userId, {
          lastLogin: new Date(),
          currentStreak: 5,
          completedLessonsToday: 2,
          preferredStudyTime: 'evening',
          assessmentProgress: (results.length / 3) * 100
        });
        setReminders(smartReminders);

        const insights = getCoachInsights(userId, profile, {
          lessonsCompleted: 8,
          averageAccuracy: 82,
          timeSpent: 95,
          strugglingAreas: []
        });
        setCoachInsights(insights);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const regenerateStudyPlan = (duration: number) => {
    setSelectedPlanDuration(duration);
    if (userProfile) {
      const plan = generateStudyPlan(userId, userProfile, duration);
      setStudyPlan(plan);
    }
  };

  const regenerateWeeklyPlan = (hours: number) => {
    setWeeklyHours(hours);
    if (userProfile) {
      const weekly = generateWeeklyPlan(userProfile, hours * 60);
      setWeeklyPlan(weekly);
      setSelectedDay(weekly.days[0].day);
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (filterPriority !== 'all' && rec.priority !== filterPriority) return false;
    if (filterCategory !== 'all' && rec.category !== filterCategory) return false;
    if (rec.estimatedTime && rec.estimatedTime > filterTime) return false;
    return true;
  });

  const categories = ['all', ...Array.from(new Set(recommendations.map(r => r.category)))];

  const saveReminderConfig = () => {
    localStorage.setItem('jotminds_reminder_config', JSON.stringify(reminderConfig));
    setRemindersSaved(true);
    setTimeout(() => setRemindersSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#6B4C9A' }}></div>
          <p>Loading AI insights...</p>
        </div>
      </div>
    );
  }

  if (!profileInterpretation) {
    return (
      <div className="min-h-screen p-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />Back
        </Button>
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" style={{ color: '#6B4C9A' }} />
              Complete Your Assessments
            </CardTitle>
            <CardDescription>
              AI-powered insights require completed assessment data. Please complete all three assessments to unlock your personalized learning profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} style={{ backgroundColor: '#6B4C9A' }}>
              Go to Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedDayPlan = weeklyPlan?.days.find(d => d.day === selectedDay);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #F8F9FA 0%, #FFFFFF 100%)' }}>
      {/* Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl mb-0.5" style={{ color: '#6B4C9A' }}>AI Learning Coach</h1>
                <p className="text-sm text-gray-500">Explainable AI · Personalised for you</p>
              </div>
            </div>
            {archetype && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm" style={{ borderColor: archetype.primaryColor, color: archetype.primaryColor }}>
                <span>{archetype.icon}</span>
                <span>{archetype.name}</span>
              </div>
            )}
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
            {([
              { key: 'profile', label: 'Profile', icon: User },
              { key: 'recommendations', label: 'Recommendations', icon: Lightbulb },
              { key: 'weekly-planner', label: 'Weekly Planner', icon: Calendar },
              { key: 'reminders', label: 'Reminders', icon: Bell },
              { key: 'coach', label: 'AI Coach', icon: Brain }
            ] as { key: TabType; label: string; icon: React.FC<any> }[]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${activeTab === key ? 'text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                style={activeTab === key ? { backgroundColor: '#6B4C9A' } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Cognitive Archetype Hero */}
            {archetype && (
              <Card className="overflow-hidden">
                <div className="h-2" style={{ backgroundColor: archetype.primaryColor }} />
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="flex-shrink-0 text-6xl text-center md:text-left">{archetype.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3 flex-wrap">
                        <div>
                          <h2 className="text-2xl" style={{ color: archetype.primaryColor }}>{archetype.name}</h2>
                          <p className="text-base text-gray-600 italic">{archetype.tagline}</p>
                        </div>
                        <Badge variant="secondary" className="mt-1">Cognitive Archetype</Badge>
                      </div>
                      <p className="text-gray-700 mb-4">{archetype.description}</p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-900">
                          <strong>Ideal environment:</strong> {archetype.idealLearningEnvironment}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-900 mb-2"><CheckCircle2 className="w-4 h-4 inline mr-1 text-green-600" /><strong>Natural Strengths</strong></p>
                      <div className="space-y-1">
                        {archetype.strengths.map((s, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                            <p className="text-sm text-green-800">{s}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-sm text-orange-900 mb-2"><AlertCircle className="w-4 h-4 inline mr-1 text-orange-600" /><strong>Watch Out For</strong></p>
                      <div className="space-y-1">
                        {archetype.challenges.map((c, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                            <p className="text-sm text-orange-800">{c}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <p className="text-sm text-purple-900 mb-2"><Star className="w-4 h-4 inline mr-1 text-purple-600" /><strong>Career Affinities</strong></p>
                      <div className="flex flex-wrap gap-1.5">
                        {archetype.careerAffinities.map((c, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cognitive Scores visual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5" style={{ color: '#5B7DB1' }} />
                  Your Cognitive Score Breakdown
                </CardTitle>
                <CardDescription>Based on your completed assessments</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const scoreGroups = [
                    {
                      label: 'Learning Styles',
                      color: '#5B7DB1',
                      scores: Object.entries(userProfile.assessmentScores?.learning || {}).map(([k, v]) => ({
                        label: k.charAt(0).toUpperCase() + k.slice(1),
                        value: v as number
                      }))
                    },
                    {
                      label: 'Thinking Styles',
                      color: '#6B4C9A',
                      scores: Object.entries(userProfile.assessmentScores?.thinking || {}).map(([k, v]) => ({
                        label: k.charAt(0).toUpperCase() + k.slice(1),
                        value: v as number
                      }))
                    },
                    {
                      label: 'Decision Making',
                      color: '#1E8A6E',
                      scores: Object.entries(userProfile.assessmentScores?.decision || {}).map(([k, v]) => ({
                        label: k.charAt(0).toUpperCase() + k.slice(1),
                        value: v as number
                      }))
                    }
                  ].filter(g => g.scores.length > 0);

                  return (
                    <div className="space-y-6">
                      {scoreGroups.map((group, gi) => (
                        <div key={gi}>
                          <p className="text-sm mb-3" style={{ color: group.color }}>{group.label}</p>
                          <div className="space-y-3">
                            {group.scores.map((item, i) => (
                              <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-700">{item.label}</span>
                                  <span style={{ color: group.color }}>{item.value}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                  <div
                                    className="h-2.5 rounded-full transition-all"
                                    style={{ width: `${item.value}%`, backgroundColor: group.color }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="border-l-4" style={{ borderLeftColor: '#6B4C9A' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" style={{ color: '#6B4C9A' }} />
                  AI Profile Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-4">{profileInterpretation.summary}</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900">
                      <strong>How we analyse this:</strong> Our AI examines your scores across learning, thinking, and decision-making dimensions to identify patterns and create personalised insights.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths */}
            {profileInterpretation.strengths.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Your Strengths ({profileInterpretation.strengths.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profileInterpretation.strengths.map((strength: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 bg-green-50">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-green-900">{strength.area}</h3>
                          <Badge className="bg-green-200 text-green-900">{strength.score}%</Badge>
                        </div>
                        <p className="text-sm text-green-800 mb-3">{strength.explanation}</p>
                        <div className="bg-white/70 border border-green-200 rounded p-3">
                          <p className="text-xs text-green-900"><strong>Evidence:</strong> {strength.evidenceFromProfile}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Development Areas */}
            {profileInterpretation.developmentAreas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    Growth Opportunities ({profileInterpretation.developmentAreas.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profileInterpretation.developmentAreas.map((area: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 bg-orange-50">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-orange-900">{area.area}</h3>
                          <Badge className="bg-orange-200 text-orange-900">{area.currentLevel}%</Badge>
                        </div>
                        <p className="text-sm text-orange-800 mb-3">{area.explanation}</p>
                        <div className="bg-white/70 border border-orange-200 rounded p-3 mb-3">
                          <p className="text-xs text-orange-900"><strong>Evidence:</strong> {area.evidenceFromProfile}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-orange-900 mb-2">Suggested Actions:</p>
                          {area.suggestedActions.map((action: string, ai: number) => (
                            <div key={ai} className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-orange-800">{action}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Learning Pathway */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" style={{ color: '#6B4C9A' }} />
                  Your Learning Pathway
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Current Stage</p>
                    <p className="text-lg" style={{ color: '#6B4C9A' }}>{profileInterpretation.learningPathway.stage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Focus Area</p>
                    <p className="text-base">{profileInterpretation.learningPathway.focus}</p>
                  </div>
                  <div className="bg-white/70 border border-purple-200 rounded p-3">
                    <p className="text-sm"><strong>Why this pathway?</strong> {profileInterpretation.learningPathway.reasoning}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {profileInterpretation.personalizedInsights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    Personalised Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profileInterpretation.personalizedInsights.map((insight: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-900">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ── RECOMMENDATIONS TAB ── */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Filter className="w-4 h-4" />
                    <span>Showing <strong>{filteredRecommendations.length}</strong> of {recommendations.length} recommendations</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                    <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
                    Filters
                    {showFilters ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                  </Button>
                </div>

                {showFilters && (
                  <div className="border-t pt-3 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500 self-center mr-1">Priority:</span>
                      {(['all', 'high', 'medium', 'low'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setFilterPriority(p)}
                          className={`px-3 py-1 rounded-full text-xs border transition-all ${filterPriority === p ? 'text-white border-transparent' : 'bg-white text-gray-600'}`}
                          style={filterPriority === p ? { backgroundColor: p === 'all' ? '#6B4C9A' : PRIORITY_COLORS[p] } : {}}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500 self-center mr-1">Category:</span>
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setFilterCategory(cat)}
                          className={`px-3 py-1 rounded-full text-xs border transition-all ${filterCategory === cat ? 'text-white border-transparent' : 'bg-white text-gray-600'}`}
                          style={filterCategory === cat ? { backgroundColor: '#5B7DB1' } : {}}
                        >
                          {cat === 'all' ? 'All Categories' : cat}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 whitespace-nowrap">Max time:</span>
                      <input
                        type="range"
                        min={5}
                        max={120}
                        step={5}
                        value={filterTime}
                        onChange={e => setFilterTime(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-700 w-16 text-right">{filterTime} min</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  Each recommendation includes transparent reasoning showing exactly why it's suggested for you, based on your assessment scores and learning patterns.
                </p>
              </div>
            </div>

            {filteredRecommendations.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  No recommendations match the current filters. Try adjusting your filters.
                </CardContent>
              </Card>
            )}

            {filteredRecommendations.map((rec) => (
              <Card key={rec.id} className="border-l-4 transition-shadow hover:shadow-md" style={{ borderLeftColor: PRIORITY_COLORS[rec.priority] }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <Badge className={`text-xs ${PRIORITY_BG[rec.priority]}`} style={{ color: PRIORITY_COLORS[rec.priority] }}>
                          {rec.priority} priority
                        </Badge>
                        <Badge variant="outline" className="text-xs">{rec.category}</Badge>
                      </div>
                      <CardDescription>{rec.description}</CardDescription>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="text-2xl" style={{ color: '#6B4C9A' }}>{rec.relevanceScore}%</div>
                      <p className="text-xs text-gray-500">relevance</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rec.estimatedTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{rec.estimatedTime} minutes</span>
                      </div>
                    )}

                    <button
                      onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                      className="w-full flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-left hover:bg-purple-100 transition-colors"
                    >
                      <span className="text-purple-900"><strong>Why this recommendation</strong></span>
                      {expandedRec === rec.id ? <ChevronUp className="w-4 h-4 text-purple-600" /> : <ChevronDown className="w-4 h-4 text-purple-600" />}
                    </button>

                    {expandedRec === rec.id && (
                      <div className="space-y-3 animate-in fade-in">
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <p className="text-sm text-purple-800">{rec.reasoning}</p>
                        </div>
                        <div>
                          <p className="text-sm mb-2">Evidence:</p>
                          <div className="space-y-1">
                            {rec.evidence.map((item: string, i: number) => (
                              <div key={i} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-1.5" />
                                <p className="text-sm text-gray-700">{item}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {onStartActivity && (
                      <Button onClick={() => onStartActivity(rec.id)} className="w-full" style={{ backgroundColor: '#6B4C9A' }}>
                        Start Activity <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ── WEEKLY PLANNER TAB ── */}
        {activeTab === 'weekly-planner' && weeklyPlan && (
          <div className="space-y-6">
            {/* Summary + controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-xl mb-1">Your Week at a Glance</h2>
                <p className="text-sm text-gray-600">{weeklyPlan.weeklyGoal}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Weekly hours:</span>
                {[3, 5, 7, 10].map(h => (
                  <Button
                    key={h}
                    variant={weeklyHours === h ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => regenerateWeeklyPlan(h)}
                    style={weeklyHours === h ? { backgroundColor: '#6B4C9A' } : {}}
                  >
                    {h}h
                  </Button>
                ))}
              </div>
            </div>

            {/* Weekly metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {weeklyPlan.progressMetrics.map((metric, i) => (
                <Card key={i}>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl mb-1" style={{ color: '#6B4C9A' }}>{metric.target}</div>
                    <p className="text-xs text-gray-500">{metric.unit}</p>
                    <p className="text-sm text-gray-700 mt-1">{metric.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Day selector */}
            <div className="grid grid-cols-7 gap-1.5">
              {weeklyPlan.days.map((day) => {
                const isSelected = selectedDay === day.day;
                const isRest = day.isRestDay;
                return (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(day.day)}
                    className={`rounded-xl p-2 text-center border transition-all ${isSelected ? 'text-white shadow-md' : isRest ? 'bg-gray-50 text-gray-400 border-gray-200' : 'bg-white hover:border-purple-300'}`}
                    style={isSelected ? { backgroundColor: '#6B4C9A', borderColor: '#6B4C9A' } : {}}
                  >
                    <p className="text-xs mb-1">{DAY_SHORT[day.day]}</p>
                    <p className="text-sm">{day.date.getDate()}</p>
                    {!isRest && (
                      <div className="flex justify-center gap-0.5 mt-1.5">
                        {day.sessions.map((_, si) => (
                          <div key={si} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-purple-400'}`} />
                        ))}
                      </div>
                    )}
                    {isRest && <p className="text-xs mt-1 opacity-60">Rest</p>}
                  </button>
                );
              })}
            </div>

            {/* Day detail */}
            {selectedDayPlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" style={{ color: '#6B4C9A' }} />
                    {selectedDayPlan.day}
                    {selectedDayPlan.isRestDay ? (
                      <Badge variant="secondary" className="ml-2">Rest Day</Badge>
                    ) : (
                      <Badge variant="secondary" className="ml-2">{selectedDayPlan.totalMinutes} min total</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDayPlan.isRestDay ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-3">😴</div>
                      <p className="text-lg mb-2">Rest & Recovery Day</p>
                      <p className="text-sm">Cognitive science shows rest days improve retention. Your brain consolidates learning during downtime.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDayPlan.sessions.map((session) => (
                        <div key={session.id} className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-12 text-center">
                              <div className="text-xs text-gray-500">{session.time}</div>
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1"
                                style={{ backgroundColor: session.color + '20', color: session.color }}
                              >
                                {session.type === 'lesson' ? <BookOpen className="w-4 h-4" /> :
                                  session.type === 'practice' ? <Zap className="w-4 h-4" /> :
                                    session.type === 'review' ? <RefreshCw className="w-4 h-4" /> :
                                      <Target className="w-4 h-4" />}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="text-gray-900">{session.title}</h3>
                                <Badge variant="secondary" className="text-xs">{session.duration} min</Badge>
                                <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: session.color }}>{session.category}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{session.focus}</p>
                              <div className="bg-gray-50 border rounded p-2">
                                <p className="text-xs text-gray-600"><strong>Why:</strong> {session.reasoning}</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full"
                                style={{ width: `${(session.duration / selectedDayPlan.totalMinutes) * 100}%`, backgroundColor: session.color }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Session-level study plan */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle>Session Study Plan</CardTitle>
                    <CardDescription>Optimised for your cognitive profile</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {[15, 30, 45, 60].map(duration => (
                      <Button
                        key={duration}
                        variant={selectedPlanDuration === duration ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => regenerateStudyPlan(duration)}
                        style={selectedPlanDuration === duration ? { backgroundColor: '#6B4C9A' } : {}}
                      >
                        {duration}m
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              {studyPlan && (
                <CardContent>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-900"><strong>Plan Reasoning:</strong> {studyPlan.reasoning}</p>
                  </div>

                  <div className="space-y-3 mb-4">
                    {studyPlan.activities.map((activity: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <h3>{activity.name}</h3>
                          <Badge variant="secondary">{activity.duration} min</Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2"><strong>Why:</strong> {activity.reasoning}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{ width: `${(activity.duration / studyPlan.duration) * 100}%`, background: 'linear-gradient(90deg, #5B7DB1 0%, #6B4C9A 100%)' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900 mb-2">Expected Outcomes:</p>
                    <div className="space-y-1">
                      {studyPlan.expectedOutcomes.map((outcome: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-green-800">{outcome}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* ── REMINDERS TAB ── */}
        {activeTab === 'reminders' && (
          <div className="space-y-6">
            {/* Active reminders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  Active Smart Reminders
                </CardTitle>
                <CardDescription>Personalised notifications based on your behaviour and learning patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {reminders.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <BellOff className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No reminders scheduled for now. Keep learning and we'll generate reminders based on your activity!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reminders.map((reminder) => (
                      <div key={reminder.id} className="border rounded-lg p-4 bg-blue-50">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {reminder.type === 'streak' && <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />}
                            {reminder.type === 'lesson' && <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                            {reminder.type === 'assessment' && <Target className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                            {reminder.type === 'break' && <Clock className="w-4 h-4 text-green-500 flex-shrink-0" />}
                            <p className="text-blue-900">{reminder.message}</p>
                          </div>
                          <Badge className={reminder.priority === 'high' ? 'bg-red-100 text-red-900' : 'bg-blue-100 text-blue-900'}>
                            {reminder.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-blue-800"><strong>Why:</strong> {reminder.reasoning}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reminder configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" style={{ color: '#6B4C9A' }} />
                  Configure Your Reminders
                </CardTitle>
                <CardDescription>Personalise when and how you receive study nudges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Study days */}
                  <div>
                    <p className="text-sm mb-3">Study Days</p>
                    <div className="flex gap-2 flex-wrap">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                        const dayNum = i + 1;
                        const isSelected = reminderConfig.studyDays.includes(dayNum);
                        return (
                          <button
                            key={day}
                            onClick={() => {
                              setReminderConfig(prev => ({
                                ...prev,
                                studyDays: isSelected
                                  ? prev.studyDays.filter(d => d !== dayNum)
                                  : [...prev.studyDays, dayNum]
                              }));
                            }}
                            className={`px-3 py-2 rounded-lg text-sm border transition-all ${isSelected ? 'text-white border-transparent' : 'bg-white text-gray-600'}`}
                            style={isSelected ? { backgroundColor: '#6B4C9A' } : {}}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred time */}
                  <div>
                    <p className="text-sm mb-3">Preferred Study Time</p>
                    <div className="flex gap-2 flex-wrap">
                      {(['morning', 'afternoon', 'evening'] as const).map(time => (
                        <button
                          key={time}
                          onClick={() => setReminderConfig(prev => ({ ...prev, preferredTime: time }))}
                          className={`px-4 py-2 rounded-lg text-sm border transition-all ${reminderConfig.preferredTime === time ? 'text-white border-transparent' : 'bg-white text-gray-600'}`}
                          style={reminderConfig.preferredTime === time ? { backgroundColor: '#5B7DB1' } : {}}
                        >
                          {time === 'morning' ? '🌅 Morning' : time === 'afternoon' ? '☀️ Afternoon' : '🌙 Evening'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Session duration preference */}
                  <div>
                    <div className="flex justify-between text-sm mb-3">
                      <span>Preferred Session Length</span>
                      <span style={{ color: '#6B4C9A' }}>{reminderConfig.sessionDuration} minutes</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      step={5}
                      value={reminderConfig.sessionDuration}
                      onChange={e => setReminderConfig(prev => ({ ...prev, sessionDuration: Number(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>10 min (quick)</span>
                      <span>90 min (deep work)</span>
                    </div>
                  </div>

                  {/* Reminder types */}
                  <div>
                    <p className="text-sm mb-3">Reminder Types</p>
                    <div className="space-y-2">
                      {([
                        { key: 'streak', label: 'Streak Protection', desc: 'Remind me when my streak is at risk', icon: Flame },
                        { key: 'lesson', label: 'Optimal Study Time', desc: 'Alert me during my peak learning hours', icon: BookOpen },
                        { key: 'assessment', label: 'Assessment Progress', desc: 'Nudge me to complete assessments', icon: Target },
                        { key: 'break', label: 'Overlearning Breaks', desc: 'Remind me to rest after long sessions', icon: Clock }
                      ] as { key: 'streak' | 'lesson' | 'assessment' | 'break'; label: string; desc: string; icon: React.FC<any> }[]).map(({ key, label, desc, icon: Icon }) => {
                        const isEnabled = reminderConfig.reminderTypes.includes(key);
                        return (
                          <div
                            key={key}
                            onClick={() => setReminderConfig(prev => ({
                              ...prev,
                              reminderTypes: isEnabled
                                ? prev.reminderTypes.filter(t => t !== key)
                                : [...prev.reminderTypes, key]
                            }))}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${isEnabled ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'}`}
                          >
                            <Icon className={`w-5 h-5 flex-shrink-0 ${isEnabled ? 'text-purple-600' : 'text-gray-400'}`} />
                            <div className="flex-1">
                              <p className={`text-sm ${isEnabled ? 'text-purple-900' : 'text-gray-700'}`}>{label}</p>
                              <p className="text-xs text-gray-500">{desc}</p>
                            </div>
                            <div className={`w-10 h-5 rounded-full transition-all flex items-center ${isEnabled ? 'bg-purple-600' : 'bg-gray-200'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white mx-0.5 transition-all ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} style={{ transition: 'transform 0.2s' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    onClick={saveReminderConfig}
                    className="w-full"
                    style={{ backgroundColor: remindersSaved ? '#1E8A6E' : '#6B4C9A' }}
                  >
                    {remindersSaved ? <><CheckCircle2 className="w-4 h-4 mr-2" />Saved!</> : <>Save Reminder Settings</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── COACH TAB ── */}
        {activeTab === 'coach' && coachInsights && (
          <div className="space-y-6">
            {/* Archetype quick reference */}
            {archetype && (
              <div className="flex items-center gap-4 p-4 border rounded-xl bg-white shadow-sm">
                <div className="text-4xl">{archetype.icon}</div>
                <div>
                  <p className="text-sm text-gray-500">Your Archetype</p>
                  <p className="text-lg" style={{ color: archetype.primaryColor }}>{archetype.name}</p>
                  <p className="text-sm text-gray-600">{archetype.tagline}</p>
                </div>
              </div>
            )}

            {/* Coach message */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" style={{ color: '#6B4C9A' }} />
                  Your AI Learning Coach Says...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-base">{coachInsights.message}</p>
                  <div className="bg-white/70 border-2 rounded-lg p-4" style={{ borderColor: '#6B4C9A' }}>
                    <p className="text-lg" style={{ color: '#6B4C9A' }}>{coachInsights.encouragement}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key observations */}
            <Card>
              <CardHeader>
                <CardTitle>Key Observations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {coachInsights.insights.map((insight: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-900">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Recommended Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {coachInsights.nextSteps.map((step: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm text-green-900 flex-1">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Compatible learning partners */}
            {archetype && archetype.compatibleArchetypes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-600" />
                    Compatible Learning Partners
                  </CardTitle>
                  <CardDescription>These archetypes complement your learning style well</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {archetype.compatibleArchetypes.map((name, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full text-sm border bg-white text-gray-700">
                        {name}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Study groups with complementary archetypes show 34% better outcomes than homogeneous groups.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
