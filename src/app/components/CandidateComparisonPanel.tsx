import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Target, AlertTriangle, Lightbulb, Zap, ArrowRight, User } from 'lucide-react';

interface CandidateComparisonPanelProps {
  candidateData: any;
  role: any;
}

const DIMENSION_LABELS: Record<string, string> = {
  analyticalDepth: 'Analytical Depth',
  ambiguityTolerance: 'Ambiguity Tolerance',
  emotionalLaborLoad: 'Emotional Labor Load',
  decisionSpeed: 'Decision Speed',
  stakeholderComplexity: 'Stakeholder Complexity',
  repetitionVsInnovation: 'Repetition vs Innovation',
  socialExposure: 'Social Exposure',
  detailSensitivity: 'Detail Sensitivity',
  autonomyRequired: 'Autonomy Required',
  cognitiveLoadVolatility: 'Cognitive Load Volatility'
};

export function CandidateComparisonPanel({ candidateData, role }: CandidateComparisonPanelProps) {
  const { professional, fitData, report } = candidateData;
  const { fitScore, fitCategory, riskFlags, gapMap, performancePrediction } = fitData;

  const getGapColor = (gap: number) => {
    if (Math.abs(gap) <= 1) return 'bg-green-500';
    if (gap > 1 && gap <= 3) return 'bg-yellow-400'; // Over-qualified
    if (gap < -1 && gap >= -3) return 'bg-orange-500'; // Under-qualified slightly
    return 'bg-red-500'; // Major gap
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl text-indigo-900 flex items-center gap-2">
                  <User className="h-6 w-6" /> {professional.name}
                </CardTitle>
                <CardDescription className="text-indigo-700/70 mt-1">
                  Compared against: <span className="font-semibold">{role.title}</span>
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-extrabold text-indigo-600">{fitScore}%</div>
                <div className="text-sm font-semibold text-indigo-800 mt-1 uppercase tracking-wider">{fitCategory}</div>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <Card className="col-span-1 bg-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wider text-slate-500">Prediction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">Burnout Risk</div>
              <Badge variant="outline" className={`
                ${performancePrediction.burnoutRisk === 'Low' ? 'border-green-200 text-green-700 bg-green-50' : ''}
                ${performancePrediction.burnoutRisk === 'Medium' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' : ''}
                ${performancePrediction.burnoutRisk === 'High' ? 'border-orange-200 text-orange-700 bg-orange-50' : ''}
                ${performancePrediction.burnoutRisk === 'Severe' ? 'border-red-200 text-red-700 bg-red-50' : ''}
              `}>
                {performancePrediction.burnoutRisk}
              </Badge>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Recommendation</div>
              <div className="font-medium text-sm text-slate-900">{report.recommendation}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gap Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-500" />
            Cognitive Gap Map
          </CardTitle>
          <CardDescription>Visual comparison of candidate capabilities vs role demands on a 1-10 scale.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Header row */}
            <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 pb-2 border-b">
              <div className="col-span-4">Dimension</div>
              <div className="col-span-2 text-center">Required</div>
              <div className="col-span-2 text-center">Candidate</div>
              <div className="col-span-4">Alignment</div>
            </div>
            
            {Object.keys(gapMap).map((key) => {
              const { candidate, required, gap } = gapMap[key];
              return (
                <div key={key} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center group">
                  <div className="col-span-1 md:col-span-4 text-sm font-medium text-slate-700">
                    {DIMENSION_LABELS[key] || key}
                  </div>
                  <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-center text-sm">
                    <span className="md:hidden text-xs text-slate-400">Required:</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">{required}</span>
                  </div>
                  <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-center text-sm">
                    <span className="md:hidden text-xs text-slate-400">Candidate:</span>
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-bold">{candidate}</span>
                  </div>
                  <div className="col-span-1 md:col-span-4 mt-2 md:mt-0">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex relative">
                      {/* Visual indicator of the gap */}
                      <div 
                        className={`absolute top-0 bottom-0 ${getGapColor(gap)} rounded-full opacity-80`}
                        style={{
                          left: gap < 0 ? `${(candidate / 10) * 100}%` : `${(required / 10) * 100}%`,
                          width: `${(Math.abs(gap) / 10) * 100}%`
                        }}
                      />
                      {/* Plot candidate vs required as dots */}
                      <div className="absolute top-1/2 -mt-1 h-2 w-2 rounded-full bg-slate-400 shadow-sm" style={{ left: `calc(${(required / 10) * 100}% - 4px)` }} title="Required" />
                      <div className="absolute top-1/2 -mt-1.5 h-3 w-3 rounded-full bg-indigo-600 shadow-sm z-10" style={{ left: `calc(${(candidate / 10) * 100}% - 6px)` }} title="Candidate" />
                    </div>
                    <div className="text-[10px] text-right mt-1 text-slate-500 font-mono">
                      {gap > 0 ? `+${gap} (Surpasses)` : gap < 0 ? `${gap} (Gap)` : 'Perfect Match'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reports & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-red-100">
          <CardHeader className="bg-red-50/50 pb-4 border-b border-red-100">
            <CardTitle className="text-red-800 flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5" /> Risk Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {riskFlags.length === 0 ? (
              <div className="text-sm text-slate-500 italic">No significant cognitive risks detected.</div>
            ) : (
              riskFlags.map((flag: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <div className="mt-0.5 text-red-500">•</div>
                  <span>{flag.replace('⚠ ', '')}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-indigo-100">
          <CardHeader className="bg-indigo-50/50 pb-4 border-b border-indigo-100">
            <CardTitle className="text-indigo-800 flex items-center gap-2 text-base">
              <Lightbulb className="h-5 w-5" /> 90-Day Projection
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-sm text-slate-700 leading-relaxed">
            {performancePrediction.successProjection90Day}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
