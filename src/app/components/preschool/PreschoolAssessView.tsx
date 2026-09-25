import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import {
  DevelopmentalDomainCode,
  DevelopmentalBand,
  DevelopmentalRating,
  EvidenceEvent,
  DEVELOPMENTAL_DOMAINS,
  DEVELOPMENTAL_RATINGS,
  CONFIDENCE_RULES,
} from '../../types/preschoolDevelopmental';
import { MASTER_PRESCHOOL_INDICATORS, INDICATORS_BY_DOMAIN } from '../../data/preschoolIndicators';
import { calculateIndicatorEvaluation, resolveChildBand } from '../../utils/preschoolEngine';
import { getEvidenceEventsForChild, saveEvidenceEvent } from '../../utils/preschoolStorage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  CheckCircle2, Plus, Filter, Search, BookOpen, Clock,
  Calendar, MessageSquare, AlertCircle, Eye, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface PreschoolAssessViewProps {
  childrenList: User[];
  events: EvidenceEvent[];
  onOpenAssessModal: (childId?: string, indicatorId?: string) => void;
  onRefresh: () => void;
  currentUser: User;
}

export function PreschoolAssessView({
  childrenList,
  events,
  onOpenAssessModal,
  onRefresh,
  currentUser,
}: PreschoolAssessViewProps) {
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenList[0]?.id || '');
  const [selectedDomain, setSelectedDomain] = useState<DevelopmentalDomainCode>('JM-CD');
  const [selectedBand, setSelectedBand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedChild = childrenList.find(c => c.id === selectedChildId) || childrenList[0];
  const childBand = selectedChild ? resolveChildBand(selectedChild) : 'P3';

  // Filter indicators
  const indicatorsInDomain = useMemo(() => {
    return MASTER_PRESCHOOL_INDICATORS.filter(ind => {
      if (ind.domainCode !== selectedDomain) return false;
      if (selectedBand !== 'all' && ind.band !== selectedBand && !ind.band.includes(selectedBand)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ind.title.toLowerCase().includes(q);
        const matchesCluster = ind.clusterName.toLowerCase().includes(q);
        const matchesId = ind.id.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCluster && !matchesId) return false;
      }
      return true;
    });
  }, [selectedDomain, selectedBand, searchQuery]);

  const childEvents = useMemo(() => {
    if (!selectedChild) return [];
    return getEvidenceEventsForChild(selectedChild.id);
  }, [selectedChild, events]);

  // Quick rating logger directly from table
  const handleQuickRate = async (indicatorId: string, rating: DevelopmentalRating) => {
    if (!selectedChild) return;
    const ind = MASTER_PRESCHOOL_INDICATORS.find(i => i.id === indicatorId);
    if (!ind) return;

    const newEvent: EvidenceEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      childId: selectedChild.id,
      childName: selectedChild.name || 'Child',
      indicatorId: ind.id,
      domainCode: ind.domainCode,
      rating,
      method: ind.defaultMethod,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      observerId: currentUser.id,
      observerName: currentUser.name || 'Educator',
      observerRole: (currentUser.role as any) === 'parent' ? 'parent' : 'teacher',
      activityContext: 'Classroom Milestone Review',
      languageOfEvidence: 'English',
      notes: `Quick milestone check logged as Stage ${rating} (${DEVELOPMENTAL_RATINGS[rating].stage}).`,
      classId: selectedChild.classId,
      institutionId: selectedChild.institutionId || (currentUser as any).institutionId,
    };

    const ok = await saveEvidenceEvent(newEvent);
    if (ok) {
      toast.success(`Logged Stage ${rating} for ${selectedChild.name}!`);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-gray-900">
              Observational Evidence & Developmental Checklist
            </h3>
            <p className="text-xs text-gray-500">
              Select a child to view ongoing progress against the 240 master indicators or log natural evidence.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => onOpenAssessModal(selectedChildId)}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Log Detailed Evidence
          </Button>
        </div>

        {/* Child Selector & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
          <div>
            <span className="text-[11px] font-semibold text-gray-700 block mb-1">Select Child:</span>
            <select
              value={selectedChildId}
              onChange={e => setSelectedChildId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {childrenList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({resolveChildBand(c)}) • {c.className || 'Early Years'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-gray-700 block mb-1">Age Band Filter:</span>
            <select
              value={selectedBand}
              onChange={e => setSelectedBand(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none"
            >
              <option value="all">All Developmental Bands</option>
              <option value="P1">JM-P1 (2–3 years)</option>
              <option value="P2">JM-P2 (3–4 years)</option>
              <option value="P3">JM-P3 (4–5 years)</option>
              <option value="P4">JM-P4 (5–6 years)</option>
            </select>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-gray-700 block mb-1">Search Indicator:</span>
            <Input
              placeholder="Search title, cluster, or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>
      </div>

      {/* Domain Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {(Object.keys(DEVELOPMENTAL_DOMAINS) as DevelopmentalDomainCode[]).map(code => {
          const d = DEVELOPMENTAL_DOMAINS[code];
          const isSelected = selectedDomain === code;
          return (
            <button
              key={code}
              onClick={() => setSelectedDomain(code)}
              className={`p-2.5 rounded-xl border text-center transition-all text-xs flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold ring-2 ring-indigo-300 shadow-xs'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="font-semibold block mb-0.5 line-clamp-1">{d.shortName}</span>
              <span className="text-[10px] text-gray-400">{d.indicatorCount} indicators</span>
            </button>
          );
        })}
      </div>

      {/* Checklist Table */}
      <Card>
        <CardHeader className="py-3 border-b bg-gray-50/50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-bold text-gray-900">
              {DEVELOPMENTAL_DOMAINS[selectedDomain].name} ({indicatorsInDomain.length} Indicators)
            </CardTitle>
            <span className="text-xs text-gray-500">
              Evaluating: <b className="text-indigo-700">{selectedChild?.name || 'Child'}</b>
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Indicator & Cluster</th>
                <th className="text-center px-2 py-3 font-semibold">Band</th>
                <th className="text-center px-3 py-3 font-semibold">Current Level</th>
                <th className="text-center px-3 py-3 font-semibold">Confidence</th>
                <th className="text-center px-3 py-3 font-semibold">Quick Stage Log</th>
                <th className="text-right px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {indicatorsInDomain.map(ind => {
                const evaluation = calculateIndicatorEvaluation(ind, childEvents);
                const ratingInfo = DEVELOPMENTAL_RATINGS[evaluation.currentRating];
                const confRule = CONFIDENCE_RULES[evaluation.confidence];

                return (
                  <tr key={ind.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 max-w-sm">
                      <div className="flex items-center gap-2 mb-0.5">
                        <code className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1 rounded">
                          {ind.id}
                        </code>
                        <span className="text-[11px] font-semibold text-gray-500">{ind.clusterName}</span>
                      </div>
                      <p className="font-bold text-gray-900 leading-snug">{ind.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Method: {ind.primaryAssessment}</p>
                    </td>

                    <td className="px-2 py-3 text-center">
                      <Badge variant="outline" className="text-[10px] font-medium">
                        {ind.band}
                      </Badge>
                    </td>

                    <td className="px-3 py-3 text-center">
                      {evaluation.currentRating > 0 ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${ratingInfo.badgeBg} ${ratingInfo.badgeText}`}
                        >
                          Stage {evaluation.currentRating} • {ratingInfo.stage}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px] italic">Not Yet Observed</span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-center">
                      {evaluation.events.length > 0 ? (
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          style={{ borderColor: confRule.color, color: confRule.color }}
                        >
                          {confRule.label} ({evaluation.events.length})
                        </Badge>
                      ) : (
                        <span className="text-gray-300 text-[10px]">—</span>
                      )}
                    </td>

                    {/* Quick Stage 1-4 Logging Buttons */}
                    <td className="px-3 py-3 text-center">
                      <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden shadow-2xs">
                        {[1, 2, 3, 4].map(s => {
                          const isCurrent = evaluation.currentRating === s;
                          return (
                            <button
                              key={s}
                              onClick={() => handleQuickRate(ind.id, s as DevelopmentalRating)}
                              title={`Log Stage ${s} (${DEVELOPMENTAL_RATINGS[s as DevelopmentalRating].stage})`}
                              className={`px-2.5 py-1 text-[11px] font-bold transition-colors ${
                                isCurrent
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white text-gray-600 hover:bg-gray-100 border-r last:border-r-0'
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onOpenAssessModal(selectedChildId, ind.id)}
                        className="text-xs text-indigo-700 hover:bg-indigo-50 h-7 px-2 gap-1"
                      >
                        Details <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {indicatorsInDomain.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    No indicators match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
