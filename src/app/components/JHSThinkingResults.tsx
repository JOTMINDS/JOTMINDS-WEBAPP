import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Sparkles, 
  TrendingUp, 
  BookOpen, 
  Share2, 
  Download,
  Brain,
  Target,
  Lightbulb,
  Trophy,
  Compass,
  X,
  GraduationCap,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { JHSResults } from '../utils/jhsScoring';
import { THINKING_STYLES, SHS_PROGRAMS, MOTIVATION_MESSAGES, CAREER_PATHS, Career } from '../utils/jhsThinkingData';
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
  Cell
} from 'recharts';

interface JHSThinkingResultsProps {
  results: JHSResults;
  userName: string;
  onReturnToDashboard: () => void;
  onShareWithParent?: () => void;
}

export function JHSThinkingResults({ 
  results, 
  userName,
  onReturnToDashboard,
  onShareWithParent 
}: JHSThinkingResultsProps) {
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [openChallenges, setOpenChallenges] = useState<{[key: number]: boolean}>({});
  const [showCareerExplorer, setShowCareerExplorer] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

  const primaryStyle = THINKING_STYLES[results.primaryStyle];
  const secondaryStyle = THINKING_STYLES[results.secondaryStyle];
  
  // Prepare chart data
  const radarData = Object.entries(results.percentages).map(([key, value]) => ({
    style: THINKING_STYLES[key].name,
    score: value,
    fullMark: 100
  }));

  const barData = Object.entries(results.scores).map(([key, value]) => ({
    name: THINKING_STYLES[key].name,
    score: value,
    percentage: results.percentages[key as keyof typeof results.percentages],
    emoji: THINKING_STYLES[key].emoji,
    color: THINKING_STYLES[key].color
  }));

  // Get SHS recommendations
  const getRecommendations = () => {
    const primaryPrograms = SHS_PROGRAMS[results.primaryStyle] || [];
    return primaryPrograms.slice(0, 3);
  };

  const recommendations = getRecommendations();

  // Random motivation message
  const motivationMessage = MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto py-8 space-y-6">
        
        {/* Header Card */}
        <Card className="border-4" style={{ borderColor: primaryStyle.color }}>
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-lg"
                style={{ backgroundColor: `${primaryStyle.color}20` }}
              >
                {primaryStyle.emoji}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-2">🎉 Your Thinking Style Power Mix!</div>
              <CardTitle className="text-3xl mb-2" style={{ color: primaryStyle.color }}>
                {results.personalityType}
              </CardTitle>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                {results.profileType === 'dual' ? (
                  <>
                    You're a <strong>{primaryStyle.name}</strong> thinker with strong <strong>{secondaryStyle.name}</strong> skills! 
                    {primaryStyle.name === 'Creative' && secondaryStyle.name === 'Analytical' && (
                      <> You love new ideas AND use logic to test them — a true "Smart Inventor!" 🎨🔍</>
                    )}
                    {primaryStyle.name === 'Practical' && secondaryStyle.name === 'Reflective' && (
                      <> You get things done AND think deeply about your choices — a true "Thoughtful Doer!" 🛠️💭</>
                    )}
                    {primaryStyle.name === 'Creative' && secondaryStyle.name === 'Reflective' && (
                      <> You imagine boldly AND understand people deeply — a true "Empathetic Creator!" 🎨💭</>
                    )}
                  </>
                ) : results.profileType === 'balanced' ? (
                  <>
                    You're a <strong>Balanced Thinker</strong> — you can adapt to any situation and use all your thinking powers! 
                    This makes you incredibly flexible and well-rounded. 🌟
                  </>
                ) : (
                  <>
                    You're {primaryStyle.description} Your mind loves to {primaryStyle.name.toLowerCase()} thinking!
                  </>
                )}
              </p>
            </div>

            {/* Strength Badges */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              <Badge variant="secondary" className="text-base px-4 py-2">
                <Brain className="mr-2 h-4 w-4" />
                Primary: {primaryStyle.name} {primaryStyle.emoji}
              </Badge>
              {results.profileType !== 'balanced' && (
                <Badge variant="outline" className="text-base px-4 py-2">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Secondary: {secondaryStyle.name} {secondaryStyle.emoji}
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-1">
            <TabsTrigger value="breakdown" className="text-xs sm:text-sm flex items-center justify-center gap-1">
              <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Thinking Powers</span>
              <span className="sm:hidden">Powers</span>
            </TabsTrigger>
            <TabsTrigger value="programs" className="text-xs sm:text-sm flex items-center justify-center gap-1">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">School Programs</span>
              <span className="sm:hidden">Programs</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="text-xs sm:text-sm flex items-center justify-center gap-1">
              <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">How to Improve</span>
              <span className="sm:hidden">Tips</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Thinking Power Breakdown */}
          <TabsContent value="breakdown" className="space-y-6">
            
            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" style={{ color: primaryStyle.color }} />
                    Your Thinking Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis 
                        dataKey="style" 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                      />
                      <Radar
                        name="Thinking Power"
                        dataKey="score"
                        stroke={primaryStyle.color}
                        fill={primaryStyle.color}
                        fillOpacity={0.5}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" style={{ color: primaryStyle.color }} />
                    Thinking Power Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                      />
                      <YAxis 
                        domain={[0, 30]}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                      />
                      <Tooltip 
                        content={({ payload }) => {
                          if (!payload || !payload[0]) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 rounded-lg shadow-lg border-2">
                              <p className="font-semibold text-sm mb-1">
                                {data.emoji} {data.name}
                              </p>
                              <p className="text-sm text-gray-700">
                                Score: {data.score}/30 ({data.percentage}%)
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Your Thinking Power Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(results.scores).map(([key, score]) => {
                    const style = THINKING_STYLES[key];
                    const percentage = results.percentages[key as keyof typeof results.percentages];
                    const strengthLevel = results.strengthLevels[key];
                    
                    return (
                      <div 
                        key={key}
                        className="p-4 rounded-lg border-2"
                        style={{ borderColor: style.color, backgroundColor: `${style.color}05` }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-2xl mb-1">{style.emoji}</div>
                            <h4 className="font-bold" style={{ color: style.color }}>
                              {style.name} Thinking
                            </h4>
                            <p className="text-xs text-gray-600">{style.friendlyName}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold" style={{ color: style.color }}>
                              {percentage}%
                            </div>
                            <div className="text-xs text-gray-600">
                              {score}/30
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {style.description}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {strengthLevel}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: SHS Program Recommendations */}
          <TabsContent value="programs" className="space-y-6">
            
            {/* Header Message */}
            <Card className="bg-gradient-to-r from-blue-100 to-purple-100 border-2" style={{ borderColor: primaryStyle.color }}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{primaryStyle.emoji}</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: primaryStyle.color }}>
                      💡 Based on your Thinking Power mix, here's where your mind shines!
                    </h3>
                    <p className="text-gray-700">
                      You're great at {primaryStyle.name.toLowerCase()} thinking
                      {results.profileType === 'dual' && ` and ${secondaryStyle.name.toLowerCase()} thinking`} — 
                      that's a powerful mix for future innovators!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top 3 SHS Programs */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6" style={{ color: primaryStyle.color }} />
                🎓 Top 3 Suggested SHS Programs
              </h3>

              {recommendations.map((program, index) => (
                <Card 
                  key={index}
                  className="hover:shadow-lg transition-all cursor-pointer border-2"
                  style={{ 
                    borderColor: index === 0 ? primaryStyle.color : '#e5e7eb'
                  }}
                  onClick={() => setSelectedProgram(program)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Rank Badge */}
                      <div 
                        className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-md"
                        style={{ backgroundColor: `${primaryStyle.color}20` }}
                      >
                        {program.icon}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                              {index === 1 && <span className="text-gray-400">🥈</span>}
                              {index === 2 && <span className="text-gray-400">🥉</span>}
                              <h4 className="text-xl font-bold" style={{ color: primaryStyle.color }}>
                                {index + 1}. {program.name}
                              </h4>
                            </div>
                            
                            {/* Matching Styles */}
                            <div className="flex gap-2 mb-3">
                              {program.matchingStyles.map((styleKey: string) => (
                                <Badge 
                                  key={styleKey}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {THINKING_STYLES[styleKey].emoji} {THINKING_STYLES[styleKey].name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Why It Fits */}
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Compass className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: primaryStyle.color }} />
                            <p className="text-sm text-gray-700">
                              <strong className="text-gray-900">Why it fits your Thinking Power:</strong> {program.whyItFits}
                            </p>
                          </div>
                        </div>

                        {/* Future Careers */}
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 mb-1">
                            <strong>Possible future paths:</strong>
                          </p>
                          <p className="text-sm text-gray-700">
                            {program.futureCareers}
                          </p>
                        </div>

                        {/* Did You Know */}
                        {program.didYouKnow && (
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-900">
                              <Lightbulb className="h-3 w-3 inline mr-1" />
                              <strong>Did you know?</strong> {program.didYouKnow}
                            </p>
                          </div>
                        )}

                        {/* Mini Challenge */}
                        {program.miniChallenge && (
                          <div className="mt-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-xs"
                              style={{ borderColor: primaryStyle.color, color: primaryStyle.color }}
                              onClick={() => setOpenChallenges(prev => ({ ...prev, [index]: !prev[index] }))}
                            >
                              💬 Try this mini challenge!
                            </Button>
                            {openChallenges[index] && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                  {program.miniChallenge}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Future Fit Summary */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Compass className="h-8 w-8 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg mb-2 text-yellow-900">
                      🌟 Your Future Fit
                    </h4>
                    <p className="text-gray-800">
                      {results.profileType === 'dual' ? (
                        <>
                          You're a <strong>{results.personalityType}</strong> — your mix of {primaryStyle.name.toLowerCase()} 
                          and {secondaryStyle.name.toLowerCase()} thinking makes you perfect for programs like {
                            recommendations.map(r => r.name).slice(0, 2).join(', ')
                          }, or {recommendations[2]?.name}!
                        </>
                      ) : (
                        <>
                          Your <strong>{primaryStyle.name}</strong> thinking style makes you naturally talented for programs 
                          like {recommendations.map(r => r.name).slice(0, 2).join(' and ')}!
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Growth Tips */}
          <TabsContent value="tips" className="space-y-6">
            
            {/* Motivation Message */}
            <Card className="bg-gradient-to-r from-purple-100 to-pink-100">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-purple-900">
                      💡 Today's Brain Boost
                    </h4>
                    <p className="text-gray-800 italic">"{motivationMessage}"</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Growth Tips for Each Style */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">🌱 How to Grow Each Thinking Power</h3>

              {Object.entries(THINKING_STYLES).map(([key, style]) => {
                const score = results.scores[key as keyof typeof results.scores];
                const isStrong = score >= 24;
                const isGrowing = score >= 18 && score < 24;

                return (
                  <Card key={key} className="border-2" style={{ borderColor: style.color }}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{style.emoji}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-2" style={{ color: style.color }}>
                            {style.name} Thinking
                          </h4>
                          <p className="text-sm text-gray-700 mb-3">
                            {isStrong && `Great job! Your ${style.name.toLowerCase()} thinking is already strong. Keep using it daily!`}
                            {isGrowing && `You're developing your ${style.name.toLowerCase()} thinking skills. Practice more to make them even stronger!`}
                            {!isStrong && !isGrowing && `This is a growing area for you. Try small challenges to build this thinking power!`}
                          </p>

                          {/* Growth Activities */}
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-600">Quick activities to try:</p>
                            {key === 'creative' && (
                              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                                <li>Draw something new using only 3 shapes</li>
                                <li>Make up a story about your day</li>
                                <li>Think of 3 new uses for a common object</li>
                              </ul>
                            )}
                            {key === 'analytical' && (
                              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                                <li>Solve a riddle or brain teaser</li>
                                <li>Find patterns in numbers or shapes</li>
                                <li>Ask "why" 3 times about something you learned</li>
                              </ul>
                            )}
                            {key === 'practical' && (
                              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                                <li>Help fix or organize something at home</li>
                                <li>Plan your day step-by-step</li>
                                <li>Build something using everyday materials</li>
                              </ul>
                            )}
                            {key === 'reflective' && (
                              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                                <li>Think about what went well today and why</li>
                                <li>Write 3 things you're grateful for</li>
                                <li>Ask yourself "What did I learn from this?"</li>
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Interactive Extras */}
            <Card>
              <CardHeader>
                <CardTitle>🎮 Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline" onClick={() => setShowCareerExplorer(true)}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  📘 Career Explorer Mode
                </Button>
                <Button className="w-full" variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  🔁 Retake in 6 Months (Track Your Growth)
                </Button>
                <p className="text-xs text-gray-600 text-center">
                  Earn the "Future Planner Badge 🧭" after exploring all recommended programs!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-3">
              <Button 
                onClick={onReturnToDashboard}
                variant="outline"
                className="w-full"
              >
                Return to Dashboard
              </Button>
              
              {onShareWithParent && (
                <Button 
                  onClick={onShareWithParent}
                  variant="outline"
                  className="w-full"
                  style={{ borderColor: primaryStyle.color, color: primaryStyle.color }}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  💬 Share with Parent/Teacher
                </Button>
              )}
              
              <Button 
                variant="outline"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                ⭐ Save My Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Career Explorer Modal */}
      {showCareerExplorer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowCareerExplorer(false)}>
          <div className="bg-white rounded-xl max-w-6xl max-h-[90vh] overflow-y-auto w-full" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b-2 p-6 flex items-center justify-between" style={{ borderColor: primaryStyle.color }}>
              <div>
                <h2 className="text-3xl font-bold" style={{ color: primaryStyle.color }}>
                  🚀 Career Explorer Mode
                </h2>
                <p className="text-gray-600 mt-1">Explore careers that match your {primaryStyle.name} thinking style</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowCareerExplorer(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Career Cards Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {CAREER_PATHS[results.primaryStyle]?.map((career, index) => (
                  <Card 
                    key={index}
                    className="hover:shadow-xl transition-all cursor-pointer border-2"
                    style={{ borderColor: index === 0 ? primaryStyle.color : '#e5e7eb' }}
                    onClick={() => setSelectedCareer(career)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="text-5xl">{career.emoji}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2" style={{ color: primaryStyle.color }}>
                            {career.title}
                          </h3>
                          <p className="text-sm text-gray-700 mb-3">
                            {career.description}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {career.matchingStyles.map((styleKey: string) => (
                              <Badge key={styleKey} variant="secondary" className="text-xs">
                                {THINKING_STYLES[styleKey]?.emoji} {THINKING_STYLES[styleKey]?.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Also show careers from secondary style if dual type */}
              {results.profileType === 'dual' && results.secondaryStyle && (
                <>
                  <div className="border-t-2 pt-6" style={{ borderColor: secondaryStyle.color }}>
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="h-6 w-6" style={{ color: secondaryStyle.color }} />
                      Bonus: Careers for your {secondaryStyle.name} side
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {CAREER_PATHS[results.secondaryStyle]?.slice(0, 2).map((career, index) => (
                        <Card 
                          key={index}
                          className="hover:shadow-xl transition-all cursor-pointer border-2"
                          style={{ borderColor: '#e5e7eb' }}
                          onClick={() => setSelectedCareer(career)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="text-5xl">{career.emoji}</div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold mb-2" style={{ color: secondaryStyle.color }}>
                                  {career.title}
                                </h3>
                                <p className="text-sm text-gray-700 mb-3">
                                  {career.description}
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                  {career.matchingStyles.map((styleKey: string) => (
                                    <Badge key={styleKey} variant="secondary" className="text-xs">
                                      {THINKING_STYLES[styleKey]?.emoji} {THINKING_STYLES[styleKey]?.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Career Detail Modal */}
      {selectedCareer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedCareer(null)}>
          <div className="bg-white rounded-xl max-w-3xl max-h-[90vh] overflow-y-auto w-full" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b-2 p-6" style={{ borderColor: primaryStyle.color }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{selectedCareer.emoji}</div>
                  <div>
                    <h2 className="text-3xl font-bold" style={{ color: primaryStyle.color }}>
                      {selectedCareer.title}
                    </h2>
                    <p className="text-gray-600 mt-1">{selectedCareer.description}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedCareer(null)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* What You Do */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" style={{ color: primaryStyle.color }} />
                    What You'll Do
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedCareer.whatYouDo.map((task, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-gray-700">{task}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Skills Needed */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" style={{ color: primaryStyle.color }} />
                    Skills You'll Need
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {selectedCareer.skillsNeeded.map((skill, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Education Path */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" style={{ color: primaryStyle.color }} />
                    Your Education Journey
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-800">{selectedCareer.educationPath}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Salary Range */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" style={{ color: primaryStyle.color }} />
                    Potential Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-gray-800 font-semibold">{selectedCareer.salaryRange}</p>
                    <p className="text-xs text-gray-600 mt-1">* Actual salaries vary based on experience, location, and employer</p>
                  </div>
                </CardContent>
              </Card>

              {/* Fun Fact */}
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold mb-1 text-yellow-900">💡 Fun Fact</h4>
                      <p className="text-gray-800">{selectedCareer.funFact}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Matching Styles */}
              <div className="flex items-center justify-center gap-2 pt-4">
                <span className="text-sm text-gray-600">Best for:</span>
                {selectedCareer.matchingStyles.map((styleKey: string) => (
                  <Badge key={styleKey} variant="secondary" style={{ backgroundColor: `${THINKING_STYLES[styleKey]?.color}20` }}>
                    {THINKING_STYLES[styleKey]?.emoji} {THINKING_STYLES[styleKey]?.name} thinkers
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}