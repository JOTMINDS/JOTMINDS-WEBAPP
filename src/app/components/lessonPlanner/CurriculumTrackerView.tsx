import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { InfoTip } from '../ui/info-tip';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CheckCircle2, Clock, Circle, BookOpen, Sparkles, Loader, Plus, ListTree, Trash2, ArrowRight } from 'lucide-react';
import { CurriculumTrack, CurriculumTopic, LessonPlan } from '../../types/lessonPlannerTypes';
import {
  getCurriculumSchemes,
  saveCurriculumScheme,
  deleteCurriculumScheme,
  getPostLessonReflections,
} from '../../utils/lessonPlannerStorage';
import { effectiveStatus, summarizeTopics } from '../../utils/curriculumProgress';
import { generateAICurriculumTopics } from '../../utils/aiService';
import { toast } from 'sonner';

interface CurriculumTrackerViewProps {
  plan?: LessonPlan;
  plans: LessonPlan[];
  teacherId?: string;
  onPlanLesson?: (topic: CurriculumTopic, frameworkName: string) => void;
}

// Starter topics for common subjects. They are a starting point to edit, not the official syllabus.
const STARTER_TOPICS: Record<string, Array<{ strand: string; substrand: string; title: string; hours: number }>> = {
  'Mathematics': [
    { strand: 'Number & Operations', substrand: 'Real Number Systems', title: 'Integers, Rational Numbers & Decimals', hours: 4 },
    { strand: 'Number & Operations', substrand: 'Fractions & Percentages', title: 'Fraction Operations & Percentage Applications', hours: 4 },
    { strand: 'Number & Operations', substrand: 'Ratio & Proportion', title: 'Direct and Indirect Proportional Reasoning', hours: 3 },
    { strand: 'Algebra & Functions', substrand: 'Algebraic Expressions', title: 'Simplifying & Expanding Algebraic Expressions', hours: 5 },
    { strand: 'Algebra & Functions', substrand: 'Linear Equations', title: 'Solving Linear Equations in One Variable', hours: 4 },
    { strand: 'Algebra & Functions', substrand: 'Simultaneous Equations', title: 'Solving Simultaneous Linear Equations', hours: 4 },
    { strand: 'Geometry & Measurement', substrand: 'Plane Geometry', title: 'Properties of Triangles, Polygons & Quadrilaterals', hours: 4 },
    { strand: 'Geometry & Measurement', substrand: 'Mensuration', title: 'Perimeter, Area & Volume of 2D/3D Shapes', hours: 4 },
    { strand: 'Statistics & Probability', substrand: 'Data Handling', title: 'Data Collection, Frequency Tables & Bar Charts', hours: 3 },
    { strand: 'Statistics & Probability', substrand: 'Probability', title: 'Simple Probability and Experimental Outcomes', hours: 3 },
  ],
  'Science': [
    { strand: 'Diversity of Matter', substrand: 'Living & Non-Living Things', title: 'Cell Structure, Functions & Organization', hours: 4 },
    { strand: 'Diversity of Matter', substrand: 'Chemical Substances', title: 'Elements, Compounds, Mixtures & Periodic Table', hours: 5 },
    { strand: 'Cycles', substrand: 'Life Cycles', title: 'Plant Reproduction and Seed Germination', hours: 3 },
    { strand: 'Cycles', substrand: 'Environmental Cycles', title: 'Water Cycle, Carbon Cycle & Ecosystem Balance', hours: 4 },
    { strand: 'Systems', substrand: 'Human Body Systems', title: 'Digestive, Respiratory & Circulatory Systems', hours: 6 },
    { strand: 'Systems', substrand: 'Solar System', title: 'Earth, Sun, Moon & Planetary Motions', hours: 3 },
    { strand: 'Energy & Forces', substrand: 'Sources of Energy', title: 'Forms, Transformations & Conservation of Energy', hours: 4 },
    { strand: 'Energy & Forces', substrand: 'Forces & Motion', title: 'Friction, Gravity, Speed & Acceleration', hours: 4 },
  ],
  'English Language': [
    { strand: 'Oral Language', substrand: 'Listening & Speaking', title: 'Effective Communication, Debate & Presentation Skills', hours: 4 },
    { strand: 'Reading & Comprehension', substrand: 'Informational Texts', title: 'Finding Main Ideas, Inferences & Critical Analysis', hours: 5 },
    { strand: 'Reading & Comprehension', substrand: 'Literature & Poetry', title: 'Figurative Language, Themes & Character Analysis', hours: 4 },
    { strand: 'Grammar & Usage', substrand: 'Parts of Speech', title: 'Nouns, Verbs, Modifiers & Prepositions in Context', hours: 4 },
    { strand: 'Grammar & Usage', substrand: 'Sentence Structure', title: 'Complex Sentences, Clauses & Punctuation', hours: 4 },
    { strand: 'Writing', substrand: 'Creative & Narrative Writing', title: 'Descriptive Essays, Short Stories & Character Arcs', hours: 5 },
    { strand: 'Writing', substrand: 'Expository & Formal Writing', title: 'Formal Letters, Reports & Persuasive Essays', hours: 5 },
  ],
  'Computing / ICT': [
    { strand: 'Computer Systems', substrand: 'Hardware & Architecture', title: 'Input/Output Devices, CPU & Storage Media', hours: 3 },
    { strand: 'Computer Systems', substrand: 'Software Concepts', title: 'Operating Systems vs Application Software', hours: 3 },
    { strand: 'Information Technology', substrand: 'Productivity Tools', title: 'Word Processing, Spreadsheets & Digital Presentations', hours: 5 },
    { strand: 'Internet & Cybersecurity', substrand: 'Networks & Web', title: 'Web Browsing, Search Engines & Digital Safety', hours: 4 },
    { strand: 'Programming & Logic', substrand: 'Algorithms', title: 'Flowcharts, Pseudocode & Algorithmic Problem Solving', hours: 6 },
  ],
};

