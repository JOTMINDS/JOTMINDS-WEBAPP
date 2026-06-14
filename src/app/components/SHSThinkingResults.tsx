import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { SHSResults } from '../utils/shsScoring';
import { shsThinkingStyles } from '../utils/shsThinkingData';
import { getSHSInsights } from '../utils/shsScoring';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { Home, Share2, TrendingUp, Lightbulb, GraduationCap, Briefcase, Building2 } from 'lucide-react';

interface SHSThinkingResultsProps {
  results: SHSResults;
  userName: string;
  onReturnToDashboard: () => void;
  onShareWithParent: () => void;
}

export function SHSThinkingResults({
  results,
  userName,
  onReturnToDashboard,
  onShareWithParent
}: SHSThinkingResultsProps) {
  const { percentages, dominantStyle, personalityType, topPrograms } = results;
  const insights = getSHSInsights(results);

  // Prepare chart data
  const radarData = [
    { subject: 'Creative', score: percentages.creative, fullMark: 100 },
    { subject: 'Analytical', score: percentages.analytical, fullMark: 100 },
    { subject: 'Practical', score: percentages.practical, fullMark: 100 },
    { subject: 'Reflective', score: percentages.reflective, fullMark: 100 }
  ];

  const barData = [
    { name: 'Creative 🎨', percentage: percentages.creative, fill: '#FF715B' },
    { name: 'Analytical 🔍', percentage: percentages.analytical, fill: '#6B4C9A' },
    { name: 'Practical 🛠️', percentage: percentages.practical, fill: '#C1E1C1' },
    { name: 'Reflective 💭', percentage: percentages.reflective, fill: '#8E7CC3' }
  ];

  const dominantStyleInfo = shsThinkingStyles[dominantStyle];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="border-4 border-indigo-300 bg-gradient-to-r from-indigo-100 to-cyan-100 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="text-6xl mb-4">🎉</div>
            <CardTitle className="text-4xl bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Your Thinking Style Profile
            </CardTitle>
            <CardDescription className="text-xl text-gray-700">
              Great work, {userName}! Here's what we discovered about how you think.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Personality Type */}
        <Card className="border-3 border-indigo-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-3">
              <span className="text-3xl">{dominantStyleInfo.emoji}</span>
              You are: {personalityType}
            </CardTitle>
            <CardDescription className="text-indigo-100 text-base">
              {dominantStyleInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Your Strengths:
                </h3>
                <ul className="space-y-2">
                  {dominantStyleInfo.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-600 mt-0.5">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Growth Tips:
                </h3>
                <ul className="space-y-2">
                  {dominantStyleInfo.growthTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-yellow-600 mt-0.5">💡</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 border-indigo-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Thinking Style Distribution</CardTitle>
              <CardDescription>Your profile across all four thinking styles</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e0e7ff" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#4f46e5', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6366f1', fontSize: 10 }} />
                  <Radar name="Your Score" dataKey="score" stroke="#6366f1" fill="#818cf8" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-2 border-indigo-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Comparative Strengths</CardTitle>
              <CardDescription>How your thinking styles compare</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#4f46e5', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#4f46e5', fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#818cf8" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* TOP TERTIARY PROGRAM RECOMMENDATIONS */}
        <Card className="border-4 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="h-8 w-8 text-yellow-600" />
              <CardTitle className="text-2xl text-gray-900">
                🎓 Your Top University Program Recommendations
              </CardTitle>
            </div>
            <CardDescription className="text-base text-gray-700">
              Based on your thinking style profile, these tertiary programs align best with your strengths
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {topPrograms.map((program, index) => (
              <Card key={index} className="border-2 border-yellow-200 bg-white shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-lg px-3 py-1">
                        #{index + 1}
                      </Badge>
                      <CardTitle className="text-xl text-gray-900">{program.name}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-base text-gray-700">
                    {program.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Why it fits */}
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-indigo-600" />
                      Why it fits your Thinking Style:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {program.thinkingStyles.map((style, idx) => {
                        const styleKey = style as keyof typeof shsThinkingStyles;
                        const styleInfo = shsThinkingStyles[styleKey];
                        return (
                          <Badge key={idx} className="bg-white border-2" style={{ borderColor: styleInfo.color, color: styleInfo.color }}>
                            {styleInfo.emoji} {styleInfo.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Career Paths */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      Career Pathways:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {program.careerPaths.map((career, idx) => (
                        <Badge key={idx} variant="outline" className="bg-blue-50 border-blue-300 text-blue-900">
                          {career}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Universities */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-green-600" />
                      Top Schools Offering This Program:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {program.universities.map((uni, idx) => (
                        <Badge key={idx} variant="outline" className="bg-green-50 border-green-300 text-green-900">
                          {uni}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Key Skills You'll Develop:</h4>
                    <div className="flex flex-wrap gap-2">
                      {program.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Additional Insights */}
        <Card className="border-2 border-indigo-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-600" />
              Additional Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.strengths.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Your Key Strengths:</h3>
                <ul className="space-y-1">
                  {insights.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {insights.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Personalized Recommendations:</h3>
                <ul className="space-y-1">
                  {insights.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={onReturnToDashboard}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-lg py-6 text-base"
          >
            <Home className="mr-2 h-5 w-5" />
            Return to Dashboard
          </Button>
          <Button
            onClick={onShareWithParent}
            variant="outline"
            className="flex-1 border-2 border-indigo-300 hover:bg-indigo-50 py-6 text-base"
          >
            <Share2 className="mr-2 h-5 w-5" />
            Share with Parent/Guardian
          </Button>
        </div>
      </div>
    </div>
  );
}
