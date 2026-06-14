import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AdultResults } from '../utils/adultScoring';
import { adultThinkingStyles } from '../utils/adultThinkingData';
import { getAdultInsights } from '../utils/adultScoring';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { Home, Share2, TrendingUp, Lightbulb, Briefcase, Building2, DollarSign, Target, Award } from 'lucide-react';

interface AdultThinkingResultsProps {
  results: AdultResults;
  userName: string;
  onReturnToDashboard: () => void;
  onShareResults: () => void;
}

export function AdultThinkingResults({
  results,
  userName,
  onReturnToDashboard,
  onShareResults
}: AdultThinkingResultsProps) {
  const { percentages, dominantStyle, professionalProfile, topCareerPaths } = results;
  const insights = getAdultInsights(results);

  // Prepare chart data
  const radarData = [
    { subject: 'Creative', score: percentages.creative, fullMark: 100 },
    { subject: 'Analytical', score: percentages.analytical, fullMark: 100 },
    { subject: 'Practical', score: percentages.practical, fullMark: 100 },
    { subject: 'Reflective', score: percentages.reflective, fullMark: 100 }
  ];

  const barData = [
    { name: 'Creative', percentage: percentages.creative, fill: '#FF715B' },
    { name: 'Analytical', percentage: percentages.analytical, fill: '#6B4C9A' },
    { name: 'Practical', percentage: percentages.practical, fill: '#C1E1C1' },
    { name: 'Reflective', percentage: percentages.reflective, fill: '#8E7CC3' }
  ];

  const dominantStyleInfo = adultThinkingStyles[dominantStyle];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="border-4 border-slate-300 bg-gradient-to-r from-slate-100 to-gray-100 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="text-6xl mb-4">🎯</div>
            <CardTitle className="text-4xl bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
              Your Professional Thinking Profile
            </CardTitle>
            <CardDescription className="text-xl text-slate-700">
              {userName}, discover your unique professional strengths and career pathways
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Professional Profile */}
        <Card className="border-3 border-slate-300 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-3">
              <span className="text-3xl">{dominantStyleInfo.emoji}</span>
              Your Profile: {professionalProfile}
            </CardTitle>
            <CardDescription className="text-slate-100 text-base mt-1">
              {dominantStyleInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Your Professional Strengths:
                </h3>
                <ul className="space-y-2">
                  {dominantStyleInfo.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-emerald-600 mt-0.5 font-bold">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-600" />
                  Professional Development Tips:
                </h3>
                <ul className="space-y-2">
                  {dominantStyleInfo.developmentTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-amber-600 mt-0.5">💡</span>
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
          <Card className="border-2 border-slate-300 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Professional Thinking Distribution</CardTitle>
              <CardDescription>Your profile across all four thinking dimensions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} />
                  <Radar name="Your Score" dataKey="score" stroke="#334155" fill="#64748b" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-300 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Comparative Strengths</CardTitle>
              <CardDescription>How your thinking styles compare</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#334155', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#334155', fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#64748b" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* TOP CAREER PATH RECOMMENDATIONS */}
        <Card className="border-4 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="h-8 w-8 text-amber-700" />
              <CardTitle className="text-2xl text-slate-900">
                💼 Your Top Career Path Recommendations
              </CardTitle>
            </div>
            <CardDescription className="text-base text-slate-700">
              Based on your professional thinking profile, these career paths align best with your strengths
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {topCareerPaths.map((career, index) => (
              <Card key={index} className="border-2 border-amber-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg px-3 py-1">
                        #{index + 1}
                      </Badge>
                      <CardTitle className="text-xl text-slate-900">{career.name}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-base text-slate-700">
                    {career.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Why it fits */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-slate-700" />
                      Aligned with Your Thinking Style:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {career.thinkingStyles.map((style, idx) => {
                        const styleKey = style as keyof typeof adultThinkingStyles;
                        const styleInfo = adultThinkingStyles[styleKey];
                        return (
                          <Badge key={idx} className="bg-white border-2" style={{ borderColor: styleInfo.color, color: styleInfo.color }}>
                            {styleInfo.emoji} {styleInfo.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Industries */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      Key Industries:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {career.industries.map((industry, idx) => (
                        <Badge key={idx} variant="outline" className="bg-blue-50 border-blue-300 text-blue-900">
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Salary Range */}
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                    <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      Average Salary Range:
                    </h4>
                    <p className="text-emerald-800 font-bold">{career.averageSalaryRange}</p>
                  </div>

                  {/* Key Skills */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-purple-600" />
                      Key Skills Required:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {career.keySkills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-purple-50 text-purple-900">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Career Progression */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2 text-sm">Career Progression Path:</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      {career.careerProgression.map((stage, idx) => (
                        <React.Fragment key={idx}>
                          <Badge variant="outline" className="bg-slate-50 border-slate-300 text-slate-900 text-xs">
                            {stage}
                          </Badge>
                          {idx < career.careerProgression.length - 1 && (
                            <span className="text-slate-400">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Growth Opportunities */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
                    <h4 className="font-semibold text-slate-900 mb-2 text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-yellow-700" />
                      Growth Opportunities:
                    </h4>
                    <ul className="space-y-1">
                      {career.growthOpportunities.map((opportunity, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="text-yellow-600 mt-0.5">•</span>
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Professional Insights */}
        <div className="grid md:grid-cols-3 gap-6">
          {insights.strengths.length > 0 && (
            <Card className="border-2 border-emerald-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-emerald-600 mt-0.5 font-bold">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {insights.recommendations.length > 0 && (
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  Career Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {insights.developmentAreas.length > 0 && (
            <Card className="border-2 border-amber-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-amber-600" />
                  Development Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.developmentAreas.map((area, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">💡</span>
                      {area}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={onReturnToDashboard}
            className="flex-1 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white shadow-lg py-6 text-base"
          >
            <Home className="mr-2 h-5 w-5" />
            Return to Dashboard
          </Button>
          <Button
            onClick={onShareResults}
            variant="outline"
            className="flex-1 border-2 border-slate-300 hover:bg-slate-50 py-6 text-base"
          >
            <Share2 className="mr-2 h-5 w-5" />
            Share Results
          </Button>
        </div>
      </div>
    </div>
  );
}
