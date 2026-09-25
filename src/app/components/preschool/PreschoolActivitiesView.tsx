import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import { DevelopmentalBand, EvidenceEvent } from '../../types/preschoolDevelopmental';
import { MASTER_PRESCHOOL_ACTIVITIES } from '../../data/preschoolActivities';
import { MASTER_PRESCHOOL_INDICATORS } from '../../data/preschoolIndicators';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Sparkles, Search, Filter, Clock, Users, BookOpen,
  CheckCircle2, Compass, ArrowRight, X, Play, HelpCircle, Layers
} from 'lucide-react';
import { toast } from 'sonner';

interface PreschoolActivitiesViewProps {
  childrenList: User[];
  events: EvidenceEvent[];
  onOpenAssessModal: (childId?: string, indicatorId?: string) => void;
  currentUser: User;
  onRefresh: () => void;
}

export function PreschoolActivitiesView({
  childrenList,
  events,
  onOpenAssessModal,
  currentUser,
  onRefresh,
}: PreschoolActivitiesViewProps) {
  const [search, setSearch] = useState('');
  const [selectedBand, setSelectedBand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [selectedChildForActivity, setSelectedChildForActivity] = useState<string>(
    childrenList[0]?.id || ''
  );

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(MASTER_PRESCHOOL_ACTIVITIES.map(a => a.category));
    return Array.from(set);
  }, []);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return MASTER_PRESCHOOL_ACTIVITIES.filter(act => {
      if (selectedBand !== 'all' && !act.ageBands.includes(selectedBand as DevelopmentalBand)) {
        return false;
      }
      if (selectedCategory !== 'all' && act.category !== selectedCategory) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matchesTitle = act.title.toLowerCase().includes(q);
        const matchesDesc = act.description.toLowerCase().includes(q);
        const matchesMat = act.materialsNeeded.some(m => m.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesMat) return false;
      }
      return true;
    });
  }, [search, selectedBand, selectedCategory]);

  const activeActivity = MASTER_PRESCHOOL_ACTIVITIES.find(a => a.id === activeActivityId);

  // Find mapped indicators for active activity
  const mappedIndicators = useMemo(() => {
    if (!activeActivity) return [];
    return MASTER_PRESCHOOL_INDICATORS.filter(ind =>
      activeActivity.mappedIndicatorIds.includes(ind.id)
    );
  }, [activeActivity]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-600 text-white font-medium">Cross-Domain Play Bank</Badge>
              <Badge variant="outline" className="text-xs">Continuous Observation</Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Play-Based Developmental Activities
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Conduct high-engagement play routines designed to assess multiple developmental competencies concurrently across cognitive, language, motor, and socio-emotional domains.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Child for Quick Observe:
            </span>
            <select
              value={selectedChildForActivity}
              onChange={e => setSelectedChildForActivity(e.target.value)}
              className="text-xs border rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 dark:border-slate-800 font-medium"
            >
              {childrenList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search activities by name, materials, or instructions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Band selector */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
                <span className="px-2 font-medium text-slate-500">Band:</span>
                {['all', 'P1', 'P2', 'P3', 'P4'].map(b => (
                  <button
                    key={b}
                    onClick={() => setSelectedBand(b)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      selectedBand === b
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {b === 'all' ? 'All Bands' : b}
                  </button>
                ))}
              </div>

              {/* Category selector */}
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="h-8 text-xs border rounded-lg px-2.5 bg-white dark:bg-slate-900 dark:border-slate-800 font-medium"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map(activity => (
          <Card
            key={activity.id}
            className="flex flex-col border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow group"
          >
            <CardHeader className="pb-3 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[11px] font-semibold">
                  {activity.category}
                </Badge>
                <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                  <Clock className="h-3 w-3" />
                  <span>{activity.durationMinutes}m</span>
                </div>
              </div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {activity.title}
              </CardTitle>
              <div className="flex flex-wrap gap-1">
                {activity.ageBands.map(b => (
                  <Badge
                    key={b}
                    variant="outline"
                    className="text-[10px] py-0 px-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200"
                  >
                    Band {b}
                  </Badge>
                ))}
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between space-y-4 pt-0">
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                  {activity.description}
                </p>

                {/* Materials preview */}
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Required Materials:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {activity.materialsNeeded.slice(0, 3).map((mat, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full"
                      >
                        {mat}
                      </span>
                    ))}
                    {activity.materialsNeeded.length > 3 && (
                      <span className="text-[10px] text-slate-400 px-1 self-center">
                        +{activity.materialsNeeded.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Mapped Indicators */}
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Observed Competencies:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {activity.mappedIndicatorIds.map(id => (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="text-[10px] py-0 px-1.5 font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60"
                      >
                        {id}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveActivityId(activity.id)}
                  className="text-xs flex-1 gap-1.5"
                >
                  <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                  View Guide
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const firstInd = activity.mappedIndicatorIds[0];
                    onOpenAssessModal(selectedChildForActivity, firstInd);
                  }}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1"
                >
                  <Play className="h-3.5 w-3.5" />
                  Observe
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Detail Modal */}
      {activeActivity && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-600 text-white">{activeActivity.category}</Badge>
                  <Badge variant="outline" className="text-xs">
                    {activeActivity.durationMinutes} Minutes
                  </Badge>
                  {activeActivity.ageBands.map(b => (
                    <Badge key={b} variant="secondary" className="text-xs">
                      Band {b}
                    </Badge>
                  ))}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {activeActivity.title}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveActivityId(null)}
                className="h-8 w-8 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Activity Overview
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeActivity.description}
                </p>
              </div>

              {/* Cultural Adaptation Notes */}
              {activeActivity.culturalAdaptationNotes && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl space-y-1">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5" />
                    Local Ghanaian Context & Materials Adaptation
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    {activeActivity.culturalAdaptationNotes}
                  </p>
                </div>
              )}

              {/* Materials */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Required Materials Checklist
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeActivity.materialsNeeded.map((mat, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>{mat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Facilitator Guidance & Procedure
                </h4>
                <div className="space-y-2">
                  {activeActivity.teacherInstructions.map((inst, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold shrink-0 text-[11px]">
                        {i + 1}
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-normal">{inst}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observation Guidance */}
              <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl space-y-1.5">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4" />
                  What to Look For During Play
                </div>
                <p className="text-xs text-amber-800/90 dark:text-amber-400 leading-relaxed">
                  {activeActivity.behaviourToObserve}
                </p>
              </div>

              {/* Mapped Indicators With Quick Action */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Mapped Developmental Indicators ({mappedIndicators.length})
                </h4>
                <div className="space-y-2">
                  {mappedIndicators.map(ind => (
                    <div
                      key={ind.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                            {ind.id}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {ind.clusterName}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            Band {ind.band}
                          </Badge>
                        </div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          {ind.title}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setActiveActivityId(null);
                          onOpenAssessModal(selectedChildForActivity, ind.id);
                        }}
                        className="text-xs shrink-0 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Log Evidence
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end">
              <Button variant="outline" size="sm" onClick={() => setActiveActivityId(null)}>
                Close Guide
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