const slug = (text: string) => text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const topicCode = (subject: string, grade: string, n: number) =>
  `${subject.replace(/[^A-Za-z]/g, '').substring(0, 4).toUpperCase()}-${grade.replace(/\s+/g, '')}-${n}`;

function matchStarterKey(subject: string): string | undefined {
  const s = subject.trim().toLowerCase();
  if (!s) return undefined;
  return Object.keys(STARTER_TOPICS).find(k => s.includes(k.toLowerCase()) || k.toLowerCase().includes(s));
}

export const CurriculumTrackerView: React.FC<CurriculumTrackerViewProps> = ({ plan, plans, teacherId, onPlanLesson }) => {
  const [schemes, setSchemes] = useState<CurriculumTrack[]>(() => getCurriculumSchemes(teacherId));
  const reflections = useMemo(() => getPostLessonReflections(teacherId), [teacherId, plans]);

  // The scheme being shown: the active lesson's subject and class, else the first one the teacher has.
  const [active, setActive] = useState<{ subject: string; grade: string } | null>(() => {
    if (plan?.subject && plan?.gradeClass) return { subject: plan.subject, grade: plan.gradeClass };
    const first = getCurriculumSchemes(teacherId)[0];
    if (first) return { subject: first.subject, grade: first.grade };
    const p = plans[0];
    return p ? { subject: p.subject, grade: p.gradeClass } : null;
  });
  const [pickerOpen, setPickerOpen] = useState(!active);
  const [newSubject, setNewSubject] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStrand, setSelectedStrand] = useState('all');
  const [adding, setAdding] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftStrand, setDraftStrand] = useState('');
  const [draftHours, setDraftHours] = useState('2');

  const sameKey = (a: { subject: string; grade: string }, b: { subject: string; grade: string }) =>
    a.subject.trim().toLowerCase() === b.subject.trim().toLowerCase() && a.grade.trim().toLowerCase() === b.grade.trim().toLowerCase();

  // Every subject and class the teacher has a scheme or a lesson for.
  const options = useMemo(() => {
    const list: Array<{ subject: string; grade: string }> = [];
    const add = (subject: string, grade: string) => {
      if (subject && grade && !list.some(o => sameKey(o, { subject, grade }))) list.push({ subject, grade });
    };
    schemes.forEach(s => add(s.subject, s.grade));
    plans.forEach(p => add(p.subject, p.gradeClass));
    if (active) add(active.subject, active.grade);
    return list;
  }, [schemes, plans, active]);

  const frameworkName = plan?.curriculumFramework || schemes[0]?.frameworkName || 'National Curriculum';
  const track: CurriculumTrack | undefined = active
    ? schemes.find(s => sameKey(s, active)) || {
        frameworkName,
        subject: active.subject,
        grade: active.grade,
        totalTopics: 0,
        coveredTopicsCount: 0,
        completionPercentage: 0,
        topics: [],
      }
    : undefined;

  const persist = (updated: CurriculumTrack) => {
    const summary = summarizeTopics(updated.topics, plans, reflections);
    const saved: CurriculumTrack = {
      ...updated,
      totalTopics: summary.total,
      coveredTopicsCount: summary.covered,
      completionPercentage: summary.percentage,
    };
    saveCurriculumScheme(teacherId, saved);
    setSchemes(getCurriculumSchemes(teacherId));
  };

  const rows = useMemo(
    () => (track?.topics || []).map(topic => ({ topic, ...effectiveStatus(topic, plans, reflections) })),
    [track, plans, reflections],
  );
  const summary = useMemo(() => summarizeTopics(track?.topics || [], plans, reflections), [track, plans, reflections]);
  const nextUp = rows.find(r => r.status === 'outstanding') || rows.find(r => r.status === 'in_progress');
  const strands = Array.from(new Set(rows.map(r => r.topic.strand || 'Core topics')));
  const visibleRows = selectedStrand === 'all' ? rows : rows.filter(r => (r.topic.strand || 'Core topics') === selectedStrand);

  const openScheme = (subject: string, grade: string) => {
    if (!subject.trim() || !grade.trim()) {
      toast.error('Enter both a subject and a class.');
      return;
    }
    setActive({ subject: subject.trim(), grade: grade.trim() });
    setSelectedStrand('all');
    setPickerOpen(false);
    setNewSubject('');
    setNewGrade('');
  };

  const addTopics = (fresh: CurriculumTopic[]) => {
    if (!track) return;
    const have = new Set(track.topics.map(t => t.title.trim().toLowerCase()));
    const unique = fresh.filter(t => !have.has(t.title.trim().toLowerCase()));
    if (unique.length === 0) {
      toast.info('Those topics are already in this scheme.');
      return;
    }
    persist({ ...track, topics: [...track.topics, ...unique] });
    toast.success(`Added ${unique.length} ${unique.length === 1 ? 'topic' : 'topics'}.`);
  };

  const startFromStarter = () => {
    if (!track) return;
    const key = matchStarterKey(track.subject);
    if (!key) return;
    addTopics(STARTER_TOPICS[key].map((item, idx) => ({
      id: `topic-${slug(track.subject)}-${slug(track.grade)}-${idx + 1}`,
      code: topicCode(track.subject, track.grade, idx + 1),
      title: item.title,
      strand: item.strand,
      substrand: item.substrand,
      estimatedHours: item.hours,
      subject: track.subject,
      grade: track.grade,
      status: 'outstanding',
    })));
  };

  const handleAutoGenerate = async () => {
    if (!track) return;
    setIsGenerating(true);
    try {
      const generated = await generateAICurriculumTopics(track.subject, track.grade, track.frameworkName, plan?.topic || 'General scheme of work');
      if (generated && generated.length > 0) {
        const stamp = Date.now();
        addTopics(generated.map((t: any, i: number) => ({
          id: `topic-gen-${stamp}-${i}`,
          code: topicCode(track.subject, track.grade, track.topics.length + i + 1),
          title: String(t.title || t),
          strand: t.strand || 'Core topics',
          substrand: t.substrand,
          estimatedHours: t.estimatedHours || 2,
          subject: track.subject,
          grade: track.grade,
          status: 'outstanding',
        })));
      } else {
        toast.error('Could not generate topics. Try again or add them yourself.');
      }
    } catch {
      toast.error('Could not reach the curriculum service.');
    }
    setIsGenerating(false);
  };

  const handleAddTopic = () => {
    if (!track || !draftTitle.trim()) {
      toast.error('Give the topic a title.');
      return;
    }
    addTopics([{
      id: `topic-custom-${Date.now()}`,
      code: topicCode(track.subject, track.grade, track.topics.length + 1),
      title: draftTitle.trim(),
      strand: draftStrand.trim() || undefined,
      estimatedHours: Math.max(0.5, Number(draftHours) || 1),
      subject: track.subject,
      grade: track.grade,
      status: 'outstanding',
    }]);
    setDraftTitle('');
    setDraftStrand('');
    setDraftHours('2');
    setAdding(false);
  };

  const removeTopic = (id: string) => {
    if (!track) return;
    persist({ ...track, topics: track.topics.filter(t => t.id !== id) });
  };

  const toggleTaught = (topic: CurriculumTopic, current: CurriculumTopic['status']) => {
    if (!track) return;
    const next: CurriculumTopic['status'] = current === 'covered' ? 'outstanding' : 'covered';
    persist({ ...track, topics: track.topics.map(t => (t.id === topic.id ? { ...t, status: next } : t)) });
  };

  const removeScheme = () => {
    if (!track || !window.confirm(`Delete the ${track.subject} (${track.grade}) scheme of work? Your lessons are not affected.`)) return;
    deleteCurriculumScheme(teacherId, track.subject, track.grade);
    setSchemes(getCurriculumSchemes(teacherId));
    const rest = options.filter(o => !sameKey(o, track));
    setActive(rest[0] || null);
    setPickerOpen(!rest[0]);
  };

  const starterKey = track ? matchStarterKey(track.subject) : undefined;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header + scheme picker */}
      <div className="bg-gradient-to-r from-[#5B7DB1] via-[#6B4C9A] to-[#1E8A6E] text-white p-5 rounded-2xl shadow-md space-y-3">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {track ? `${track.subject} · ${track.grade}` : 'Curriculum'}
              <InfoTip title="Curriculum">Your topics for a subject and class. Topics turn to "Planned" when you write a lesson for them and to "Covered" once that lesson is delivered or reflected on. You can also tick off topics you taught without the planner.</InfoTip>
            </h2>
            <p className="text-xs text-white/80 mt-0.5">{frameworkName}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {options.length > 0 && (
              <select
                aria-label="Subject and class"
                value={active ? options.findIndex(o => sameKey(o, active)) : ''}
                onChange={e => {
                  const o = options[Number(e.target.value)];
                  if (o) openScheme(o.subject, o.grade);
                }}
                className="h-9 rounded-lg bg-white/15 border border-white/30 text-white text-xs px-3 [&>option]:text-slate-900"
              >
                {options.map((o, i) => (
                  <option key={`${o.subject}-${o.grade}`} value={i}>{o.subject} · {o.grade}</option>
                ))}
              </select>
            )}
            <Button size="sm" onClick={() => setPickerOpen(v => !v)} className="bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> New
            </Button>
          </div>
        </div>
        {pickerOpen && (
          <div className="flex items-end gap-2 flex-wrap bg-white/10 rounded-xl p-3">
            <div className="flex-1 min-w-[140px]">
              <label className="text-[11px] text-white/80">Subject</label>
              <Input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="e.g. Mathematics" className="mt-1 h-9 bg-white text-slate-900 text-xs" />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="text-[11px] text-white/80">Class</label>
              <Input value={newGrade} onChange={e => setNewGrade(e.target.value)} placeholder="e.g. JHS 2" className="mt-1 h-9 bg-white text-slate-900 text-xs" />
            </div>
            <Button size="sm" onClick={() => openScheme(newSubject, newGrade)} className="bg-white text-[#6B4C9A] hover:bg-white/90 text-xs font-semibold h-9">
              Open
            </Button>
          </div>
        )}
      </div>

      {!track ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            Choose a subject and class above to start your scheme of work.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Progress */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-3xl font-bold text-[#6B4C9A]">{summary.percentage}%</p>
                  <p className="text-xs text-slate-500">
                    {summary.covered} of {summary.total} topics covered
                    {summary.hoursTotal > 0 && ` · ${summary.hoursCovered} of ${summary.hoursTotal} hours`}
                  </p>
                </div>
                <div className="flex gap-4 text-center text-xs">
                  <div><p className="text-lg font-semibold text-[#1E8A6E]">{summary.covered}</p><p className="text-slate-500">Covered</p></div>
                  <div><p className="text-lg font-semibold text-amber-600">{summary.inProgress}</p><p className="text-slate-500">Planned</p></div>
                  <div><p className="text-lg font-semibold text-slate-500">{summary.outstanding}</p><p className="text-slate-500">To do</p></div>
                </div>
              </div>
              <Progress value={summary.percentage} className="h-2.5" />
            </CardContent>
          </Card>

          {/* Next up */}
          {nextUp && (
            <Card className="border-[#6B4C9A]/30 bg-[#6B4C9A]/5">
              <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B4C9A]">
                    {nextUp.status === 'in_progress' ? 'Lesson planned' : 'Next up'}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">{nextUp.topic.title}</p>
                </div>
                {onPlanLesson && nextUp.status === 'outstanding' && (
                  <Button size="sm" onClick={() => onPlanLesson(nextUp.topic, track.frameworkName)} className="bg-[#6B4C9A] hover:bg-[#583D80] text-white text-xs">
                    Plan lesson <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Topics */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ListTree className="w-4 h-4 text-[#6B4C9A]" /> Topics
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {track.topics.length > 0 && (
                  <Button size="sm" variant="outline" onClick={handleAutoGenerate} disabled={isGenerating} className="text-xs">
                    {isGenerating ? <Loader className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />} Suggest more
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setAdding(v => !v)} className="text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add topic
                </Button>
                <button onClick={removeScheme} aria-label="Delete this scheme" title="Delete this scheme" className="text-slate-400 hover:text-red-600 p-1.5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {adding && (
                <div className="flex items-end gap-2 flex-wrap bg-slate-50 rounded-xl p-3 border">
                  <div className="flex-[2] min-w-[180px]">
                    <label className="text-[11px] text-slate-500">Topic</label>
                    <Input value={draftTitle} onChange={e => setDraftTitle(e.target.value)} placeholder="e.g. Solving quadratic equations" className="mt-1 h-9 text-xs" />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="text-[11px] text-slate-500">Strand (optional)</label>
                    <Input value={draftStrand} onChange={e => setDraftStrand(e.target.value)} placeholder="e.g. Algebra" className="mt-1 h-9 text-xs" />
                  </div>
                  <div className="w-20">
                    <label className="text-[11px] text-slate-500">Hours</label>
                    <Input type="number" min="0.5" step="0.5" value={draftHours} onChange={e => setDraftHours(e.target.value)} className="mt-1 h-9 text-xs" />
                  </div>
                  <Button size="sm" onClick={handleAddTopic} className="bg-[#6B4C9A] hover:bg-[#583D80] text-white text-xs h-9">Add</Button>
                </div>
              )}

              {strands.length > 1 && (
                <div className="flex gap-1.5 flex-wrap">
                  {['all', ...strands].map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedStrand(s)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedStrand === s ? 'bg-[#6B4C9A] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {s === 'all' ? 'All' : s}
                    </button>
                  ))}
                </div>
              )}

              {track.topics.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-sm text-slate-600">No topics yet for {track.subject} ({track.grade}).</p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {starterKey && (
                      <Button size="sm" onClick={startFromStarter} className="bg-[#6B4C9A] hover:bg-[#583D80] text-white text-xs">
                        Start from suggested {starterKey} topics
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={handleAutoGenerate} disabled={isGenerating} className="text-xs">
                      {isGenerating ? <Loader className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />} Suggest topics
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setAdding(true)} className="text-xs">Add my own</Button>
                  </div>
                  <p className="text-[11px] text-slate-400">Suggestions are a starting point. Edit them to match your syllabus.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {visibleRows.map(({ topic, status, lessons, fromLessons }) => (
                    <li
                      key={topic.id}
                      className={`p-3 rounded-xl border flex items-center gap-3 ${
                        status === 'covered' ? 'bg-emerald-50/60 border-emerald-200'
                        : status === 'in_progress' ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-white border-slate-200'
                      }`}
                    >
                      {status === 'covered' ? <CheckCircle2 className="w-5 h-5 text-[#1E8A6E] shrink-0" />
                        : status === 'in_progress' ? <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                        : <Circle className="w-5 h-5 text-white/85 shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">{topic.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {[topic.strand, topic.substrand].filter(Boolean).join(' · ')}
                          {topic.estimatedHours ? `${topic.strand || topic.substrand ? ' · ' : ''}${topic.estimatedHours} h` : ''}
                          {lessons.length > 0 && ` · ${lessons.length} ${lessons.length === 1 ? 'lesson' : 'lessons'}`}
                        </p>
                      </div>
                      <Badge variant="outline" className={
                        status === 'covered' ? 'border-emerald-300 text-emerald-700'
                        : status === 'in_progress' ? 'border-amber-300 text-amber-700'
                        : 'border-slate-300 text-slate-500'
                      }>
                        {status === 'covered' ? 'Covered' : status === 'in_progress' ? 'Planned' : 'To do'}
                      </Badge>
                      <div className="flex items-center gap-1 shrink-0">
                        {status === 'outstanding' && onPlanLesson && (
                          <Button size="sm" variant="outline" onClick={() => onPlanLesson(topic, track.frameworkName)} className="h-7 text-[11px]">Plan</Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={fromLessons}
                          title={fromLessons ? 'Covered through a delivered lesson' : undefined}
                          onClick={() => toggleTaught(topic, status)}
                          className="h-7 text-[11px]"
                        >
                          {status === 'covered' ? (fromLessons ? 'From lesson' : 'Undo') : 'Mark taught'}
                        </Button>
                        <button onClick={() => removeTopic(topic.id)} aria-label={`Remove ${topic.title}`} title="Remove topic" className="text-white/85 hover:text-red-600 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
