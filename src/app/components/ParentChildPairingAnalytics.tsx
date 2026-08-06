import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Assessment, User } from '../types';
import { AdultResults } from '../utils/adultScoring';
import { getSternbergPairing, getKolbPairing, getDualProcessPairing, AdultStyle, PairingInsight } from '../utils/cognitivePairingData';
import { ArrowLeft, Brain, Sparkles, Target, Zap, AlertCircle } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { ParentObservationAssessment } from '../types';

interface ParentChildPairingAnalyticsProps {
  child: User;
  childAssessments: Assessment[];
  parentAssessment: Assessment;
  parentObservation?: ParentObservationAssessment;
  onBack: () => void;
}

export function ParentChildPairingAnalytics({
  child,
  childAssessments,
  parentAssessment,
  parentObservation,
  onBack
}: ParentChildPairingAnalyticsProps) {
  
  const parentResults = parentAssessment.score as AdultResults;
  const parentStyle = parentResults.dominantStyle as AdultStyle;

  const sternberg = childAssessments.find(a => a.type === 'sternberg');
  const kolb = childAssessments.find(a => a.type === 'kolb');
  const dualProcess = childAssessments.find(a => a.type === 'dual-process');

  const radarData = [
    { subject: 'Analytical', parent: 80, observation: parentObservation?.score?.sectionB?.total ? parentObservation.score.sectionB.total * 5 : 60, child: sternberg?.score?.sternberg?.scores?.analytical || 70 },
    { subject: 'Creative', parent: 60, observation: parentObservation?.score?.sectionC?.total ? parentObservation.score.sectionC.total * 5 : 70, child: sternberg?.score?.sternberg?.scores?.creative || 60 },
    { subject: 'Practical', parent: 70, observation: parentObservation?.score?.sectionD?.total ? parentObservation.score.sectionD.total * 5 : 50, child: sternberg?.score?.sternberg?.scores?.practical || 80 },
    { subject: 'Learning Habits', parent: 85, observation: parentObservation?.score?.sectionA?.total ? parentObservation.score.sectionA.total * 5 : 75, child: kolb?.score?.kolb?.scores?.CE || 65 },
  ];

  const getAlignmentColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Different': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderPairingSection = (title: string, icon: React.ReactNode, insight: PairingInsight | null, childStyleName: string | undefined, domainName: string) => {
    if (!insight || !childStyleName) {
      return (
        <Card className="border-2 border-dashed">
          <CardContent className="p-6 text-center text-muted-foreground flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-slate-300" />
            <p>{child.name} hasn't completed the {domainName} assessment yet.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-2 overflow-hidden">
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white rounded-md shadow-sm">
                {icon}
              </div>
              <div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription>
                  Your <span className="font-semibold capitalize text-purple-600">{parentStyle}</span> style vs {child.name}'s <span className="font-semibold capitalize text-blue-600">{childStyleName}</span> style
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className={getAlignmentColor(insight.alignmentLevel)}>
              {insight.alignmentLevel} Match
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          <div className="bg-slate-50 p-4 rounded-lg border">
            <h4 className="font-semibold text-lg mb-2 text-slate-800">{insight.title}</h4>
            <p className="text-slate-600 leading-relaxed">{insight.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-green-700 flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Shared Strengths
              </h5>
              <ul className="space-y-2">
                {insight.strengths.map((strength, i) => (
                  <li key={i} className="text-sm text-slate-700 bg-green-50/50 p-2 rounded border border-green-100">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-amber-700 flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                Potential Challenges
              </h5>
              <ul className="space-y-2">
                {insight.challenges.map((challenge, i) => (
                  <li key={i} className="text-sm text-slate-700 bg-amber-50/50 p-2 rounded border border-amber-100">
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h5 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              How to best support {child.name}
            </h5>
            <ul className="space-y-2 list-disc pl-5">
              {insight.tips.map((tip, i) => (
                <li key={i} className="text-sm text-blue-900/80 leading-relaxed">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
          
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="mb-2 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Parent-Child Cognitive Pairing
              </h1>
              <p className="text-slate-500 mt-1">
                Discover how your thinking styles complement {child.name}'s and how to bridge any gaps.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 mt-6 space-y-8">
        
        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-none shadow-lg">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-2">The Dynamic Duo</h3>
                <p className="text-purple-100 leading-relaxed">
                  You are a <strong className="text-white capitalize">{parentStyle}</strong> thinker. 
                  Understanding how this interacts with {child.name}'s unique learning, thinking, and decision-making styles 
                  is the secret to reducing friction during homework and providing the best support possible.
                </p>
              </div>
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mb-2 mx-auto">
                    P
                  </div>
                  <div className="font-semibold capitalize">{parentStyle}</div>
                  <div className="text-xs text-purple-200">Your Style</div>
                </div>
                <div className="flex items-center">
                  <Zap className="w-8 h-8 text-yellow-400" />
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mb-2 mx-auto">
                    {child.name[0]}
                  </div>
                  <div className="font-semibold">Child</div>
                  <div className="text-xs text-purple-200">Their Styles</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* 3-Way Comparison Chart */}
          <Card className="border-2 border-purple-100">
            <CardHeader className="bg-purple-50/50">
              <CardTitle>3-Way Alignment Overview</CardTitle>
              <CardDescription>Comparing your self-assessment, your observations of {child.name}, and their self-assessment.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Your Self-Assessment" dataKey="parent" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    {parentObservation && (
                      <Radar name="Your Observation" dataKey="observation" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                    )}
                    <Radar name="Child's Self-Assessment" dataKey="child" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 3-Way Alignment Insights
                </h4>
                <p className="text-sm text-blue-800">
                  {parentObservation 
                    ? `When comparing all three perspectives, we look for harmony. Where your observation matches ${child.name}'s self-assessment, you have a clear shared understanding. Where they differ, it's a great opportunity for conversation. Your own style (${parentStyle}) adds the third dimension—showing how you naturally approach the same challenges.`
                    : `Complete the Parent Observation assessment to unlock full 3-way pairing insights.`}
                </p>
              </div>
            </CardContent>
          </Card>

          {renderPairingSection(
            "Thinking Style Pairing", 
            <Brain className="w-6 h-6 text-purple-500" />,
            sternberg?.score?.sternberg?.style ? getSternbergPairing(parentStyle, sternberg.score.sternberg.style) : null,
            sternberg?.score?.sternberg?.style,
            "Thinking (Sternberg)"
          )}

          {renderPairingSection(
            "Learning Style Pairing", 
            <Target className="w-6 h-6 text-blue-500" />,
            kolb?.score?.kolb?.style ? getKolbPairing(parentStyle, kolb.score.kolb.style) : null,
            kolb?.score?.kolb?.style,
            "Learning (Kolb)"
          )}

          {renderPairingSection(
            "Decision Making Pairing", 
            <Zap className="w-6 h-6 text-amber-500" />,
            dualProcess?.score?.dualProcess?.style ? getDualProcessPairing(parentStyle, dualProcess.score.dualProcess.style) : null,
            dualProcess?.score?.dualProcess?.style,
            "Decision Making (Dual-Process)"
          )}
        </div>

      </div>
    </div>
  );
}
