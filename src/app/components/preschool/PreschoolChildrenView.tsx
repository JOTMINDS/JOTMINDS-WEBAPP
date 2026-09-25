import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import {
  ChildDevelopmentalProfile,
  DevelopmentalBand,
  DEVELOPMENTAL_BANDS,
  DEVELOPMENTAL_DOMAINS,
  EvidenceEvent,
} from '../../types/preschoolDevelopmental';
import {
  calculateChildDevelopmentProfile,
  resolveChildBand,
} from '../../utils/preschoolEngine';
import { getEvidenceEventsForChild } from '../../utils/preschoolStorage';
import {
  generateChildDevelopmentReportPDF,
  generateParentSummaryPDF,
  generateSchoolReadinessPDF,
} from '../../utils/preschoolPdfGenerator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import {
  Users, Search, Plus, FileText, Download, CheckCircle2,
  AlertTriangle, Eye, X, Sparkles, BookOpen, GraduationCap,
  HeartHandshake, Compass, Brain, Calculator, Activity, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

interface PreschoolChildrenViewProps {
  childrenList: User[];
  events: EvidenceEvent[];
  onOpenAssessModal: (childId: string) => void;
  currentUser: User;
}

export function PreschoolChildrenView({
  childrenList,
  events,
  onOpenAssessModal,
  currentUser,
}: PreschoolChildrenViewProps) {
  const [search, setSearch] = useState('');
  const [selectedBand, setSelectedBand] = useState<string>('all');
  const [activeChildProfile, setActiveChildProfile] = useState<ChildDevelopmentalProfile | null>(null);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'readiness' | 'parent'>('profile');

  // Filter children
  const filteredChildren = useMemo(() => {
    return childrenList.filter(c => {
      const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
      const band = resolveChildBand(c);
      const matchesBand = selectedBand === 'all' || band === selectedBand;
      return matchesSearch && matchesBand;
    });
  }, [childrenList, search, selectedBand]);

  const handleOpenProfile = (child: User) => {
    const childEvents = getEvidenceEventsForChild(child.id);
    const profile = calculateChildDevelopmentProfile(child, childEvents);
    setActiveChildProfile(profile);
    setProfileModalTab('profile');
  };

  const handleDownloadDossier = async (profile: ChildDevelopmentalProfile) => {
    toast.loading('Generating Child Developmental Dossier PDF...', { id: 'pdf-gen' });
    const ok = await generateChildDevelopmentReportPDF(profile);
    if (ok) toast.success('Developmental Dossier downloaded!', { id: 'pdf-gen' });
    else toast.error('Failed to generate PDF', { id: 'pdf-gen' });
  };

  const handleDownloadParent = async (profile: ChildDevelopmentalProfile) => {
    toast.loading('Generating Parent Summary PDF...', { id: 'pdf-gen' });
    const ok = await generateParentSummaryPDF(profile);
    if (ok) toast.success('Parent Summary downloaded!', { id: 'pdf-gen' });
    else toast.error('Failed to generate PDF', { id: 'pdf-gen' });
  };

  const handleDownloadReadiness = async (profile: ChildDevelopmentalProfile) => {
    if (!profile.schoolReadiness) return;
    toast.loading('Generating School Readiness Portfolio PDF...', { id: 'pdf-gen' });
    const ok = await generateSchoolReadinessPDF(profile.child.name, profile.schoolReadiness);
    if (ok) toast.success('School Readiness Portfolio downloaded!', { id: 'pdf-gen' });
    else toast.error('Failed to generate PDF', { id: 'pdf-gen' });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search child by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        {/* Age Band Filter Tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Bands (2–6 yrs)' },
            { id: 'P1', label: 'JM-P1 (2–3 yrs)' },
            { id: 'P2', label: 'JM-P2 (3–4 yrs)' },
            { id: 'P3', label: 'JM-P3 (4–5 yrs)' },
            { id: 'P4', label: 'JM-P4 (5–6 yrs)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedBand(tab.id)}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                selectedBand === tab.id
                  ? 'bg-indigo-600 text-white font-medium shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Children Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChildren.map(child => {
          const childBand = resolveChildBand(child);
          const bandMeta = DEVELOPMENTAL_BANDS[childBand];
          const childEvents = events.filter(e => e.childId === child.id);
          const distinctDomains = new Set(childEvents.map(e => e.domainCode)).size;

          return (
            <Card
              key={child.id}
              className="hover:shadow-md transition-shadow border-gray-200 flex flex-col justify-between"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-bold text-gray-900">{child.name}</CardTitle>
                    <CardDescription className="text-xs text-gray-500">
                      {child.age ? `${child.age} yrs` : 'Early Years'} • Class: {child.className || 'Preschool'}
                    </CardDescription>
                  </div>
                  <Badge
                    className="text-[10px] text-white border-0 font-bold"
                    style={{ backgroundColor: bandMeta.color }}
                  >
                    {bandMeta.code}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-1">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Observations</span>
                    <span className="font-bold text-gray-800">{childEvents.length} events</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Domains Tracked</span>
                    <span className="font-bold text-indigo-700">{distinctDomains} of 7</span>
                  </div>
                </div>

                <div className="text-[11px] text-gray-600 line-clamp-1">
                  <span className="text-gray-400">Emphasis: </span>
                  {bandMeta.primaryEmphasis}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenProfile(child)}
                    className="flex-1 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50 gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Profile
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onOpenAssessModal(child.id)}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log Evidence
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredChildren.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400">
            No children match the current filter.
          </div>
        )}
      </div>

      {/* Child Profile Modal */}
      {activeChildProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30">
                  <BookOpen className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {activeChildProfile.child.name} — Developmental Profile
                  </h3>
                  <p className="text-xs text-indigo-200">
                    {activeChildProfile.ageYears} yrs • Band {activeChildProfile.assignedBand} •{' '}
                    {activeChildProfile.totalEvidenceEvents} Evidence Events
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveChildProfile(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-5 pt-2 text-xs">
              <button
                onClick={() => setProfileModalTab('profile')}
                className={`px-4 py-2 border-b-2 font-semibold transition-all ${
                  profileModalTab === 'profile'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                7 Core Domains Profile
              </button>
              {activeChildProfile.schoolReadiness && (
                <button
                  onClick={() => setProfileModalTab('readiness')}
                  className={`px-4 py-2 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
                    profileModalTab === 'readiness'
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  School Readiness (Band P4)
                </button>
              )}
              <button
                onClick={() => setProfileModalTab('parent')}
                className={`px-4 py-2 border-b-2 font-semibold transition-all ${
                  profileModalTab === 'parent'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Parent Narrative & Home Guide
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* TAB 1: 7 CORE DOMAINS */}
              {profileModalTab === 'profile' && (
                <div className="space-y-6">
                  {/* Radar Chart & Key Strengths */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="h-64 flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-gray-600 mb-1">
                        Multidimensional Developmental Radar
                      </span>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart
                          data={Object.values(activeChildProfile.domains).map(d => ({
                            domain: d.shortName,
                            stage: d.averageStage || 1.5,
                            fullMark: 4,
                          }))}
                        >
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10, fill: '#475569' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fontSize: 8 }} />
                          <Radar
                            name="Developmental Stage"
                            dataKey="stage"
                            stroke="#6B4C9A"
                            fill="#7B61FF"
                            fillOpacity={0.4}
                          />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Emerging Strengths */}
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                        <span className="font-bold text-emerald-900 block mb-1">
                          🌟 Emerging Strengths (Achieving Independently):
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-emerald-800">
                          {activeChildProfile.overallEmergingStrengths.map((str, idx) => (
                            <li key={idx}>{str}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Growing Competencies */}
                      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                        <span className="font-bold text-amber-900 block mb-1">
                          🌱 Currently Developing & Practicing:
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-amber-800">
                          {activeChildProfile.priorityDevelopmentAreas.map((pri, idx) => (
                            <li key={idx}>{pri}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 7 Domains Detailed Grid */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                      Developmental Domains Progression
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.values(activeChildProfile.domains).map(d => (
                        <div
                          key={d.domainCode}
                          className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">{d.domainName}</span>
                            <Badge
                              className={`text-[10px] font-semibold ${
                                d.averageStage >= 2.8
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : d.averageStage >= 1.8
                                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                                  : 'bg-red-100 text-red-800 border-red-200'
                              }`}
                            >
                              {d.stageLabel}
                            </Badge>
                          </div>

                          <div className="flex justify-between text-[11px] text-gray-500">
                            <span>Stage: <b>{d.averageStage > 0 ? `${d.averageStage} / 4.0` : '—'}</b></span>
                            <span>Observed: <b>{d.observedCount} / {d.totalIndicators}</b></span>
                          </div>

                          {/* Confidence */}
                          <div className="text-[10px] text-gray-400">
                            Confidence: {d.confidenceDistribution.high} High • {d.confidenceDistribution.moderate} Moderate • {d.confidenceDistribution.low} Low
                          </div>

                          {/* Suggested Action */}
                          {d.suggestedTeacherActions[0] && (
                            <p className="text-[11px] text-indigo-700 bg-indigo-50/60 p-2 rounded border border-indigo-100">
                              <b>Classroom Next Step:</b> {d.suggestedTeacherActions[0]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SCHOOL READINESS (BAND P4) */}
              {profileModalTab === 'readiness' && activeChildProfile.schoolReadiness && (
                <div className="space-y-5 text-xs">
                  {/* Narrative Card */}
                  <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
                    <span className="font-bold text-amber-950 block mb-1">
                      School Readiness Narrative (Kindergarten to Primary 1 Transition)
                    </span>
                    <p className="text-amber-900 leading-relaxed">
                      {activeChildProfile.schoolReadiness.overallReadinessSummary}
                    </p>
                  </div>

                  {/* 7 Readiness Dimensions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeChildProfile.schoolReadiness.dimensions.map(dim => (
                      <div
                        key={dim.dimension}
                        className="p-3 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">{dim.dimension}</span>
                          <Badge
                            className={`text-[10px] ${
                              dim.score >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : dim.score >= 65
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {dim.stageLabel} ({dim.score}%)
                          </Badge>
                        </div>
                        <p className="text-[11px] text-gray-500">{dim.keyEvidence}</p>
                      </div>
                    ))}
                  </div>

                  {/* Transition Checklist */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-gray-800 block mb-2">
                      Primary 1 Transition Readiness Checklist
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {activeChildProfile.schoolReadiness.classroomPreparationChecklist.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 ${
                              item.isConsolidated ? 'text-emerald-600' : 'text-gray-300'
                            }`}
                          />
                          <span className={item.isConsolidated ? 'text-gray-800 font-medium' : 'text-gray-500'}>
                            {item.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PARENT NARRATIVE & HOME GUIDE */}
              {profileModalTab === 'parent' && (
                <div className="space-y-5 text-xs">
                  <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl">
                    <span className="font-bold text-indigo-950 block mb-1">
                      Parent-Friendly Developmental Narrative
                    </span>
                    <p className="text-indigo-900 leading-relaxed mb-3">
                      {activeChildProfile.parentSummary.narrativeSummary}
                    </p>
                    <span className="font-bold text-emerald-800 block mb-1">What we celebrate:</span>
                    <ul className="list-disc pl-4 text-emerald-700 space-y-0.5">
                      {activeChildProfile.parentSummary.highlightStrengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Home Activities */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Playful Home Activities
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {activeChildProfile.parentSummary.recommendedHomeActivities.map((act, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-1.5"
                        >
                          <span className="font-bold text-indigo-900 block">{act.title}</span>
                          <p className="text-[11px] text-gray-600 leading-relaxed">{act.description}</p>
                          <span className="text-[10px] text-gray-400 block">
                            Materials: {act.materials}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Downloads */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveChildProfile(null)}
                className="text-xs"
              >
                Close
              </Button>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadParent(activeChildProfile)}
                  className="text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50 gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Parent Guide PDF
                </Button>
                {activeChildProfile.schoolReadiness && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadReadiness(activeChildProfile)}
                    className="text-xs text-amber-700 border-amber-200 hover:bg-amber-50 gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> School Readiness PDF
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => handleDownloadDossier(activeChildProfile)}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download Full Dossier PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
