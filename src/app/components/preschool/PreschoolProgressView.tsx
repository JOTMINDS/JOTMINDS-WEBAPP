import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import {
  EvidenceEvent,
  DevelopmentalDomainCode,
  DevelopmentalRating,
  AssessmentMethodCode,
  DEVELOPMENTAL_DOMAINS,
  DEVELOPMENTAL_RATINGS,
  ASSESSMENT_METHODS,
  LanguageOfEvidence,
} from '../../types/preschoolDevelopmental';
import { MASTER_PRESCHOOL_INDICATORS } from '../../data/preschoolIndicators';
import { deleteEvidenceEvent } from '../../utils/preschoolStorage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Calendar, Clock, User as UserIcon, BookOpen, Trash2,
  Plus, Search, Filter, CheckCircle2, AlertCircle, ArrowUpRight,
  TrendingUp, Globe, FileText, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface PreschoolProgressViewProps {
  childrenList: User[];
  events: EvidenceEvent[];
  currentUser: User;
  onOpenAssessModal: (childId?: string, indicatorId?: string) => void;
  onRefresh: () => void;
}

export function PreschoolProgressView({
  childrenList,
  events,
  currentUser,
  onOpenAssessModal,
  onRefresh,
}: PreschoolProgressViewProps) {
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Map indicator lookup for quick titles
  const indicatorLookup = useMemo(() => {
    const map = new Map<string, (typeof MASTER_PRESCHOOL_INDICATORS)[0]>();
    MASTER_PRESCHOOL_INDICATORS.forEach(ind => map.set(ind.id, ind));
    return map;
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (selectedChildId !== 'all' && e.childId !== selectedChildId) return false;
      if (selectedDomain !== 'all' && e.domainCode !== selectedDomain) return false;
      if (selectedRating !== 'all' && String(e.rating) !== selectedRating) return false;
      if (selectedMethod !== 'all' && e.method !== selectedMethod) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const ind = indicatorLookup.get(e.indicatorId);
        const matchesChild = (e.childName || '').toLowerCase().includes(q);
        const matchesNotes = (e.notes || '').toLowerCase().includes(q);
        const matchesContext = (e.activityContext || '').toLowerCase().includes(q);
        const matchesIndId = e.indicatorId.toLowerCase().includes(q);
        const matchesIndTitle = ind ? ind.title.toLowerCase().includes(q) : false;
        if (!matchesChild && !matchesNotes && !matchesContext && !matchesIndId && !matchesIndTitle) {
          return false;
        }
      }
      return true;
    });
  }, [events, selectedChildId, selectedDomain, selectedRating, selectedMethod, searchQuery, indicatorLookup]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const uniqueIndicators = new Set(filteredEvents.map(e => e.indicatorId)).size;
    const uniqueChildren = new Set(filteredEvents.map(e => e.childId)).size;
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    filteredEvents.forEach(e => {
      if (e.rating >= 1 && e.rating <= 4) {
        ratingCounts[e.rating as 1 | 2 | 3 | 4] = (ratingCounts[e.rating as 1 | 2 | 3 | 4] || 0) + 1;
      }
    });

    return {
      total: filteredEvents.length,
      uniqueIndicators,
      uniqueChildren,
      ratingCounts,
    };
  }, [filteredEvents]);

  // Handle Event Deletion
  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to remove this observation record?')) return;
    setDeletingId(eventId);
    const ok = await deleteEvidenceEvent(eventId);
    setDeletingId(null);
    if (ok) {
      toast.success('Observation record deleted.');
      onRefresh();
    } else {
      toast.error('Failed to delete observation record.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-teal-500/10 border border-blue-200/50 dark:border-blue-900/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-white font-medium">Longitudinal Progress</Badge>
              <Badge variant="outline" className="text-xs">Continuous Observation Log</Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Developmental Evidence Timeline
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Chronological log of authentic play-based evidence, observations, and milestones recorded by facilitators and parents across all 7 developmental domains.
            </p>
          </div>
          <Button
            onClick={() => onOpenAssessModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm text-xs"
          >
            <Plus className="h-4 w-4" />
            Log New Observation
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500">Observations Logged</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.total}</div>
            <span className="text-[11px] text-slate-500">Recorded evidence events</span>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500">Indicators Assessed</span>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {metrics.uniqueIndicators}
              <span className="text-xs font-normal text-slate-400"> / 240</span>
            </div>
            <span className="text-[11px] text-slate-500">Across framework domains</span>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500">Children Covered</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.uniqueChildren}
              <span className="text-xs font-normal text-slate-400"> / {childrenList.length}</span>
            </div>
            <span className="text-[11px] text-slate-500">Active roster profiles</span>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500">Achieving or Extending</span>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {metrics.total > 0
                ? `${Math.round(((metrics.ratingCounts[3] + metrics.ratingCounts[4]) / metrics.total) * 100)}%`
                : '0%'}
            </div>
            <span className="text-[11px] text-slate-500">Mastery proportion</span>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search notes, children, or competencies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Child Filter */}
              <select
                value={selectedChildId}
                onChange={e => setSelectedChildId(e.target.value)}
                className="h-9 text-xs border rounded-lg px-2.5 bg-white dark:bg-slate-900 dark:border-slate-800 font-medium"
              >
                <option value="all">All Children ({childrenList.length})</option>
                {childrenList.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Domain Filter */}
              <select
                value={selectedDomain}
                onChange={e => setSelectedDomain(e.target.value)}
                className="h-9 text-xs border rounded-lg px-2.5 bg-white dark:bg-slate-900 dark:border-slate-800 font-medium"
              >
                <option value="all">All Domains (7)</option>
                {Object.values(DEVELOPMENTAL_DOMAINS).map(d => (
                  <option key={d.code} value={d.code}>
                    {d.shortName}
                  </option>
                ))}
              </select>

              {/* Rating Stage Filter */}
              <select
                value={selectedRating}
                onChange={e => setSelectedRating(e.target.value)}
                className="h-9 text-xs border rounded-lg px-2.5 bg-white dark:bg-slate-900 dark:border-slate-800 font-medium"
              >
                <option value="all">All Rating Stages</option>
                {Object.values(DEVELOPMENTAL_RATINGS).filter(r => r.level > 0).map(r => (
                  <option key={r.level} value={String(r.level)}>
                    Stage {r.level}: {r.stage}
                  </option>
                ))}
              </select>

              {/* Method Filter */}
              <select
                value={selectedMethod}
                onChange={e => setSelectedMethod(e.target.value)}
                className="h-9 text-xs border rounded-lg px-2.5 bg-white dark:bg-slate-900 dark:border-slate-800 font-medium"
              >
                <option value="all">All Methods</option>
                {Object.values(ASSESSMENT_METHODS).map(m => (
                  <option key={m.code} value={m.code}>
                    {m.code} - {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Stream */}
      {filteredEvents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No Observation Events Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No evidence events match your current filter criteria. Try adjusting your search query or log an observation.
            </p>
            <Button
              size="sm"
              onClick={() => onOpenAssessModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Log Observation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map(event => {
            const ind = indicatorLookup.get(event.indicatorId);
            const domain = DEVELOPMENTAL_DOMAINS[event.domainCode as DevelopmentalDomainCode];
            const ratingDef = DEVELOPMENTAL_RATINGS[event.rating as DevelopmentalRating];
            const methodDef = event.method ? ASSESSMENT_METHODS[event.method as AssessmentMethodCode] : undefined;

            return (
              <Card
                key={event.id}
                className="border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
              >
                <CardContent className="p-4 sm:p-5 space-y-3">
                  {/* Top Bar: Child name, Date, Rating badge, Delete */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs">
                        {event.childName ? event.childName.charAt(0) : 'C'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {event.childName || 'Child'}
                          </span>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">
                            {event.indicatorId}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {event.date}
                          </span>
                          <span>•</span>
                          <span>Observer: {event.observerName || 'Facilitator'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {/* Rating Stage Badge */}
                      <Badge
                        className={`text-xs px-2.5 py-0.5 font-semibold ${
                          event.rating === 4
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200'
                            : event.rating === 3
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                            : event.rating === 2
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200'
                        }`}
                        variant="outline"
                      >
                        Stage {event.rating}: {ratingDef?.stage || 'Observed'}
                      </Badge>

                      {/* Delete action */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(event.id)}
                        disabled={deletingId === event.id}
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Indicator Title & Domain Info */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {domain?.name || event.domainCode}
                      </Badge>
                      {ind?.clusterName && (
                        <span className="text-[11px] text-slate-500">
                          › {ind.clusterName}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {ind?.title || event.indicatorId}
                    </div>
                  </div>

                  {/* Context chips & Language */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {event.activityContext && (
                      <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md font-medium">
                        Context: {event.activityContext}
                      </span>
                    )}
                    {event.method && (
                      <span className="text-[11px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md font-medium">
                        Method: {methodDef?.label || event.method}
                      </span>
                    )}
                    {event.languageOfEvidence && (
                      <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {event.languageOfEvidence}
                      </span>
                    )}
                  </div>

                  {/* Observational notes */}
                  <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="font-semibold text-slate-900 dark:text-white">Observation: </span>
                    {event.notes || 'No specific notes recorded.'}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
