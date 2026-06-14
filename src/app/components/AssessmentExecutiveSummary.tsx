import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Brain, BookOpen, Target, TrendingUp, Award, Sparkles } from 'lucide-react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { getAssessmentResults, getAllAssessmentResults } from '../utils/api';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AssessmentExecutiveSummaryProps {
  userId: string;
}

interface AssessmentResults {
  learning?: any;
  thinking?: any;
  decision?: any;
}

const COLORS = {
  learning: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
  thinking: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'],
  decision: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0']
};

export function AssessmentExecutiveSummary({ userId }: AssessmentExecutiveSummaryProps) {
  const [results, setResults] = useState<AssessmentResults>({});
  const [loading, setLoading] = useState(true);

  console.log('[Executive Summary] Component mounted for userId:', userId);

  useEffect(() => {
    console.log('[Executive Summary] useEffect triggered');
    loadAllResults();
  }, [userId]);

  const loadAllResults = async () => {
    try {
      // First, let's check what data exists in the database using the API utility
      const allDataCheck = await getAllAssessmentResults();
      console.log('[Executive Summary] All results in database:', allDataCheck);

      // Fetch all three assessment results using the API utility
      const [learningData, thinkingData, decisionData] = await Promise.all([
        getAssessmentResults('learning'),
        getAssessmentResults('thinking'),
        getAssessmentResults('decision')
      ]);

      console.log('[Executive Summary] Learning response:', learningData);
      console.log('[Executive Summary] Thinking response:', thinkingData);
      console.log('[Executive Summary] Decision response:', decisionData);

      const resultsData: AssessmentResults = {};

      if (learningData?.results) {
        resultsData.learning = learningData.results;
      }

      if (thinkingData?.results) {
        resultsData.thinking = thinkingData.results;
      }

      if (decisionData?.results) {
        resultsData.decision = decisionData.results;
      }

      console.log('[Executive Summary] Final results data:', resultsData);
      setResults(resultsData);
    } catch (error) {
      console.error('[Executive Summary] Error loading assessment results:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareRadarData = () => {
    if (!results.thinking?.results) return [];

    const thinkingScores = results.thinking.results;
    return [
      { style: 'Creative', score: thinkingScores.creative || 0 },
      { style: 'Analytical', score: thinkingScores.analytical || 0 },
      { style: 'Practical', score: thinkingScores.practical || 0 },
      { style: 'Reflective', score: thinkingScores.reflective || 0 }
    ];
  };

  const prepareLearningData = () => {
    if (!results.learning?.results) return [];

    const learningScores = results.learning.results;
    return [
      { name: 'Visual', value: learningScores.visual || 0, color: '#3B82F6' },
      { name: 'Auditory', value: learningScores.auditory || 0, color: '#60A5FA' },
      { name: 'Kinesthetic', value: learningScores.kinesthetic || 0, color: '#93C5FD' },
      { name: 'Reading/Writing', value: learningScores.readingWriting || 0, color: '#BFDBFE' }
    ];
  };

  const prepareDecisionData = () => {
    if (!results.decision?.results) return [];

    const decisionScores = results.decision.results;
    return [
      { name: 'Intuitive', value: decisionScores.intuitive || 0 },
      { name: 'Rational', value: decisionScores.rational || 0 },
      { name: 'Dependent', value: decisionScores.dependent || 0 },
      { name: 'Avoidant', value: decisionScores.avoidant || 0 },
      { name: 'Spontaneous', value: decisionScores.spontaneous || 0 }
    ];
  };

  const getPrimaryStyle = (data: any[]) => {
    if (data.length === 0) return null;
    return data.reduce((max, item) => 
      (item.value || item.score) > (max.value || max.score) ? item : max
    );
  };

  const getCompletionCount = () => {
    let count = 0;
    if (results.learning) count++;
    if (results.thinking) count++;
    if (results.decision) count++;
    return count;
  };

  const completionPercentage = (getCompletionCount() / 3) * 100;

  if (loading) {
    return (
      <Card className="border-2 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <Sparkles className="h-8 w-8 text-purple-500 animate-pulse mx-auto" />
              <p className="text-gray-600">Loading your cognitive profile...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completionCount = getCompletionCount();

  if (completionCount === 0) {
    return (
      <Card className="border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>Complete assessments to see your cognitive profile</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <p className="text-gray-600">
              Complete the three core assessments to unlock your personalized cognitive profile with detailed insights and recommendations.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-6">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-blue-900">Learning Style</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                <Brain className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-orange-900">Thinking Style</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-green-900">Decision Style</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const radarData = prepareRadarData();
  const learningData = prepareLearningData();
  const decisionData = prepareDecisionData();

  const primaryLearning = getPrimaryStyle(learningData);
  const primaryThinking = getPrimaryStyle(radarData);
  const primaryDecision = getPrimaryStyle(decisionData);

  return (
    <div className="space-y-6">
      {/* Header Card with Completion Status */}
      <Card className="border-2 border-purple-300 bg-gradient-to-br from-white via-purple-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Executive Summary</CardTitle>
                <CardDescription>Your comprehensive cognitive profile across three assessments</CardDescription>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2">
              {completionCount}/3 Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Learning Style Summary */}
            <div className={`p-4 rounded-xl border-2 ${results.learning ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className={`h-5 w-5 ${results.learning ? 'text-blue-600' : 'text-gray-400'}`} />
                <h3 className="font-semibold text-gray-900">Learning Style</h3>
              </div>
              {results.learning ? (
                <>
                  <p className="text-2xl font-bold text-blue-600 mb-1">{primaryLearning?.name}</p>
                  <p className="text-sm text-gray-600">Primary learning preference</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">Not completed</p>
              )}
            </div>

            {/* Thinking Style Summary */}
            <div className={`p-4 rounded-xl border-2 ${results.thinking ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Brain className={`h-5 w-5 ${results.thinking ? 'text-orange-600' : 'text-gray-400'}`} />
                <h3 className="font-semibold text-gray-900">Thinking Style</h3>
              </div>
              {results.thinking ? (
                <>
                  <p className="text-2xl font-bold text-orange-600 mb-1">{primaryThinking?.style}</p>
                  <p className="text-sm text-gray-600">Dominant thinking approach</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">Not completed</p>
              )}
            </div>

            {/* Decision Style Summary */}
            <div className={`p-4 rounded-xl border-2 ${results.decision ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Target className={`h-5 w-5 ${results.decision ? 'text-green-600' : 'text-gray-400'}`} />
                <h3 className="font-semibold text-gray-900">Decision Style</h3>
              </div>
              {results.decision ? (
                <>
                  <p className="text-2xl font-bold text-green-600 mb-1">{primaryDecision?.name}</p>
                  <p className="text-sm text-gray-600">Primary decision approach</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">Not completed</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thinking Style Radar Chart */}
        {results.thinking && (
          <Card className="border-2 border-orange-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-orange-600" />
                <CardTitle>Thinking Style Profile</CardTitle>
              </div>
              <CardDescription>Your cognitive processing patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#f97316" strokeOpacity={0.2} />
                  <PolarAngleAxis 
                    dataKey="style" 
                    tick={{ fill: '#78716c', fontSize: 12 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#78716c' }} />
                  <Radar 
                    name="Score" 
                    dataKey="score" 
                    stroke="#f97316" 
                    fill="#fb923c" 
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #fb923c',
                      borderRadius: '8px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Learning Style Bar Chart */}
        {results.learning && (
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <CardTitle>Learning Style Distribution</CardTitle>
              </div>
              <CardDescription>How you best absorb information</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={learningData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#78716c', fontSize: 11 }}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fill: '#78716c' }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #3b82f6',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {learningData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Decision Style Bar Chart */}
        {results.decision && (
          <Card className="border-2 border-green-200 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                <CardTitle>Decision-Making Profile</CardTitle>
              </div>
              <CardDescription>Your approach to making choices</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={decisionData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#78716c' }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#78716c', fontSize: 12 }} width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #10b981',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Key Insights Card */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            <CardTitle>Key Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.learning && primaryLearning && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/80 border border-blue-200">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Learning: {primaryLearning.name} Learner</p>
                  <p className="text-sm text-gray-600 mt-1">
                    You learn best through {primaryLearning.name.toLowerCase()} methods. Focus on study techniques that leverage this strength.
                  </p>
                </div>
              </div>
            )}

            {results.thinking && primaryThinking && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/80 border border-orange-200">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Thinking: {primaryThinking.style} Thinker</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Your dominant {primaryThinking.style.toLowerCase()} thinking style shapes how you approach problems and generate solutions.
                  </p>
                </div>
              </div>
            )}

            {results.decision && primaryDecision && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/80 border border-green-200">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Target className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Decision: {primaryDecision.name} Decision-Maker</p>
                  <p className="text-sm text-gray-600 mt-1">
                    You tend to make decisions using {primaryDecision.name.toLowerCase()} approaches. Understanding this helps you make better choices.
                  </p>
                </div>
              </div>
            )}

            {completionCount < 3 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-300">
                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Complete All Three Assessments</p>
                  <p className="text-sm text-gray-600 mt-1">
                    You've completed {completionCount} of 3 assessments. Complete the remaining {3 - completionCount} to unlock your full cognitive profile and personalized recommendations!
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}