import React, { useState, useMemo } from 'react';
import { CognitiveProfile } from '../utils/cognitiveProfileApi';
import { GLOBAL_CAREERS } from '../utils/globalCareerDemands';
import { calculateRoleFitScore, generatePersonalizedReport } from '../utils/cognitiveRoleFitEngine';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Target, ArrowRight, Brain, AlertTriangle } from 'lucide-react';
import { CandidateComparisonPanel } from './CandidateComparisonPanel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface StudentCareerFitProps {
  cognitiveProfile: CognitiveProfile;
  userName: string;
}

export function StudentCareerFit({ cognitiveProfile, userName }: StudentCareerFitProps) {
  const [selectedCareer, setSelectedCareer] = useState<any | null>(null);

  // Calculate scores for all global careers
  const careerMatches = useMemo(() => {
    return GLOBAL_CAREERS.map(career => {
      const fitData = calculateRoleFitScore(cognitiveProfile, career.demands);
      const report = generatePersonalizedReport(fitData, career.title, true);
      
      return {
        career,
        fitData,
        report
      };
    }).sort((a, b) => b.fitData.fitScore - a.fitData.fitScore);
  }, [cognitiveProfile]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Career Match Scanner</h2>
          <p className="text-gray-500">Discover which career paths naturally align with your cognitive blueprint.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {careerMatches.map(({ career, fitData, report }) => (
          <Card key={career.id} className="flex flex-col hover:shadow-md transition-all border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <Badge variant={
                  fitData.fitCategory === 'Natural Accelerator' ? 'default' :
                  fitData.fitCategory === 'Strong Alignment' ? 'secondary' :
                  fitData.fitCategory === 'Adaptable Fit' ? 'outline' : 'destructive'
                }>
                  {fitData.fitScore}% Match
                </Badge>
                {fitData.performancePrediction.burnoutRisk === 'Severe' && (
                  <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
                    <AlertTriangle className="h-3 w-3 mr-1" /> High Risk
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{career.title}</CardTitle>
              <CardDescription className="line-clamp-2">{career.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-3">
                <div className="text-sm font-medium text-slate-700">{fitData.fitCategory}</div>
                <div className="text-sm text-slate-500 italic line-clamp-3">
                  "{report.alignment} {report.adaptationPlan}"
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full justify-between group"
                onClick={() => setSelectedCareer({ career, fitData, report })}
              >
                View Fit Details
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Detailed View Modal */}
      <Dialog open={!!selectedCareer} onOpenChange={(open) => !open && setSelectedCareer(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Career Fit Analysis</DialogTitle>
            <DialogDescription>
              Detailed breakdown of your cognitive alignment with this career path.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCareer && (
            <CandidateComparisonPanel 
              candidateData={{
                professional: { name: userName || 'You' },
                fitData: selectedCareer.fitData,
                report: selectedCareer.report
              }}
              role={{ title: selectedCareer.career.title }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
