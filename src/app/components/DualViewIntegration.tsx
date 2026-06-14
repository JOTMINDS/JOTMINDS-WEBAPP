import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Assessment, ParentObservationAssessment, User } from '../types';
import { calculateHarmonyScore, getAlignmentLabel } from '../utils/parentObservationData';
import { ArrowLeft, Users, TrendingUp, AlertCircle, CheckCircle2, Eye, Brain, Target, Heart } from 'lucide-react';

interface DualViewIntegrationProps {
  child: User;
  childAssessments: Assessment[];
  parentObservation: ParentObservationAssessment;
  onBack: () => void;
}

export function DualViewIntegration({
  child,
  childAssessments,
  parentObservation,
  onBack
}: DualViewIntegrationProps) {
  // Get the child's assessment scores
  const kolbAssessment = childAssessments.find(a => a.type === 'kolb');
  const sternbergAssessment = childAssessments.find(a => a.type === 'sternberg');
  const dualProcessAssessment = childAssessments.find(a => a.type === 'dual-process');

  const childScore = {
    kolb: kolbAssessment?.score.kolb,
    sternberg: sternbergAssessment?.score.sternberg,
    dualProcess: dualProcessAssessment?.score.dualProcess
  };

  // Calculate harmony score
  const harmonyScore = calculateHarmonyScore(childScore, parentObservation.score);
  const alignment = getAlignmentLabel(harmonyScore);

  const comparisons = [
    {
      domain: "Learning Style",
      icon: Eye,
      color: "from-blue-500 to-cyan-500",
      childView: childScore.kolb?.style || 'Not assessed',
      parentView: parentObservation.score.sectionA.style,
      childScore: childScore.kolb ? 'Assessed' : 'Not assessed',
      parentScore: parentObservation.score.sectionA.total,
      hasChildData: !!childScore.kolb
    },
    {
      domain: "Thinking Style",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      childView: childScore.sternberg?.style || 'Not assessed',
      parentView: parentObservation.score.sectionB.style,
      childScore: childScore.sternberg ? 'Assessed' : 'Not assessed',
      parentScore: parentObservation.score.sectionB.total,
      hasChildData: !!childScore.sternberg
    },
    {
      domain: "Decision Style",
      icon: Target,
      color: "from-green-500 to-emerald-500",
      childView: childScore.dualProcess?.style || 'Not assessed',
      parentView: parentObservation.score.sectionC.style,
      childScore: childScore.dualProcess ? 'Assessed' : 'Not assessed',
      parentScore: parentObservation.score.sectionC.total,
      hasChildData: !!childScore.dualProcess
    },
    {
      domain: "Motivation Style",
      icon: Heart,
      color: "from-orange-500 to-red-500",
      childView: 'Self-Motivated', // This could be enhanced with child's reflection data
      parentView: parentObservation.score.sectionD.style,
      childScore: 'From reflections',
      parentScore: parentObservation.score.sectionD.total,
      hasChildData: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-violet-50 to-indigo-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#6B4C9A] via-[#7B61FF] to-[#5B7DB1] bg-clip-text text-transparent">
            Cognitive Harmony Report
          </h1>
          <p className="text-muted-foreground">
            Comparing {child.name}'s self-view with your parent observations
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Harmony Score Card */}
        <Card className={`border-2 ${alignment.color.includes('green') ? 'border-green-500' : alignment.color.includes('yellow') ? 'border-yellow-500' : 'border-red-500'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Overall Alignment Score
                </CardTitle>
                <CardDescription>
                  How well your observations match {child.name}'s self-assessment
                </CardDescription>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-[#6B4C9A] to-[#5B7DB1] bg-clip-text text-transparent">
                  {harmonyScore}%
                </div>
                <Badge className={alignment.color + " text-white mt-2"}>
                  {alignment.emoji} {alignment.label}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={harmonyScore} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {alignment.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Grid */}
        <div className="grid gap-6">
          {comparisons.map((comparison, idx) => {
            const Icon = comparison.icon;
            return (
              <Card key={idx} className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${comparison.color} flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>{comparison.domain}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Child's View */}
                    <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                          {child.name.charAt(0)}
                        </div>
                        <h4 className="font-semibold">{child.name}'s Self-View</h4>
                      </div>
                      {comparison.hasChildData ? (
                        <>
                          <Badge className="mb-2 bg-blue-500 text-white">
                            {comparison.childView}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            From self-assessment
                          </p>
                        </>
                      ) : (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                          <p className="text-sm text-muted-foreground">
                            {child.name} hasn't completed this assessment yet
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Parent's View */}
                    <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          P
                        </div>
                        <h4 className="font-semibold">Your Observation</h4>
                      </div>
                      <Badge className="mb-2 bg-purple-500 text-white">
                        {comparison.parentView}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Score: {comparison.parentScore}/30
                      </p>
                    </div>
                  </div>

                  {/* Alignment Indicator */}
                  {comparison.hasChildData && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {comparison.childView === comparison.parentView ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                              Perfect alignment – you both see this the same way!
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="h-5 w-5 text-amber-600" />
                            <span className="text-sm font-medium text-amber-700">
                              Different perspectives – a great opportunity for discussion
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Shared Strengths & Growth Areas */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Shared Strengths */}
          <Card className="border-2 border-green-500 bg-gradient-to-br from-white to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                Shared Strengths
              </CardTitle>
              <CardDescription>
                Areas where you both agree on {child.name}'s abilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {comparisons
                  .filter(c => c.hasChildData && c.childView === c.parentView)
                  .map((c, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>{c.domain}:</strong> Both recognize {c.childView.toLowerCase()} tendencies
                      </span>
                    </li>
                  ))}
                {comparisons.filter(c => c.hasChildData && c.childView === c.parentView).length === 0 && (
                  <li className="text-sm text-muted-foreground italic">
                    Continue discussions to identify more shared perspectives
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Growth Opportunities */}
          <Card className="border-2 border-amber-500 bg-gradient-to-br from-white to-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <TrendingUp className="h-5 w-5" />
                Growth Opportunities
              </CardTitle>
              <CardDescription>
                Areas to discuss and explore together
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {comparisons
                  .filter(c => c.hasChildData && c.childView !== c.parentView)
                  .map((c, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>{c.domain}:</strong> Discuss differences between {c.childView.toLowerCase()} (self-view) and {c.parentView.toLowerCase()} (your view)
                      </span>
                    </li>
                  ))}
                {comparisons.filter(c => c.hasChildData && c.childView !== c.parentView).length === 0 && (
                  <li className="text-sm text-muted-foreground italic">
                    Great alignment! Keep supporting their self-awareness
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Personalized Insights */}
        <Card className="bg-gradient-to-r from-cyan-50 to-purple-50 border-2 border-[#6B4C9A]">
          <CardHeader>
            <CardTitle>Personalized Insights for You</CardTitle>
            <CardDescription>
              How to use this information to support {child.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {harmonyScore >= 80 ? (
              <div className="space-y-3">
                <p className="text-sm">
                  <strong>Excellent alignment!</strong> You and {child.name} have a very similar understanding of their cognitive profile. This strong connection is valuable:
                </p>
                <ul className="text-sm space-y-2 ml-4">
                  <li>• Celebrate this shared understanding – it shows great communication</li>
                  <li>• Continue to validate their self-awareness and insights</li>
                  <li>• Use this alignment to build confidence in decision-making</li>
                  <li>• Encourage them to share their thoughts and perspectives regularly</li>
                </ul>
              </div>
            ) : harmonyScore >= 60 ? (
              <div className="space-y-3">
                <p className="text-sm">
                  <strong>Good alignment with room for discussion.</strong> Some differences in perspective are normal and healthy:
                </p>
                <ul className="text-sm space-y-2 ml-4">
                  <li>• Schedule time to discuss areas where views differ</li>
                  <li>• Ask {child.name} to explain their self-perception</li>
                  <li>• Share specific examples of behaviors you've observed</li>
                  <li>• Work together to find common ground and understanding</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm">
                  <strong>Significant differences in perception.</strong> This is an opportunity for deeper connection:
                </p>
                <ul className="text-sm space-y-2 ml-4">
                  <li>• Approach differences with curiosity, not judgment</li>
                  <li>• Create safe space for {child.name} to share their perspective</li>
                  <li>• Consider that you may see different sides of their personality</li>
                  <li>• Work together to understand and bridge these gaps</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
