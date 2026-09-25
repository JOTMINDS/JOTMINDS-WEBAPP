import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import {
  ChildDevelopmentalProfile,
  EvidenceEvent,
  DevelopmentalDomainCode,
  DevelopmentalRating,
  LanguageOfEvidence,
  DEVELOPMENTAL_DOMAINS,
  DEVELOPMENTAL_RATINGS,
} from '../../types/preschoolDevelopmental';
import { calculateChildDevelopmentProfile } from '../../utils/preschoolEngine';
import { saveEvidenceEvent } from '../../utils/preschoolStorage';
import { generateParentSummaryPDF } from '../../utils/preschoolPdfGenerator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Heart, Download, Plus, CheckCircle2, MessageSquare,
  Sparkles, Calendar, User as UserIcon, Globe, BookOpen, Send
} from 'lucide-react';
import { toast } from 'sonner';

interface PreschoolParentsViewProps {
  childrenList: User[];
  events: EvidenceEvent[];
  currentUser: User;
  onRefresh: () => void;
}

export function PreschoolParentsView({
  childrenList,
  events,
  currentUser,
  onRefresh,
}: PreschoolParentsViewProps) {
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenList[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Parent Voice Form State
  const [parDomain, setParDomain] = useState<DevelopmentalDomainCode>('JM-SE');
  const [parContext, setParContext] = useState('Home Routine / Play');
  const [parRating, setParRating] = useState<DevelopmentalRating>(3);
  const [parLanguage, setParLanguage] = useState<LanguageOfEvidence>('English');
  const [parNotes, setParNotes] = useState('');
  const [parObserverName, setParObserverName] = useState(currentUser.name || 'Parent / Caregiver');

  const selectedChild = childrenList.find(c => c.id === selectedChildId) || childrenList[0];

  // Calculate Child Developmental Profile
  const childProfile = useMemo(() => {
    if (!selectedChild) return null;
    return calculateChildDevelopmentProfile(selectedChild, events);
  }, [selectedChild, events]);

  // Filter home observations for this child
  const homeEvents = useMemo(() => {
    if (!selectedChild) return [];
    return events.filter(e => e.childId === selectedChild.id && e.method === 'PAR');
  }, [selectedChild, events]);

  // Handle PDF Generation
  const handleDownloadParentSummary = async () => {
    if (!childProfile) return;
    setIsGeneratingPdf(true);
    try {
      const ok = await generateParentSummaryPDF(childProfile);
      if (ok) {
        toast.success(`Parent Summary PDF generated for ${selectedChild.name}!`);
      } else {
        toast.error('Failed to generate PDF.');
      }
    } catch {
      toast.error('Error generating PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Submit Home Observation (PAR)
  const handleSubmitHomeObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;
    if (!parNotes.trim()) {
      toast.error('Please enter observational notes describing what you saw at home.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newEvent: EvidenceEvent = {
        id: `par_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        childId: selectedChild.id,
        childName: selectedChild.name,
        indicatorId: `${parDomain}-HOME`,
        domainCode: parDomain,
        rating: parRating,
        method: 'PAR',
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        observerId: currentUser.id || 'parent_user',
        observerName: parObserverName,
        observerRole: 'parent',
        activityContext: parContext,
        languageOfEvidence: parLanguage,
        notes: parNotes.trim(),
        classId: selectedChild.classId,
        institutionId: selectedChild.institutionId,
      };

      const success = await saveEvidenceEvent(newEvent);
      if (success) {
        toast.success('Home observation logged successfully!');
        setParNotes('');
        onRefresh();
      } else {
        toast.error('Failed to save home observation.');
      }
    } catch {
      toast.error('Error recording home observation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-amber-500/10 border border-rose-200/50 dark:border-rose-900/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-rose-600 text-white font-medium">Family & Home Bridge</Badge>
              <Badge variant="outline" className="text-xs">Co-Assessment Portal</Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Parent Partnership & Home Progress
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Nurture reciprocal communication with families through jargon-free developmental narratives, accessible home play ideas, and caregiver milestone logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Viewing Child:</span>
            <select
              value={selectedChildId}
              onChange={e => setSelectedChildId(e.target.value)}
              className="text-xs border rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 dark:border-slate-800 font-medium shadow-xs"
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

      {childProfile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Narrative Summary & Home Activities (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Warm Narrative Card */}
            <Card className="border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 shadow-xs">
              <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-base font-bold text-rose-950 dark:text-rose-200 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-500" />
                    Celebrating {selectedChild?.name}’s Growth
                  </CardTitle>
                  <CardDescription className="text-xs text-rose-800/80 dark:text-rose-300">
                    A caring summary written for families without clinical jargon
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={handleDownloadParentSummary}
                  disabled={isGeneratingPdf}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1.5 shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  {isGeneratingPdf ? 'Generating...' : 'Download Parent PDF'}
                </Button>
              </CardHeader>

              <CardContent className="space-y-4 pt-0 text-xs">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-rose-100 dark:border-rose-900/40">
                  "{childProfile.parentSummary.greeting}"
                </p>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {childProfile.parentSummary.narrativeSummary}
                </p>

                {/* Highlights and What We Are Practicing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 space-y-2">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                      What Your Child Can Do:
                    </span>
                    <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                      {childProfile.parentSummary.highlightStrengths.map((str, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-tight">{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 space-y-2">
                    <span className="font-bold text-amber-900 dark:text-amber-200 text-xs flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-amber-500" />
                      What We Are Practicing Next:
                    </span>
                    <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                      {childProfile.parentSummary.whatWeArePracticing.map((prac, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span className="text-[11px] leading-tight">{prac}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Home Play Activities */}
            <Card className="border border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Everyday Home Play Routines
                </CardTitle>
                <CardDescription className="text-xs">
                  Low-cost, playful interactions using common household materials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {childProfile.parentSummary.recommendedHomeActivities.map((act, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="font-bold text-slate-900 dark:text-white">
                      {act.title}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {act.description}
                    </p>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Materials:
                      </span>
                      <span>{act.materials}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Home Observation Form (PAR) (1 col) */}
          <div className="space-y-6">
            {/* Form Card */}
            <Card className="border border-slate-200 dark:border-slate-800 shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-rose-500" />
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                    Record Home Observation
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Parent/Caregiver Voice (Method PAR)
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <form onSubmit={handleSubmitHomeObservation} className="space-y-3 text-xs">
                  {/* Observer Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Caregiver / Observer Name
                    </label>
                    <Input
                      value={parObserverName}
                      onChange={e => setParObserverName(e.target.value)}
                      placeholder="e.g. Mrs. Mensah (Mother)"
                      className="h-8 text-xs"
                    />
                  </div>

                  {/* Domain */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Observed Competency Domain
                    </label>
                    <select
                      value={parDomain}
                      onChange={e => setParDomain(e.target.value as any)}
                      className="w-full h-8 text-xs border rounded-lg px-2 bg-white dark:bg-slate-900 dark:border-slate-800"
                    >
                      {Object.values(DEVELOPMENTAL_DOMAINS).map(d => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Context */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Home Setting / Context
                    </label>
                    <Input
                      value={parContext}
                      onChange={e => setParContext(e.target.value)}
                      placeholder="e.g. Dinner prep, bedtime story, garden play"
                      className="h-8 text-xs"
                    />
                  </div>

                  {/* Language */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Language Spoken at Home
                    </label>
                    <select
                      value={parLanguage}
                      onChange={e => setParLanguage(e.target.value as any)}
                      className="w-full h-8 text-xs border rounded-lg px-2 bg-white dark:bg-slate-900 dark:border-slate-800"
                    >
                      <option value="English">English</option>
                      <option value="Twi">Twi</option>
                      <option value="Ga">Ga</option>
                      <option value="Ewe">Ewe</option>
                      <option value="French">French</option>
                      <option value="Other/Home Language">Other / Home Language</option>
                    </select>
                  </div>

                  {/* Rating / Level */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Observed Stage
                    </label>
                    <select
                      value={parRating}
                      onChange={e => setParRating(Number(e.target.value) as any)}
                      className="w-full h-8 text-xs border rounded-lg px-2 bg-white dark:bg-slate-900 dark:border-slate-800"
                    >
                      <option value={1}>Stage 1: Emerging (Needs support)</option>
                      <option value={2}>Stage 2: Developing (With reminders)</option>
                      <option value={3}>Stage 3: Achieving (Does independently)</option>
                      <option value={4}>Stage 4: Extending (Teaches/helps others)</option>
                    </select>
                  </div>

                  {/* Observation Note */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      What did the child do?
                    </label>
                    <Textarea
                      value={parNotes}
                      onChange={e => setParNotes(e.target.value)}
                      placeholder="Describe what you observed the child say, create, or accomplish..."
                      rows={3}
                      className="text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isSubmitting ? 'Saving...' : 'Submit Home Observation'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Historical Home Observations */}
            <Card className="border border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Caregiver Notes Log ({homeEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0 text-xs max-h-60 overflow-y-auto">
                {homeEvents.length === 0 ? (
                  <p className="text-slate-400 text-[11px] py-4 text-center">
                    No home observations recorded yet for this child.
                  </p>
                ) : (
                  homeEvents.map(e => (
                    <div
                      key={e.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {e.observerName || 'Caregiver'}
                        </span>
                        <span className="text-slate-400 text-[10px]">{e.date}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-tight">
                        {e.notes}
                      </p>
                      <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-500">
                        <Badge variant="outline" className="text-[9px] py-0 px-1">
                          {e.languageOfEvidence}
                        </Badge>
                        <span>•</span>
                        <span>{e.activityContext}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
