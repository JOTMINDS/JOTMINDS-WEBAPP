import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Assessment } from '../types';
import { getStyleDescription } from '../utils/scoring';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Download, ArrowLeft, CheckCircle2, AlertCircle, Settings, MessageSquare, ExternalLink } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { getAssessmentInsights } from '../utils/insights';
import { formatDate } from '../utils/dateFormat';

interface CompetencyFit {
  competency: string;
  cognitiveLink: string;
  fit: 'excellent' | 'strong' | 'moderate' | 'developing';
}

interface ProfessionalAssessmentReportProps {
  assessment: Assessment;
  userName: string;
  userPosition?: string;
  userOrganization?: string;
  onBack: () => void;
}

export function ProfessionalAssessmentReport({ 
  assessment, 
  userName, 
  userPosition = 'Professional',
  userOrganization = 'Organization',
  onBack 
}: ProfessionalAssessmentReportProps) {
  
  const handleDownloadPDF = async () => {
    await generatePDF(assessment, userName, null, true);
    toast.success('PDF downloaded successfully!');
  };

  // Get all three assessments if available
  const kolbStyle = assessment.score.kolb?.style || 'N/A';
  const sternbergStyle = assessment.score.sternberg?.style || 'N/A';
  const dualProcessStyle = assessment.score.dualProcess?.style || 'N/A';

  const getOverallCognitiveProfile = (): string => {
    const parts: string[] = [];
    
    if (assessment.score.sternberg) {
      parts.push(assessment.score.sternberg.style);
    }
    if (assessment.score.kolb) {
      const kolbSimplified = assessment.score.kolb.style.replace('ing', '').toLowerCase();
      parts.push(kolbSimplified);
    }
    if (assessment.score.dualProcess) {
      parts.push(assessment.score.dualProcess.style.toLowerCase());
    }

    return parts.join('–') || 'Comprehensive';
  };

  const getDetailedProfileDescription = (): string => {
    const kolbDesc = assessment.score.kolb ? getStyleDescription(assessment.score.kolb.style, 'kolb').split('.')[0] : '';
    const sternbergDesc = assessment.score.sternberg ? getStyleDescription(assessment.score.sternberg.style, 'sternberg').split('.')[0] : '';
    const dualDesc = assessment.score.dualProcess ? getStyleDescription(assessment.score.dualProcess.style, 'dual-process').split('.')[0] : '';
    
    return `${sternbergDesc} ${kolbDesc ? '— ' + kolbDesc.toLowerCase() : ''} ${dualDesc ? 'with ' + dualDesc.toLowerCase() : ''}`;
  };

  const getRadarData = () => {
    if (!assessment.score.kolb) return [];
    
    const scores = assessment.score.kolb.scores;
    return [
      { name: 'Concrete\nExperience', value: scores.CE, fullMark: 40 },
      { name: 'Reflective\nObservation', value: scores.RO, fullMark: 40 },
      { name: 'Abstract\nConceptualization', value: scores.AC, fullMark: 40 },
      { name: 'Active\nExperimentation', value: scores.AE, fullMark: 40 },
    ];
  };

  const getCompetencyMapping = (): CompetencyFit[] => {
    const competencies: CompetencyFit[] = [];

    // Map based on Kolb learning style
    if (assessment.score.kolb) {
      const { AC, AE, CE, RO } = assessment.score.kolb.scores;
      
      if (AC > 25) {
        competencies.push({
          competency: 'Strategic Vision',
          cognitiveLink: 'Abstract Conceptualization',
          fit: AC > 30 ? 'excellent' : 'strong'
        });
      }
      
      if (AE > 25) {
        competencies.push({
          competency: 'Execution Focus',
          cognitiveLink: 'Active Experimentation',
          fit: AE > 30 ? 'excellent' : 'strong'
        });
      }
    }

    // Map based on Sternberg thinking style
    if (assessment.score.sternberg) {
      const { creative, analytical, practical } = assessment.score.sternberg.scores;
      
      if (creative > 25) {
        competencies.push({
          competency: userPosition.toLowerCase().includes('marketing') ? 'Innovation & Brand Leadership' : 'Innovation & Creativity',
          cognitiveLink: 'Creative Thinking',
          fit: creative > 35 ? 'excellent' : 'strong'
        });
      }
      
      if (analytical > 25) {
        competencies.push({
          competency: userPosition.toLowerCase().includes('marketing') ? 'Analytical Marketing' : 'Data Analysis & Problem Solving',
          cognitiveLink: 'Analytical Thinking',
          fit: analytical > 35 ? 'excellent' : 'strong'
        });
      }
      
      if (practical > 25) {
        competencies.push({
          competency: 'Practical Implementation',
          cognitiveLink: 'Practical Thinking',
          fit: practical > 35 ? 'excellent' : 'strong'
        });
      }
    }

    // Map based on decision-making style
    if (assessment.score.dualProcess) {
      const { system1, system2 } = assessment.score.dualProcess.scores;
      const isBalanced = Math.abs(system1 - system2) < 10;
      
      competencies.push({
        competency: 'Decision-Making Effectiveness',
        cognitiveLink: isBalanced ? 'Balanced (Intuitive + Analytical)' : system1 > system2 ? 'Intuitive Decision-Making' : 'Analytical Decision-Making',
        fit: isBalanced ? 'excellent' : 'moderate'
      });
    }

    return competencies;
  };

  const getLearningStyleDetail = (): string => {
    if (!assessment.score.kolb) return 'Not assessed';
    
    const { AC, AE, CE, RO, scores } = assessment.score.kolb;
    const dominantDimensions: string[] = [];
    const avg = (AC + AE + CE + RO) / 4;
    
    if (AC > avg) dominantDimensions.push('Abstract Conceptualization');
    if (AE > avg) dominantDimensions.push('Active Experimentation');
    if (CE > avg) dominantDimensions.push('Concrete Experience');
    if (RO > avg) dominantDimensions.push('Reflective Observation');
    
    return dominantDimensions.join(' + ');
  };

  const getThinkingStyleDetail = (): string => {
    if (!assessment.score.sternberg) return 'Not assessed';
    
    const { creative, analytical, practical } = assessment.score.sternberg.scores;
    const styles: string[] = [];
    const avg = (creative + analytical + practical) / 3;
    
    if (creative > avg) styles.push('Creative');
    if (analytical > avg) styles.push('Analytical');
    if (practical > avg) styles.push('Practical');
    
    return styles.join(' + ') || assessment.score.sternberg.style;
  };

  const getKeyInsights = () => {
    const insights: string[] = [];
    
    // Learning insights
    if (assessment.score.kolb) {
      const { AC, AE, CE, RO } = assessment.score.kolb.scores;
      if (AC > 30 && AE > 30) {
        insights.push('Strategic conceptualization with strong execution — ideal for leadership roles');
      }
      if (CE > 30 && RO > 30) {
        insights.push('Strong people skills and empathy — excellent for team leadership and coaching');
      }
    }
    
    // Thinking insights
    if (assessment.score.sternberg) {
      const { creative, analytical } = assessment.score.sternberg.scores;
      if (creative > 30 && analytical > 30) {
        insights.push('Rare balance of creativity with analytical rigor — data-driven innovation');
      }
    }
    
    // Decision-making insights
    if (assessment.score.dualProcess) {
      const { system1, system2 } = assessment.score.dualProcess.scores;
      if (Math.abs(system1 - system2) < 10) {
        insights.push('Adaptable decision-making — uses both intuition and analysis contextually');
      }
    }
    
    return insights;
  };

  const getDevelopmentNeeds = () => {
    const needs: string[] = [];
    
    if (assessment.score.kolb) {
      const { AC, AE, CE, RO } = assessment.score.kolb.scores;
      const min = Math.min(AC, AE, CE, RO);
      
      if (CE === min && CE < 20) {
        needs.push('Develop empathy and people skills through customer interaction');
      }
      if (RO === min && RO < 20) {
        needs.push('Strengthen reflective practices and patience in decision-making');
      }
      if (AC === min && AC < 20) {
        needs.push('Build strategic thinking and conceptual planning capabilities');
      }
      if (AE === min && AE < 20) {
        needs.push('Improve bias toward action and practical experimentation');
      }
    }
    
    if (assessment.score.sternberg) {
      const { creative, analytical, practical } = assessment.score.sternberg.scores;
      const min = Math.min(creative, analytical, practical);
      
      if (creative === min && creative < 25) {
        needs.push('Foster creative thinking through design thinking workshops');
      }
      if (analytical === min && analytical < 25) {
        needs.push('Strengthen analytical skills with data literacy training');
      }
      if (practical === min && practical < 25) {
        needs.push('Enhance practical application through hands-on projects');
      }
    }
    
    return needs;
  };

  const getDevelopmentRecommendations = () => {
    const recommendations: string[] = [];
    
    // Personalized recommendations based on cognitive profile
    if (assessment.score.sternberg?.style === 'Creative' && assessment.score.kolb?.style === 'Accommodating') {
      recommendations.push('Pair with an analytical team member for campaign performance tracking and optimization');
      recommendations.push('Encourage experimentation with new channels — learns fastest through testing and iteration');
    } else if (assessment.score.sternberg?.style === 'Analytical') {
      recommendations.push('Balance analytical depth with creative brainstorming sessions');
      recommendations.push('Practice rapid prototyping to complement thorough analysis');
    }
    
    // Learning style recommendations
    if (assessment.score.kolb) {
      const { AC, AE } = assessment.score.kolb.scores;
      if (AC > 30 && AE > 30) {
        recommendations.push('Leverage strategic planning abilities before diving into execution');
      }
    }
    
    // Generic professional development
    if (recommendations.length === 0) {
      recommendations.push('Continue developing both technical and interpersonal competencies');
      recommendations.push('Seek cross-functional projects to broaden cognitive flexibility');
    }
    
    return recommendations;
  };

  const radarData = getRadarData();
  const competencies = getCompetencyMapping();
  const keyInsights = getKeyInsights();
  const developmentNeeds = getDevelopmentNeeds();
  const developmentRecommendations = getDevelopmentRecommendations();

  const getFitIcon = (fit: CompetencyFit['fit']) => {
    switch (fit) {
      case 'excellent':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'strong':
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
      case 'moderate':
        return <Settings className="h-5 w-5 text-orange-500" />;
      case 'developing':
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getFitBadge = (fit: CompetencyFit['fit']) => {
    const variants = {
      excellent: 'bg-green-100 text-green-700 border-green-200',
      strong: 'bg-blue-100 text-blue-700 border-blue-200',
      moderate: 'bg-orange-100 text-orange-700 border-orange-200',
      developing: 'bg-gray-100 text-gray-600 border-gray-200'
    };
    
    return <Badge className={`${variants[fit]} border`}>
      {fit === 'excellent' ? '✓ Excellent' : 
       fit === 'strong' ? '✓ Strong' : 
       fit === 'moderate' ? '⚙ Moderate' : 
       '○ Developing'}
    </Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-violet-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="shadow-soft">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button onClick={handleDownloadPDF} className="shadow-soft bg-gradient-aqua-violet text-white hover:opacity-90">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* Main Report Card */}
        <Card className="border-2 shadow-large">
          {/* Header */}
          <CardHeader className="border-b bg-gradient-to-br from-indigo-50 to-violet-50 pb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-[#6B4C9A] via-[#7B61FF] to-[#5B7DB1] bg-clip-text text-transparent">
                    JotMinds
                  </h1>
                  <Badge variant="secondary" className="text-xs">Professional Report</Badge>
                </div>
                <CardTitle className="text-3xl mb-1">{userName}</CardTitle>
                <CardDescription className="text-base">
                  {userPosition} • {userOrganization}
                </CardDescription>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(assessment.completedAt)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-[#5B7DB1] mb-1">87%</div>
                <p className="text-sm text-muted-foreground">Overall Profile Match</p>
              </div>
            </div>
            
            {/* Executive Summary */}
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border-2 border-violet-200">
              <p className="text-base text-gray-700 leading-relaxed">
                <strong className="text-[#5B7DB1]">{getOverallCognitiveProfile()}</strong> — {getDetailedProfileDescription()}. 
                Ideal for {userPosition.toLowerCase().includes('marketing') ? 'marketing strategy and leadership roles' : 'strategic leadership positions'}.
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-8 space-y-8">
            {/* Three Core Assessments */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Learning Style */}
              {assessment.score.kolb && (
                <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50/50 to-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-[#6B4C9A]">Learning Style</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="font-semibold text-gray-900">{getLearningStyleDetail()}</div>
                    <p className="text-sm text-[rgb(52,52,52)]">
                      {assessment.score.kolb.style === 'Converging' && 'Learns best by combining conceptual planning with practical testing. Thinks strategically, applies ideas quickly.'}
                      {assessment.score.kolb.style === 'Diverging' && 'Learns through experience and reflection. Excels at viewing situations from multiple perspectives.'}
                      {assessment.score.kolb.style === 'Assimilating' && 'Prefers abstract concepts and logical reasoning. Strong at theoretical framework development.'}
                      {assessment.score.kolb.style === 'Accommodating' && 'Hands-on learner who excels through direct experience and experimentation.'}
                    </p>
                    
                    {radarData.length > 0 && (
                      <div className="h-64 -mx-2 mx-[-16px] my-[19px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis 
                              dataKey="name" 
                              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                              stroke="hsl(var(--border))"
                            />
                            <PolarRadiusAxis 
                              angle={90} 
                              domain={[0, 40]}
                              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                            />
                            <Radar 
                              dataKey="value" 
                              stroke="#6B4C9A" 
                              fill="#6B4C9A"
                              fillOpacity={0.3}
                              strokeWidth={2}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#374151',
                                color: '#ffffff',
                                border: '1px solid #4B5563',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Thinking Style */}
              {assessment.score.sternberg && (
                <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50/50 to-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-[#7B61FF]">Thinking Style</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="font-semibold text-gray-900">{getThinkingStyleDetail()}</div>
                    <p className="text-sm text-[rgb(56,54,54)]">
                      {assessment.score.sternberg.scores.creative > 30 && assessment.score.sternberg.scores.analytical > 30 
                        ? 'Balances original thinking with logical reasoning. Integrates creativity with data-driven insights for innovative yet measurable outcomes.'
                        : assessment.score.sternberg.style === 'Creative'
                        ? 'Excels at generating novel solutions and thinking outside conventional boundaries.'
                        : assessment.score.sternberg.style === 'Analytical'
                        ? 'Thrives on logical analysis, critical evaluation, and systematic problem-solving.'
                        : 'Focuses on practical application and real-world implementation of ideas.'}
                    </p>
                    
                    {/* Bar visualization */}
                    <div className="space-y-2 pt-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Creative</span>
                          <span className="font-semibold">{assessment.score.sternberg.scores.creative}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#7B61FF] to-[#6B4C9A] transition-all"
                            style={{ width: `${(assessment.score.sternberg.scores.creative / 48) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Analytical</span>
                          <span className="font-semibold">{assessment.score.sternberg.scores.analytical}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#5B7DB1] to-[#7B61FF] transition-all"
                            style={{ width: `${(assessment.score.sternberg.scores.analytical / 48) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Practical</span>
                          <span className="font-semibold">{assessment.score.sternberg.scores.practical}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#FF715B] to-[#5B7DB1] transition-all"
                            style={{ width: `${(assessment.score.sternberg.scores.practical / 48) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Decision-Making Style */}
              {assessment.score.dualProcess && (
                <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-[#5B7DB1]">Decision-Making Style</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="font-semibold text-gray-900">{assessment.score.dualProcess.style}</div>
                    <p className="text-sm text-[rgb(25,25,25)]">
                      {Math.abs(assessment.score.dualProcess.scores.system1 - assessment.score.dualProcess.scores.system2) < 10
                        ? 'Shows a healthy balance across all domains — learns quickly, thinks critically, and decides confidently using both intuition and analysis.'
                        : assessment.score.dualProcess.style === 'Intuitive'
                        ? 'Relies on gut instinct and rapid pattern recognition. Makes quick decisions in fast-paced environments.'
                        : 'Prefers thorough analysis and systematic evaluation before making decisions.'}
                    </p>
                    
                    {/* Comparison visualization */}
                    <div className="space-y-3 pt-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Intuitive</span>
                          <span className="font-semibold">{assessment.score.dualProcess.scores.system1}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#FF715B] to-[#6B4C9A] transition-all"
                            style={{ width: `${(assessment.score.dualProcess.scores.system1 / 48) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Analytical</span>
                          <span className="font-semibold">{assessment.score.dualProcess.scores.system2}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#5B7DB1] to-[#7B61FF] transition-all"
                            style={{ width: `${(assessment.score.dualProcess.scores.system2 / 48) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Key Insights */}
            {keyInsights.length > 0 && (
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50/30 to-white">
                <CardHeader>
                  <CardTitle className="text-xl text-blue-900">Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {keyInsights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-gray-700">{insight}</span>
                      </li>
                    ))}
                    {developmentNeeds.length > 0 && (
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span className="text-gray-700">
                          Development areas: {developmentNeeds.join('; ').toLowerCase()}
                        </span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Competency Fit Summary */}
            {competencies.length > 0 && (
              <Card className="border-2 border-violet-200">
                <CardHeader>
                  <CardTitle className="text-xl">Competency Fit Summary</CardTitle>
                  <CardDescription>How cognitive strengths align with key role competencies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-violet-200">
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Competency</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Cognitive Link</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Candidate Fit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {competencies.map((comp, index) => (
                          <tr key={index} className="border-b border-gray-200 hover:bg-violet-50/50">
                            <td className="py-3 px-2 font-medium text-gray-900">{comp.competency}</td>
                            <td className="py-3 px-2 text-gray-600">{comp.cognitiveLink}</td>
                            <td className="py-3 px-2">{getFitBadge(comp.fit)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Development Recommendations */}
            {developmentRecommendations.length > 0 && (
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50/30 to-white">
                <CardHeader>
                  <CardTitle className="text-xl text-green-900">Development Recommendations</CardTitle>
                  <CardDescription>Personalized strategies for continuous growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {developmentRecommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Feedback Prompt */}
        <Card className="border-2 border-[#6B4C9A] bg-gradient-to-br from-blue-50 to-cyan-50">
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
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-[#6B4C9A]/30">
              <p className="text-sm text-gray-700 mb-4">
                We'd love to hear your thoughts about your assessment experience. Your feedback helps us improve 
                JotMinds and make it more valuable for professionals and organizations across Ghana.
              </p>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#6B4C9A] mt-1">•</span>
                  <span>How well do your results align with your professional experience?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6B4C9A] mt-1">•</span>
                  <span>Did the competency mapping provide valuable insights?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6B4C9A] mt-1">•</span>
                  <span>How can we make JotMinds more useful for your organization?</span>
                </li>
              </ul>
            </div>
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

        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 max-w-4xl mx-auto dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-400">
          <div className="text-center text-xs mb-4">
            Important Note: JotMinds provides evidence-informed insights based on user responses and established theories in education and psychology. It is designed to support self-awareness, learning, reflection, and development. It is not a medical, clinical, diagnostic, IQ, or psychometric certification tool, and should not be used as the sole basis for high-stakes decisions.
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-col md:flex-row justify-between items-center text-xs">
            <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2 md:mb-0">
              JotMinds Professional Report
            </div>
            <div className="flex flex-col md:items-end gap-1">
              <span>Assessment Version: Professional v1.0</span>
              <span>Framework Version: Evidence-Informed Model v1.0</span>
              <span>Generated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}