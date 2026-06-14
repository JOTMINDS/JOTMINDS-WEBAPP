import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Assessment } from '../types';
import { Calendar, TrendingUp, Eye, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatDateTime, formatMonthYear, formatChartDate } from '../utils/dateFormat';

interface AssessmentHistoryProps {
  assessments: Assessment[];
  onViewReport: (assessment: Assessment) => void;
}

export function AssessmentHistory({ assessments, onViewReport }: AssessmentHistoryProps) {
  if (assessments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Assessment Track Record
          </CardTitle>
          <CardDescription>Your complete assessment history and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No assessments completed yet.</p>
            <p className="text-sm mt-2">Complete your first assessment to start tracking your progress!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group assessments by type
  const kolbAssessments = assessments.filter(a => a.type === 'kolb').sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
  const sternbergAssessments = assessments.filter(a => a.type === 'sternberg').sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
  const dualProcessAssessments = assessments.filter(a => a.type === 'dual-process').sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  const getAssessmentTypeName = (type: string) => {
    switch (type) {
      case 'kolb': return 'Learning Style';
      case 'sternberg': return 'Thinking Style';
      case 'dual-process': return 'Decision Style';
      default: return type;
    }
  };

  const getStyleFromAssessment = (assessment: Assessment) => {
    if (assessment.score.kolb) return assessment.score.kolb.style;
    if (assessment.score.sternberg) return assessment.score.sternberg.style;
    if (assessment.score.dualProcess) return assessment.score.dualProcess.style;
    return '';
  };

  // Prepare trend data for each assessment type
  const prepareTrendData = (assessmentList: Assessment[], type: 'kolb' | 'sternberg' | 'dual-process') => {
    return assessmentList.slice().reverse().map((assessment, index) => {
      const dataPoint: any = {
        attempt: `#${index + 1}`,
        date: formatChartDate(assessment.completedAt)
      };

      if (type === 'kolb' && assessment.score.kolb) {
        dataPoint.CE = assessment.score.kolb.scores.CE;
        dataPoint.RO = assessment.score.kolb.scores.RO;
        dataPoint.AC = assessment.score.kolb.scores.AC;
        dataPoint.AE = assessment.score.kolb.scores.AE;
      } else if (type === 'sternberg' && assessment.score.sternberg) {
        dataPoint.Analytical = assessment.score.sternberg.scores.analytical;
        dataPoint.Creative = assessment.score.sternberg.scores.creative;
        dataPoint.Practical = assessment.score.sternberg.scores.practical;
      } else if (type === 'dual-process' && assessment.score.dualProcess) {
        dataPoint.Intuitive = assessment.score.dualProcess.scores.system1;
        dataPoint.Reflective = assessment.score.dualProcess.scores.system2;
      }

      return dataPoint;
    });
  };

  const renderAssessmentList = (assessmentList: Assessment[], title: string, type: string) => {
    if (assessmentList.length === 0) return null;

    const trendData = prepareTrendData(assessmentList, type as any);
    const latestAssessment = assessmentList[0];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {title}
          </h3>
          <Badge variant="secondary">{assessmentList.length} assessment{assessmentList.length > 1 ? 's' : ''}</Badge>
        </div>

        {/* Progress Chart */}
        {assessmentList.length > 1 && (
          <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-lg p-4">
            <h4 className="text-sm mb-3">Progress Over Time</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    stroke="hsl(var(--border))"
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    stroke="hsl(var(--border))"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                  {type === 'kolb' && (
                    <>
                      <Line key="CE" type="monotone" dataKey="CE" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4 }} />
                      <Line key="RO" type="monotone" dataKey="RO" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} />
                      <Line key="AC" type="monotone" dataKey="AC" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 4 }} />
                      <Line key="AE" type="monotone" dataKey="AE" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 4 }} />
                    </>
                  )}
                  {type === 'sternberg' && (
                    <>
                      <Line key="Analytical" type="monotone" dataKey="Analytical" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4 }} />
                      <Line key="Creative" type="monotone" dataKey="Creative" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} />
                      <Line key="Practical" type="monotone" dataKey="Practical" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 4 }} />
                    </>
                  )}
                  {type === 'dual-process' && (
                    <>
                      <Line key="Intuitive" type="monotone" dataKey="Intuitive" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4 }} />
                      <Line key="Reflective" type="monotone" dataKey="Reflective" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Assessment List - Standardized 16px padding (p-4) */}
        <div className="space-y-2">
          {assessmentList.map((assessment, index) => (
            <div 
              key={assessment.id}
              className="flex items-center justify-between p-4 bg-card border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={index === 0 ? "default" : "outline"}>
                    {getStyleFromAssessment(assessment)}
                  </Badge>
                  {index === 0 && (
                    <Badge variant="secondary" className="text-xs">Latest</Badge>
                  )}
                </div>
                {/* Icon aligned with text baseline */}
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 inline-block align-text-bottom" />
                  <span className="inline-block align-baseline">{formatDateTime(assessment.completedAt)}</span>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewReport(assessment)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Report
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Assessment Track Record
          </CardTitle>
          <CardDescription>
            Your complete assessment history and progress over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Statistics Cards - Standardized 16px padding (pt-6 for top, which is already p-4 in CardContent) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{assessments.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Assessments</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {new Set(assessments.map(a => a.type)).size}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Assessment Types Completed</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  {/* Consistent date format: Dec 2025 */}
                  <p className="text-3xl font-bold text-purple-600">
                    {assessments.length > 0 
                      ? formatMonthYear(assessments[assessments.length - 1].completedAt)
                      : 'N/A'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Member Since</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {kolbAssessments.length > 0 && (
        <Card>
          <CardContent className="p-4">
            {renderAssessmentList(kolbAssessments, 'Learning Style Assessments', 'kolb')}
          </CardContent>
        </Card>
      )}

      {sternbergAssessments.length > 0 && (
        <Card>
          <CardContent className="p-4">
            {renderAssessmentList(sternbergAssessments, 'Thinking Style Assessments', 'sternberg')}
          </CardContent>
        </Card>
      )}

      {dualProcessAssessments.length > 0 && (
        <Card>
          <CardContent className="p-4">
            {renderAssessmentList(dualProcessAssessments, 'Decision Style Assessments', 'dual-process')}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
