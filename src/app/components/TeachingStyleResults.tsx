import React, { useState } from 'react';
import { toast } from 'sonner';
import { exportReportToPDF } from '../utils/pdfGenerator';
import { AssessmentScore } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { teachingStyleProfiles, axisDescriptions } from '../utils/teachingStyleData';
import { Download, Share2, CheckCircle, AlertTriangle, ArrowRight, Loader } from 'lucide-react';

interface TeachingStyleResultsProps {
  score: AssessmentScore['teaching-style'];
  onContinue?: () => void;
  onDeepDive?: () => void;
}

export function TeachingStyleResults({ score, onContinue, onDeepDive }: TeachingStyleResultsProps) {
  const [exportingPDF, setExportingPDF] = useState(false);

  if (!score) return null;

  const primaryProfile = teachingStyleProfiles[score.primaryStyle as keyof typeof teachingStyleProfiles];
  const secondaryProfile = teachingStyleProfiles[score.secondaryStyle as keyof typeof teachingStyleProfiles];

  const radarData = [
    { subject: 'Authority', A: score.scores.axisAuthority, fullMark: 100 },
    { subject: 'Construction', A: score.scores.axisKnowledge, fullMark: 100 },
    { subject: 'Motivation', A: score.scores.axisMotivation, fullMark: 100 },
    { subject: 'Growth', A: score.scores.axisAssessment, fullMark: 100 },
    { subject: 'Adaptability', A: score.scores.axisAdaptability, fullMark: 100 },
    { subject: 'Climate', A: score.scores.axisClimate, fullMark: 100 },
  ];

  const getAxisLabel = (value: number, axisKey: keyof typeof axisDescriptions) => {
    const axis = axisDescriptions[axisKey];
    return value > 50 ? axis.high : axis.low;
  };

  const getAxisColor = (value: number) => {
    return value > 50 ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400";
  };

  const handleExportPDF = async () => {
    setExportingPDF(true);
    toast.loading('Generating report...', { id: 'pdf-export' });
    try {
      const success = await exportReportToPDF('teaching-style-results-container', `Teaching_Style_${score.primaryStyle.replace(/\s+/g, '_')}.pdf`);
      if (success) {
        toast.success('Report downloaded successfully!', { id: 'pdf-export' });
      } else {
        toast.error('Could not find the report container to export.', { id: 'pdf-export' });
      }
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.error('An error occurred while generating the report.', { id: 'pdf-export' });
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div id="teaching-style-results-container" className="space-y-8 animate-in fade-in duration-500 bg-white p-6 rounded-xl">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 text-lg px-4 py-1">
          Your Teaching Style Profile
        </Badge>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          {score.primaryStyle}
        </h1>
        {score.secondaryStyle && (
            <p className="text-lg text-muted-foreground">
                Secondary Influence: <span className="font-semibold text-foreground">{score.secondaryStyle}</span>
            </p>
        )}
      </div>

      {/* Main Insights Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Radar Chart */}
        <Card className="col-span-1 border-2 shadow-md">
          <CardHeader>
            <CardTitle>Your teaching style at a glance</CardTitle>
            <CardDescription>
              Each spoke is a part of how you teach. The further a point sits from the centre, the more you lean toward the second style in that pair.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="My Style"
                    dataKey="A"
                    stroke="#6B4C9A"
                    strokeWidth={3}
                    fill="#6B4C9A"
                    fillOpacity={0.45}
                  />
                  <Tooltip formatter={(v: any) => [`${v}/100`, 'Score']} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Plain-language legend: what each spoke means */}
            <div className="mt-4 space-y-2 border-t pt-3">
              {([
                { subject: 'Authority', key: 'axisAuthority', value: score.scores.axisAuthority },
                { subject: 'Construction', key: 'axisKnowledge', value: score.scores.axisKnowledge },
                { subject: 'Motivation', key: 'axisMotivation', value: score.scores.axisMotivation },
                { subject: 'Growth', key: 'axisAssessment', value: score.scores.axisAssessment },
                { subject: 'Adaptability', key: 'axisAdaptability', value: score.scores.axisAdaptability },
                { subject: 'Climate', key: 'axisClimate', value: score.scores.axisClimate },
              ] as const).map(({ subject, key, value }) => {
                const axis = axisDescriptions[key as keyof typeof axisDescriptions];
                if (!axis) return null;
                return (
                  <div key={key} className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium text-foreground w-24 shrink-0">{subject}</span>
                    <span className="text-muted-foreground flex-1 text-right">
                      {axis.low} <span className="opacity-50">↔</span> {axis.high}
                    </span>
                    <span className={`font-semibold w-10 text-right ${getAxisColor(value)}`}>{value}</span>
                  </div>
                );
              })}
              <p className="text-[11px] text-muted-foreground pt-1">
                Tip: a score near 50 means you balance both sides; closer to 0 or 100 means a clear lean.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="col-span-1 border-2 shadow-md bg-gradient-to-br from-white to-indigo-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader>
            <CardTitle>Profile Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-400 mb-2">
                <CheckCircle className="h-5 w-5" /> Key Strengths
              </h3>
              <ul className="space-y-2">
                {primaryProfile?.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400 mb-2">
                <AlertTriangle className="h-5 w-5" /> Potential Blind Spots
              </h3>
              <ul className="space-y-2">
                {primaryProfile?.blindSpots.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Axis Breakdown */}
      <h2 className="text-2xl font-bold mt-8 mb-4">Detailed Breakdown</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(score.scores).filter(([k]) => k.startsWith('axis')).map(([key, value]) => {
          const axisKey = key as keyof typeof axisDescriptions;
          const axis = axisDescriptions[axisKey];
          if (!axis) return null;

          return (
            <Card key={key} className="border hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{axis.title}</CardTitle>
                <CardDescription className="text-xs">{axis.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">{axis.low}</span>
                  <span className="text-sm text-muted-foreground">{axis.high}</span>
                </div>
                <Progress value={value} className="h-2 mb-2" />
                <div className="text-center font-bold text-lg">
                  <span className={getAxisColor(value)}>
                    {getAxisLabel(value, axisKey)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">({value}%)</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recommendations */}
      <Card className="bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-indigo-600" />
            Growth Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {primaryProfile?.recommendations.map((rec, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900">
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 pdf-exclude">
        <Button variant="outline" className="gap-2" onClick={handleExportPDF} disabled={exportingPDF}>
          {exportingPDF ? <Loader className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} 
          {exportingPDF ? 'Exporting...' : 'Export Report'}
        </Button>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" /> Share Profile
        </Button>
        {onDeepDive && (
           <Button onClick={onDeepDive} className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 border-0 shadow-lg hover:shadow-xl">
             <CheckCircle className="h-4 w-4" /> Deep Dive: Complete Full Assessment
           </Button>
        )}
        {onContinue && (
           <Button variant="ghost" onClick={onContinue}>
             Back to Dashboard
           </Button>
        )}
      </div>
    </div>
  );
}
