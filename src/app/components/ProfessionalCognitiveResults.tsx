import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ProfessionalCognitiveProfile, getProfessionalInsights } from '../utils/professionalCognitiveScoring';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { Download, ArrowLeft, CheckCircle2, Target, TrendingUp, Briefcase, MessageSquare, ExternalLink, Brain, Lightbulb, Scale } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';

interface ProfessionalCognitiveResultsProps {
  profile: ProfessionalCognitiveProfile;
  userName: string;
  userPosition?: string;
  userLocation?: string;
  onBack: () => void;
}

export function ProfessionalCognitiveResults({ 
  profile, 
  userName, 
  userPosition = 'Professional',
  userLocation = '',
  onBack 
}: ProfessionalCognitiveResultsProps) {
  
  const insights = getProfessionalInsights(profile);
  
  // Prepare radar chart data for learning
  const learningRadarData = [
    { dimension: 'Experiential', value: profile.learning.score >= 24 ? 90 : profile.learning.score >= 18 ? 60 : 30 },
    { dimension: 'Reflective', value: profile.learning.score >= 18 && profile.learning.score < 24 ? 90 : 50 },
    { dimension: 'Conceptual', value: profile.learning.score >= 12 && profile.learning.score < 18 ? 90 : 40 },
    { dimension: 'Practical', value: profile.learning.score >= 24 ? 85 : 55 },
  ];
  
  // Prepare gauge data for thinking (split between creative and analytical)
  const thinkingGaugeValue = profile.thinking.style.includes('Creative–Analytical') ? 50 :
                              profile.thinking.style === 'Analytical Thinker' ? 75 :
                              profile.thinking.style === 'Creative Thinker' ? 25 : 50;
  
  // Prepare bar chart data for decision-making
  const decisionBarData = [
    { 
      factor: 'Intuitive', 
      value: profile.decisionMaking.style === 'Intuitive Decision Maker' ? 85 : 
             profile.decisionMaking.style === 'Balanced Decision Maker' ? 70 : 40 
    },
    { 
      factor: 'Analytical', 
      value: profile.decisionMaking.style === 'Reflective Decision Maker' ? 85 : 
             profile.decisionMaking.style === 'Balanced Decision Maker' ? 70 : 40 
    },
    { 
      factor: 'Collaborative', 
      value: profile.decisionMaking.style === 'Balanced Decision Maker' ? 75 : 55 
    },
    { 
      factor: 'Decisive', 
      value: profile.decisionMaking.score >= 24 ? 80 : profile.decisionMaking.score >= 18 ? 60 : 40 
    },
  ];
  
  // Competency mapping
  const competencies = [
    {
      competency: 'Strategic Vision',
      cognitiveLink: profile.learning.style,
      fit: profile.learning.score >= 20 ? 'excellent' : profile.learning.score >= 15 ? 'strong' : 'moderate'
    },
    {
      competency: 'Innovation & Creativity',
      cognitiveLink: profile.thinking.style,
      fit: profile.thinking.score >= 24 ? 'excellent' : profile.thinking.score >= 18 ? 'strong' : 'moderate'
    },
    {
      competency: 'Decision-Making Effectiveness',
      cognitiveLink: profile.decisionMaking.style,
      fit: profile.decisionMaking.score >= 24 ? 'excellent' : profile.decisionMaking.score >= 18 ? 'strong' : 'moderate'
    },
    {
      competency: 'Analytical Problem Solving',
      cognitiveLink: profile.thinking.style.includes('Analytical') ? 'Analytical Thinking' : 'Developing',
      fit: profile.thinking.style.includes('Analytical') ? 'excellent' : 'moderate'
    },
  ];
  
  const getFitBadge = (fit: string) => {
    const variants = {
      excellent: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-200 border-green-200 dark:border-green-700',
      strong: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-700',
      moderate: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-200 border-orange-200 dark:border-orange-700',
    };
    
    return <Badge className={`${variants[fit as keyof typeof variants] || variants.moderate} border`}>
      {fit === 'excellent' ? '✓ Excellent' : 
       fit === 'strong' ? '✓ Strong' : 
       '⚙ Moderate'}
    </Badge>;
  };

  const handleDownload = () => {
    // Create a mock assessment object for PDF generation
    const mockAssessment = {
      id: `prof-cog-${Date.now()}`,
      type: 'professional-cognitive' as const,
      userId: '',
      completedAt: new Date().toISOString(),
      responses: [],
      score: {
        total: profile.matchScore,
        professionalCognitive: profile
      }
    };
    
    generatePDF(mockAssessment, userName, null, true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="shadow-soft">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button onClick={handleDownload} className="shadow-soft bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>

        {/* Main Report Card */}
        <Card className="border-2 shadow-large">
          {/* Header - Profile Summary */}
          <CardHeader className="border-b bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-gray-800 dark:to-gray-800 pb-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-[#6B4C9A] via-[#7B61FF] to-[#5B7DB1] bg-clip-text text-transparent">
                    JotMinds
                  </h1>
                  <Badge variant="secondary" className="text-xs">Professional Cognitive Assessment</Badge>
                </div>
                <CardTitle className="text-3xl sm:text-4xl mb-2">{userName}</CardTitle>
                <CardDescription className="text-base sm:text-lg">
                  {userPosition}{userLocation && ` · ${userLocation}`}
                </CardDescription>
                <p className="text-sm text-muted-foreground mt-2">
                  {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-5xl sm:text-6xl font-bold text-[#5B7DB1] dark:text-[#7B61FF] mb-1">
                  {profile.matchScore}%
                </div>
                <p className="text-sm text-muted-foreground">Overall Profile Match</p>
              </div>
            </div>
            
            {/* Executive Summary */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 border-2 border-violet-200 dark:border-violet-700">
              <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                <strong className="text-[#5B7DB1] dark:text-[#7B61FF]">{profile.overallProfile}</strong> — {profile.summary}
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-8 space-y-8">
            {/* Three Core Dimensions */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Learning Style - Radar Chart */}
              <Card className="border-2 border-cyan-200 dark:border-cyan-700 bg-gradient-to-br from-cyan-50/50 to-white dark:from-cyan-900/10 dark:to-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-[#6B4C9A]" />
                    <CardTitle className="text-lg text-[#6B4C9A] dark:text-cyan-300">Learning Preferences</CardTitle>
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{profile.learning.style}</div>
                  <Badge variant="outline" className="text-xs w-fit">{profile.learning.anchors}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {profile.learning.description}
                  </p>
                  
                  {/* Radar Chart */}
                  <div className="h-48 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={learningRadarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis 
                          dataKey="dimension" 
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 100]}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                        />
                        <Radar 
                          dataKey="value" 
                          stroke="#6B4C9A" 
                          fill="#6B4C9A"
                          fillOpacity={0.4}
                          strokeWidth={2}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#374151',
                            color: '#ffffff',
                            border: '1px solid #4B5563',
                            borderRadius: '8px'
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="text-center pt-2">
                    <div className="text-2xl font-bold text-[#6B4C9A] dark:text-cyan-300">{profile.learning.score}/30</div>
                    <div className="text-xs text-muted-foreground">Learning Score</div>
                  </div>
                </CardContent>
              </Card>

              {/* Thinking Style - Gauge/Spectrum */}
              <Card className="border-2 border-violet-200 dark:border-violet-700 bg-gradient-to-br from-violet-50/50 to-white dark:from-violet-900/10 dark:to-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-[#7B61FF]" />
                    <CardTitle className="text-lg text-[#7B61FF] dark:text-violet-300">Thinking Orientation</CardTitle>
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{profile.thinking.style}</div>
                  <Badge variant="outline" className="text-xs w-fit">{profile.thinking.anchors}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {profile.thinking.description}
                  </p>
                  
                  {/* Gauge visualization */}
                  <div className="py-6">
                    <div className="relative h-32">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-[#7B61FF] dark:text-violet-300">
                            {profile.thinking.style.includes('Creative–Analytical') ? '⚖️' : 
                             profile.thinking.style.includes('Analytical') ? '🔬' : '💡'}
                          </div>
                        </div>
                      </div>
                      {/* Spectrum bar */}
                      <div className="absolute bottom-0 left-0 right-0">
                        <div className="text-xs flex justify-between mb-1 text-muted-foreground">
                          <span>Creative</span>
                          <span>Analytical</span>
                        </div>
                        <div className="h-3 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full relative">
                          <div 
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-2 border-[#7B61FF] rounded-full shadow-lg"
                            style={{ left: `${thinkingGaugeValue}%`, marginLeft: '-8px' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center pt-2">
                    <div className="text-2xl font-bold text-[#7B61FF] dark:text-violet-300">{profile.thinking.score}/30</div>
                    <div className="text-xs text-muted-foreground">Thinking Score</div>
                  </div>
                </CardContent>
              </Card>

              {/* Decision-Making Style - Bar Chart */}
              <Card className="border-2 border-indigo-200 dark:border-indigo-700 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-900/10 dark:to-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="h-5 w-5 text-[#5B7DB1]" />
                    <CardTitle className="text-lg text-[#5B7DB1] dark:text-indigo-300">Decision-Making Behavior</CardTitle>
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{profile.decisionMaking.style}</div>
                  <Badge variant="outline" className="text-xs w-fit">{profile.decisionMaking.anchors}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {profile.decisionMaking.description}
                  </p>
                  
                  {/* Bar Chart */}
                  <div className="h-48 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={decisionBarData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <YAxis 
                          dataKey="factor" 
                          type="category" 
                          width={80} 
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#374151',
                            color: '#ffffff',
                            border: '1px solid #4B5563',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="value" fill="#5B7DB1" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="text-center pt-2">
                    <div className="text-2xl font-bold text-[#5B7DB1] dark:text-indigo-300">{profile.decisionMaking.score}/30</div>
                    <div className="text-xs text-muted-foreground">Decision Score</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Insights */}
            {insights.strengths.length > 0 && (
              <Card className="border-2 border-green-200 dark:border-green-700 bg-gradient-to-br from-green-50/30 to-white dark:from-green-900/10 dark:to-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Key Insights
                  </CardTitle>
                  <CardDescription>Your cognitive strengths and advantages</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {insights.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Competency Fit Summary */}
            <Card className="border-2 border-violet-200 dark:border-violet-700">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Target className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  Competency Fit Summary
                </CardTitle>
                <CardDescription>How cognitive strengths align with key role competencies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-violet-200 dark:border-violet-700">
                        <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Competency</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Cognitive Link</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Fit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competencies.map((comp, index) => (
                        <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-violet-50/50 dark:hover:bg-violet-900/10">
                          <td className="py-3 px-2 font-medium text-gray-900 dark:text-gray-100">{comp.competency}</td>
                          <td className="py-3 px-2 text-gray-600 dark:text-gray-400">{comp.cognitiveLink}</td>
                          <td className="py-3 px-2">{getFitBadge(comp.fit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Development Tips */}
            {insights.recommendations.length > 0 && (
              <Card className="border-2 border-blue-200 dark:border-blue-700 bg-gradient-to-br from-blue-50/30 to-white dark:from-blue-900/10 dark:to-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Development Tips
                  </CardTitle>
                  <CardDescription>Personalized recommendations for continuous growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {insights.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">{index + 1}</span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Ideal Roles */}
            {insights.idealRoles.length > 0 && (
              <Card className="border-2 border-purple-200 dark:border-purple-700 bg-gradient-to-br from-purple-50/30 to-white dark:from-purple-900/10 dark:to-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    Ideal Roles & Career Paths
                  </CardTitle>
                  <CardDescription>Positions that align with your cognitive profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {insights.idealRoles.map((role, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-sm px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Feedback Prompt */}
        <Card className="border-2 border-[#6B4C9A] dark:border-cyan-700 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-cyan-900/20 dark:to-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#6B4C9A]" />
              Help Us Improve JotMinds
            </CardTitle>
            <CardDescription>
              Your feedback is invaluable! Share your experience to help us make JotMinds better for everyone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => window.open('https://forms.gle/SXPFj29PxUbmYVQq7', '_blank')}
              className="w-full bg-gradient-to-r from-[#6B4C9A] to-[#5B7DB1] hover:from-[#1AB5CC] hover:to-[#252770]"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Share Your Feedback
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Takes less than 3 minutes • Completely anonymous
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
