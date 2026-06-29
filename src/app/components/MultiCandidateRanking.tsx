import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { calculateRoleFitScore, CognitiveRoleFitScore, generatePersonalizedReport } from '../utils/cognitiveRoleFitEngine';
import { mapAssessmentsToResponses } from './SupervisorDashboard';
import { getAssessmentsByUserId } from '../utils/storage';
import { calculateProfessionalCognitiveProfile } from '../utils/professionalCognitiveScoring';
import { CandidateComparisonPanel } from './CandidateComparisonPanel';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface MultiCandidateRankingProps {
  role: any;
  professionals: any[];
}

export function MultiCandidateRanking({ role, professionals }: MultiCandidateRankingProps) {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const rankedCandidates = useMemo(() => {
    return professionals.map(prof => {
      try {
        const assessments = prof.assessments || getAssessmentsByUserId(prof.id);
        const completed = assessments.filter((a: any) => a.completedAt);
        const responses = mapAssessmentsToResponses(completed);
        
        if (!responses || !responses.learning) {
          return { professional: prof, fitScore: null, error: 'No assessment' };
        }

        const profile = calculateProfessionalCognitiveProfile(responses);
        const fitData = calculateRoleFitScore(profile, role.cognitive_demands);
        const report = generatePersonalizedReport(fitData, role.title, false);

        return {
          professional: prof,
          profile,
          fitData,
          report,
          error: null
        };
      } catch (e) {
        return { professional: prof, fitScore: null, error: 'Data error' };
      }
    }).sort((a, b) => {
      if (!a.fitData) return 1;
      if (!b.fitData) return -1;
      return b.fitData.fitScore - a.fitData.fitScore;
    });
  }, [role, professionals]);

  if (selectedCandidateId) {
    const candidateData = rankedCandidates.find(c => c.professional.id === selectedCandidateId);
    if (candidateData && candidateData.fitData && candidateData.profile) {
      return (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setSelectedCandidateId(null)} className="mb-4">
            &larr; Back to Rankings
          </Button>
          <CandidateComparisonPanel 
            candidateData={candidateData} 
            role={role} 
          />
        </div>
      );
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{role.title} - Candidate Rankings</CardTitle>
        <CardDescription>{role.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Candidate</th>
                <th className="px-4 py-3">Fit Score</th>
                <th className="px-4 py-3">Risk Index</th>
                <th className="px-4 py-3">Recommendation</th>
                <th className="px-4 py-3 rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rankedCandidates.map((c, i) => {
                if (c.error) {
                  return (
                    <tr key={c.professional.id} className="bg-white">
                      <td className="px-4 py-4 font-medium text-slate-900">{c.professional.name}</td>
                      <td className="px-4 py-4 text-slate-400 italic" colSpan={3}>Assessment incomplete</td>
                      <td className="px-4 py-4">
                        <Button variant="outline" size="sm" disabled>Compare</Button>
                      </td>
                    </tr>
                  );
                }

                const { fitData, report } = c as any;
                
                let scoreColor = 'text-green-600 bg-green-50';
                if (fitData.fitScore < 55) scoreColor = 'text-red-600 bg-red-50';
                else if (fitData.fitScore < 70) scoreColor = 'text-yellow-600 bg-yellow-50';

                return (
                  <tr key={c.professional.id} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        {i < 3 && <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">#{i+1}</Badge>}
                        {c.professional.name}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className={`inline-flex px-2.5 py-1 rounded-full font-bold ${scoreColor}`}>
                        {fitData.fitScore}%
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium">{report.riskAnalysis.split('.')[0]}</span>
                        {fitData.riskFlags.length > 0 && (
                          <span className="text-[10px] text-slate-500 line-clamp-1">{fitData.riskFlags.length} flags</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className={
                        report.recommendation.includes('Hire') && !report.recommendation.includes('Not') 
                          ? 'border-green-200 text-green-700' 
                          : 'border-red-200 text-red-700'
                      }>
                        {report.recommendation}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Button variant="secondary" size="sm" onClick={() => setSelectedCandidateId(c.professional.id)}>
                        Compare
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
