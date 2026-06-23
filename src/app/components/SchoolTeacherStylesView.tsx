import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  ArrowLeft, Copy, CheckCircle, ChevronDown, ChevronUp,
  Info, TrendingUp, QrCode, Search, Brain, BookOpen, Layers, Zap
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip as RechartsTip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Legend, Cell, PieChart, Pie
} from 'recharts';
import { getSchoolTeachers, getUserJotsCode } from '../utils/jotsCode';
import { getAssessmentsByUserId } from '../utils/storage';

interface SchoolTeacherStylesViewProps {
  admin: User;
  teachers?: User[];
  onBack: () => void;
}

type Tab = 'overview' | 'teaching' | 'cognitive' | 'analysis';

// ─── Teaching Style ───────────────────────────────────────────────────────────

const TEACHING_AXES = [
  { key: 'axisAuthority', low: 'Authority', high: 'Facilitation' },
  { key: 'axisKnowledge', low: 'Transmission', high: 'Construction' },
  { key: 'axisMotivation', low: 'Extrinsic', high: 'Intrinsic' },
  { key: 'axisAssessment', low: 'Judgment', high: 'Growth' },
  { key: 'axisAdaptability', low: 'Fixed', high: 'Adaptive' },
  { key: 'axisClimate', low: 'Fear-based', high: 'Safe' },
];
const RADAR_LABELS = ['Authority/Facil.', 'Transm./Constr.', 'Motivation', 'Assessment', 'Adaptability', 'Climate'];

function styleColor(s: string): string {
  const m: Record<string, string> = {
    'Authoritative Instructor': '#DC2626', 'Structured Educator': '#5B7DB1',
    'Facilitator Coach': '#1E8A6E', 'Engagement Driver': '#E0A020',
    'Learning Architect': '#6B4C9A', 'Innovation Leader': '#ec4899',
    'Traditionalist': '#9ca3af', 'Student-Centered Mentor': '#06b6d4',
  };
  return m[s] ?? '#9ca3af';
}

// ─── Cognitive Style Colors ───────────────────────────────────────────────────

const KOLB_COLORS: Record<string, string> = { Diverging: '#EC4899', Assimilating: '#5B7DB1', Converging: '#1E8A6E', Accommodating: '#E0A020' };
const THINK_COLORS: Record<string, string> = { Analytical: '#5B7DB1', Creative: '#6B4C9A', Practical: '#1E8A6E', Reflective: '#E0A020' };
const DUAL_COLORS: Record<string, string> = { Intuitive: '#F97316', Reflective: '#6B4C9A', Balanced: '#1E8A6E' };

// ─── Teacher Data Model ───────────────────────────────────────────────────────

interface LearningStyleData { style: string; scores: { CE: number; RO: number; AC: number; AE: number } }
interface ThinkingStyleData { style: string; scores: Record<string, number>; assessmentType: string }
interface DecisionStyleData { style: string; scores: { intuitive: number; reflective: number } }
interface TeachingStyleData { primaryStyle: string; secondaryStyle: string; axes: Record<string, number> }

interface TeacherData {
  user: User;
  teaching: TeachingStyleData | null;
  learning: LearningStyleData | null;
  thinking: ThinkingStyleData | null;
  decision: DecisionStyleData | null;
  completedCount: number; // 0-4 (teaching + 3 core)
}

function extractTeaching(user: User): TeachingStyleData | null {
  const a = getAssessmentsByUserId(user.id).filter((x: any) => x.type === 'teaching-style' && x.completedAt && x.score?.['teaching-style'])
    .sort((a: any, b: any) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
  if (!a) return null;
  const ts = a.score['teaching-style'];
  return { primaryStyle: ts.primaryStyle ?? '—', secondaryStyle: ts.secondaryStyle ?? '—', axes: ts.scores ?? {} };
}

function extractLearning(user: User): LearningStyleData | null {
  const a = getAssessmentsByUserId(user.id).filter((x: any) => x.type === 'kolb' && x.completedAt && x.score?.kolb)
    .sort((a: any, b: any) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
  if (!a) return null;
  const k = a.score.kolb;
  return { style: k.style, scores: { CE: k.scores.CE ?? 0, RO: k.scores.RO ?? 0, AC: k.scores.AC ?? 0, AE: k.scores.AE ?? 0 } };
}

function extractThinking(user: User): ThinkingStyleData | null {
  const all = getAssessmentsByUserId(user.id).filter((x: any) => x.completedAt && x.score);
  for (const type of ['sternberg', 'adult-thinking', 'shs-thinking', 'jhs-thinking']) {
    const a = all.filter((x: any) => x.type === type).sort((a: any, b: any) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
    if (!a) continue;
    const s = a.score;
    if (type === 'sternberg' && s.sternberg) return { style: s.sternberg.style, scores: s.sternberg.scores, assessmentType: 'Sternberg' };
    const ts = s['adult-thinking'] || s['shs-thinking'] || s['jhs-thinking'];
    if (!ts) continue;
    const rawScores: Record<string, number> = ts.scores || {};
    const primary = ts.style || ts.primaryStyle || ts.dominantStyle || Object.entries(rawScores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mixed';
    return { style: primary.charAt(0).toUpperCase() + primary.slice(1), scores: rawScores, assessmentType: type === 'adult-thinking' ? 'Adult' : type === 'shs-thinking' ? 'SHS' : 'JHS' };
  }
  return null;
}

function extractDecision(user: User): DecisionStyleData | null {
  const a = getAssessmentsByUserId(user.id).filter((x: any) => x.type === 'dual-process' && x.completedAt && x.score?.dualProcess)
    .sort((a: any, b: any) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
  if (!a) return null;
  const d = a.score.dualProcess;
  return {
    style: d.style,
    scores: { intuitive: d.scores?.intuitive ?? d.scores?.System1 ?? 0, reflective: d.scores?.reflective ?? d.scores?.System2 ?? 0 },
  };
}

function buildTeacherData(user: User): TeacherData {
  const teaching = extractTeaching(user);
  const learning = extractLearning(user);
  const thinking = extractThinking(user);
  const decision = extractDecision(user);
  const completedCount = [teaching, learning, thinking, decision].filter(Boolean).length;
  return { user, teaching, learning, thinking, decision, completedCount };
}

// ─── Full Analysis Engine ────────────────────────────────────────────────────

interface FullProfile {
  name: string;
  tagline: string;
  description: string;
  strengths: string[];
  gaps: string[];
  studentFit: string[];
  teachingAlignment: number; // 0-100 — teaching vs thinking style
  cognitiveAlignment: number; // 0-100 — learning vs teaching style
  decisionAlignment: number;  // 0-100 — decision style vs teaching
  overallScore: number;       // 0-100 — weighted average
}

function computeTeachingThinkingAlignment(axes: Record<string, number>, thinkingStyle: string): number {
  let s = 60;
  const { axisAdaptability = 50, axisClimate = 50, axisKnowledge = 50, axisAuthority = 50, axisMotivation = 50, axisAssessment = 50 } = axes;
  if (thinkingStyle === 'Creative') { s += axisAdaptability > 60 ? 15 : axisAdaptability < 40 ? -15 : 0; s += axisClimate > 60 ? 10 : 0; s += axisKnowledge > 60 ? 8 : 0; s += axisAuthority < 40 ? 5 : axisAuthority > 70 ? -10 : 0; }
  else if (thinkingStyle === 'Analytical') { s += axisAssessment > 55 ? 10 : 0; s += axisClimate > 50 ? 8 : axisClimate < 35 ? -12 : 0; s += axisAdaptability > 50 ? 5 : 0; }
  else if (thinkingStyle === 'Practical') { s += axisMotivation > 55 ? 10 : 0; s += axisAdaptability > 50 ? 8 : 0; s += axisKnowledge < 30 ? -10 : 0; }
  else if (thinkingStyle === 'Reflective') { s += axisClimate > 65 ? 18 : axisClimate < 40 ? -20 : 0; s += axisAssessment > 60 ? 10 : 0; }
  return Math.max(30, Math.min(98, Math.round(s)));
}

function computeLearningTeachingAlignment(axes: Record<string, number>, kolbStyle: string): number {
  let s = 60;
  const { axisKnowledge = 50, axisAdaptability = 50, axisAuthority = 50, axisClimate = 50 } = axes;
  // Diverging: experiential, feeling-based → suits facilitative, safe, constructive teaching
  if (kolbStyle === 'Diverging') { s += axisClimate > 55 ? 12 : 0; s += axisKnowledge > 55 ? 10 : 0; s += axisAuthority < 45 ? 8 : 0; }
  // Assimilating: abstract, reflective → suits transmission, structured
  else if (kolbStyle === 'Assimilating') { s += axisKnowledge < 55 ? 10 : 0; s += axisAdaptability > 45 ? 5 : 0; }
  // Converging: abstract, active → suits structured problem-solving
  else if (kolbStyle === 'Converging') { s += axisAdaptability > 50 ? 10 : 0; s += axisClimate > 50 ? 5 : 0; }
  // Accommodating: concrete, active → suits engagement, facilitation
  else if (kolbStyle === 'Accommodating') { s += axisAdaptability > 55 ? 12 : 0; s += axisClimate > 55 ? 8 : 0; s += axisKnowledge > 50 ? 5 : 0; }
  return Math.max(30, Math.min(98, Math.round(s)));
}

function computeDecisionTeachingAlignment(axes: Record<string, number>, decisionStyle: string): number {
  let s = 65;
  const { axisAdaptability = 50, axisAssessment = 50, axisClimate = 50 } = axes;
  if (decisionStyle === 'Intuitive') { s += axisAdaptability > 55 ? 15 : axisAdaptability < 40 ? -10 : 0; s += axisClimate > 55 ? 8 : 0; }
  else if (decisionStyle === 'Reflective') { s += axisAssessment > 55 ? 15 : 0; s += axisClimate > 55 ? 8 : 0; s += axisAdaptability > 45 ? 5 : 0; }
  else if (decisionStyle === 'Balanced') { s += 10; } // balanced is always a good fit
  return Math.max(30, Math.min(98, Math.round(s)));
}

function generateFullProfile(t: TeacherData): FullProfile | null {
  if (!t.teaching) return null;
  const axes = t.teaching.axes;
  const teachStyle = t.teaching.primaryStyle;
  const thinkStyle = t.thinking?.style ?? null;
  const kolbStyle = t.learning?.style ?? null;
  const dualStyle = t.decision?.style ?? null;

  const taScore = thinkStyle ? computeTeachingThinkingAlignment(axes, thinkStyle) : 65;
  const caScore = kolbStyle ? computeLearningTeachingAlignment(axes, kolbStyle) : 65;
  const daScore = dualStyle ? computeDecisionTeachingAlignment(axes, dualStyle) : 65;

  // Weighted overall: teaching-thinking 40%, learning-teaching 35%, decision-teaching 25%
  const overallScore = Math.round(taScore * 0.40 + caScore * 0.35 + daScore * 0.25);

  // Build profile name from primary teaching style + thinking style
  const nameBase = thinkStyle ? `${thinkStyle} ${teachStyle.split(' ').slice(0, 2).join(' ')}` : teachStyle;

  // Generate strengths based on available data
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (thinkStyle === 'Creative' && axes.axisAdaptability > 55) strengths.push('Highly adaptive, brings imaginative solutions to teaching challenges');
  if (thinkStyle === 'Analytical') strengths.push('Evidence-based approach, strong at breaking down complex concepts');
  if (thinkStyle === 'Practical') strengths.push('Real-world relevance in lessons, students see direct application');
  if (thinkStyle === 'Reflective') strengths.push('Deep self-evaluation leads to consistent teaching improvement');
  if (kolbStyle === 'Diverging') strengths.push('Naturally empathetic, creates experiential and discussion-rich lessons');
  if (kolbStyle === 'Assimilating') strengths.push('Strong curriculum structure, logically sequenced content delivery');
  if (kolbStyle === 'Converging') strengths.push('Effective problem-based learning, links theory to practical solutions');
  if (kolbStyle === 'Accommodating') strengths.push('Flexible, hands-on, thrives in active learning environments');
  if (dualStyle === 'Intuitive') strengths.push('Responsive to student needs in the moment, high classroom agility');
  if (dualStyle === 'Reflective') strengths.push('Careful, considered decisions — lessons are thoroughly planned');
  if (dualStyle === 'Balanced') strengths.push('Balances spontaneity with planning, adapts well to different contexts');
  if (axes.axisClimate > 65) strengths.push('Creates a psychologically safe, trusting classroom climate');

  // Gaps
  if (thinkStyle === 'Creative' && axes.axisAdaptability < 45) gaps.push('Creative thinking may feel constrained by rigid teaching structure — allow more room for experimentation');
  if (thinkStyle === 'Analytical' && axes.axisClimate < 45) gaps.push('Analytical focus may feel cold — actively building warmth and psychological safety would help');
  if (thinkStyle === 'Practical' && axes.axisKnowledge < 35) gaps.push('Practical bias may under-develop abstract reasoning skills in students');
  if (kolbStyle === 'Diverging' && axes.axisAuthority > 60) gaps.push('Diverging learning style may clash with high-authority teaching — more facilitation would be more natural');
  if (kolbStyle === 'Converging' && axes.axisKnowledge > 70) gaps.push('Converging learner teaching through transmission may limit student discovery');
  if (dualStyle === 'Intuitive' && axes.axisAssessment < 40) gaps.push('Intuitive decisions combined with judgment-focused assessment may overlook student growth');
  if (gaps.length < 2) gaps.push('Continue to explore diverse pedagogical approaches to reach all learner types');

  // Student fit
  const studentFit: string[] = [];
  if (kolbStyle === 'Diverging' || thinkStyle === 'Creative') studentFit.push('Diverging learners, creative thinkers');
  if (kolbStyle === 'Assimilating' || thinkStyle === 'Analytical') studentFit.push('Assimilating learners, analytical thinkers');
  if (kolbStyle === 'Converging' || thinkStyle === 'Practical') studentFit.push('Converging learners, practical problem-solvers');
  if (kolbStyle === 'Accommodating') studentFit.push('Accommodating learners, active doers');
  if (dualStyle === 'Reflective') studentFit.push('Reflective learners who need processing time');
  if (studentFit.length === 0) studentFit.push('Mixed learner types');

  const cognitiveBlend = [thinkStyle, kolbStyle, dualStyle].filter(Boolean).join(' · ');
  const description = `${teachStyle} whose cognitive profile combines ${cognitiveBlend || 'a range of approaches'}. ${caScore >= 75 ? 'Their learning style aligns naturally with how they teach.' : 'There is productive tension between how they learn and how they teach — a source of growth and inclusivity.'}`;

  return {
    name: nameBase,
    tagline: `${teachStyle} · ${thinkStyle ?? '?'} Thinker · ${kolbStyle ?? '?'} Learner · ${dualStyle ?? '?'} Decider`,
    description,
    strengths: strengths.slice(0, 4),
    gaps: gaps.slice(0, 3),
    studentFit,
    teachingAlignment: taScore,
    cognitiveAlignment: caScore,
    decisionAlignment: daScore,
    overallScore,
  };
}

function scoreColor(n: number) { return n >= 75 ? '#1E8A6E' : n >= 55 ? '#E0A020' : '#DC2626'; }
function scoreLabel(n: number) { return n >= 75 ? 'Strong' : n >= 55 ? 'Moderate' : 'Tension'; }

// ─── Component ────────────────────────────────────────────────────────────────

export function SchoolTeacherStylesView({ admin, teachers: providedTeachers, onBack }: SchoolTeacherStylesViewProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');

  const jotsCode = useMemo(() => getUserJotsCode(admin), [admin]);
  const allTeachers = useMemo(() => providedTeachers || getSchoolTeachers(admin), [admin, providedTeachers]);
  const allData = useMemo(() => allTeachers.map(buildTeacherData), [allTeachers]);

  const teachers = useMemo(() => {
    if (!search) return allData;
    const q = search.toLowerCase();
    return allData.filter(t => t.user.name.toLowerCase().includes(q) || t.user.phone?.includes(q));
  }, [allData, search]);

  const withTeaching = teachers.filter(t => t.teaching);
  const withAll3Core = teachers.filter(t => t.learning && t.thinking && t.decision);
  const withFull = teachers.filter(t => t.completedCount === 4);

  const schoolRadar = useMemo(() => {
    if (!withTeaching.length) return [];
    return TEACHING_AXES.map((ax, i) => ({
      axis: RADAR_LABELS[i],
      avg: Math.round(withTeaching.reduce((s, t) => s + (t.teaching!.axes[ax.key] ?? 50), 0) / withTeaching.length),
    }));
  }, [withTeaching]);

  const thinkingDist = useMemo(() => {
    const d: Record<string, number> = {};
    teachers.filter(t => t.thinking).forEach(t => { const s = t.thinking!.style; d[s] = (d[s] ?? 0) + 1; });
    return Object.entries(d).map(([name, value]) => ({ name, value }));
  }, [teachers]);

  const learningDist = useMemo(() => {
    const d: Record<string, number> = {};
    teachers.filter(t => t.learning).forEach(t => { const s = t.learning!.style; d[s] = (d[s] ?? 0) + 1; });
    return Object.entries(d).map(([name, value]) => ({ name, value }));
  }, [teachers]);

  const decisionDist = useMemo(() => {
    const d: Record<string, number> = {};
    teachers.filter(t => t.decision).forEach(t => { const s = t.decision!.style; d[s] = (d[s] ?? 0) + 1; });
    return Object.entries(d).map(([name, value]) => ({ name, value }));
  }, [teachers]);

  const fullProfiles = useMemo(() => teachers.map(t => ({ teacher: t, profile: generateFullProfile(t) })), [teachers]);
  const avgOverall = useMemo(() => {
    const scored = fullProfiles.filter(x => x.profile);
    if (!scored.length) return 0;
    return Math.round(scored.reduce((s, x) => s + x.profile!.overallScore, 0) / scored.length);
  }, [fullProfiles]);

  const handleCopy = () => { navigator.clipboard.writeText(jotsCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  const toggle = (key: string) => setExpanded(expanded === key ? null : key);

  const ScoreBar = ({ label, value }: { label: string; value: number }) => (
    <div>
      <div className="flex justify-between text-[10px] text-gray-500 mb-0.5"><span>{label}</span><span style={{ color: scoreColor(value) }}>{value}% · {scoreLabel(value)}</span></div>
      <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{ width: `${value}%`, backgroundColor: scoreColor(value) }} /></div>
    </div>
  );

  const CompletionDots = ({ t }: { t: TeacherData }) => (
    <div className="flex gap-1" title="Teaching / Learning / Thinking / Decision">
      {[t.teaching, t.learning, t.thinking, t.decision].map((v, i) => (
        <div key={i} className={`w-2 h-2 rounded-full ${v ? 'bg-green-500' : 'bg-gray-200'}`} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1"><ArrowLeft className="w-4 h-4" /> Back</Button>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-base"><BookOpen className="w-5 h-5 text-[#5B7DB1]" />Teacher Profiles</h1>
            <p className="text-xs text-gray-500">{admin.school} · {teachers.length} linked · {withFull.length} fully assessed</p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 flex gap-1 pb-0 overflow-x-auto">
          {([
            ['overview', Layers, 'Overview'],
            ['teaching', BookOpen, 'Teaching Style'],
            ['cognitive', Brain, 'Cognitive Profile'],
            ['analysis', TrendingUp, 'Full Analysis'],
          ] as const).map(([t, Icon, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 shrink-0 transition-colors ${tab === t ? 'border-[#5B7DB1] text-[#5B7DB1]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Jots Code */}
        <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #5B7DB1, #6B4C9A)' }}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_20%,white,transparent)]" />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-white/70 text-xs mb-1 flex items-center gap-1"><QrCode className="w-3.5 h-3.5" /> School Jots Code (Organisation Code)</p>
              <div className="text-3xl tracking-widest mb-1">{jotsCode || '—'}</div>
              <p className="text-white/70 text-xs max-w-xs">Teachers enter this during signup to link their account. They then complete all 4 assessments from their <em>My Style</em> tab.</p>
            </div>
            <Button size="sm" onClick={handleCopy} className="bg-white/20 hover:bg-white/30 text-white border-white/30 border shrink-0">
              {copied ? <CheckCircle className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
          </div>
        </div>

        {/* Phone / Name search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by name or phone number..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (<>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Linked teachers', value: teachers.length, color: '#5B7DB1' },
              { label: 'Teaching style', value: withTeaching.length, color: '#1E8A6E' },
              { label: 'Full cognitive (3 core)', value: withAll3Core.length, color: '#6B4C9A' },
              { label: 'Fully complete (all 4)', value: withFull.length, color: '#E0A020' },
            ].map(s => (
              <Card key={s.label}><CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </CardContent></Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">School Teaching Profile</CardTitle></CardHeader>
              <CardContent className="h-[230px]">
                {schoolRadar.length < 3 ? <div className="h-full flex items-center justify-center text-gray-400 text-sm">Not enough teaching assessments</div>
                  : <ResponsiveContainer width="100%" height="100%"><RadarChart data={schoolRadar}>
                    <PolarGrid key="pg" /><PolarAngleAxis key="paa" dataKey="axis" tick={{ fontSize: 9 }} />
                    <PolarRadiusAxis key="pra" domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar key="r" dataKey="avg" stroke="#5B7DB1" fill="#5B7DB1" fillOpacity={0.3} />
                    <RechartsTip key="tip" />
                  </RadarChart></ResponsiveContainer>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Staff Thinking Styles</CardTitle></CardHeader>
              <CardContent className="h-[230px]">
                {!thinkingDist.length ? <div className="h-full flex items-center justify-center text-gray-400 text-sm">No thinking assessments yet</div>
                  : <ResponsiveContainer width="100%" height="100%"><PieChart>
                    <Pie key="pie" data={thinkingDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name}: ${value}`}>
                      {thinkingDist.map((e, i) => <Cell key={i} fill={THINK_COLORS[e.name] ?? '#9ca3af'} />)}
                    </Pie><RechartsTip key="tip" />
                  </PieChart></ResponsiveContainer>}
              </CardContent>
            </Card>
          </div>

          {avgOverall > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-amber-900">School-wide Educator Alignment</p>
                  <p className="text-xs text-amber-700 mt-0.5">Weighted across teaching, learning, thinking and decision styles for {fullProfiles.filter(x => x.profile).length} teacher(s)</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: scoreColor(avgOverall) }}>{avgOverall}</div>
                  <p className="text-xs" style={{ color: scoreColor(avgOverall) }}>{scoreLabel(avgOverall)} Alignment</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick table */}
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-gray-50 text-xs text-gray-500">
                  <th className="text-left px-4 py-2.5">Teacher</th>
                  <th className="text-left px-3 py-2.5">Phone</th>
                  <th className="text-center px-2 py-2.5">Done</th>
                  <th className="text-center px-2 py-2.5">Teaching</th>
                  <th className="text-center px-2 py-2.5">Learning</th>
                  <th className="text-center px-2 py-2.5">Thinking</th>
                  <th className="text-center px-2 py-2.5">Decision</th>
                </tr></thead>
                <tbody>
                  {teachers.map(t => (
                    <tr key={t.user.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-2.5"><p className="text-gray-900 text-xs">{t.user.name}</p><p className="text-[10px] text-gray-400">{t.user.email}</p></td>
                      <td className="px-3 py-2.5 text-xs text-gray-600">{t.user.phone || '—'}</td>
                      <td className="px-2 py-2.5 text-center"><CompletionDots t={t} /></td>
                      <td className="px-2 py-2.5 text-center">{t.teaching ? <Badge style={{ backgroundColor: styleColor(t.teaching.primaryStyle) + '20', color: styleColor(t.teaching.primaryStyle) }} className="text-[10px]">{t.teaching.primaryStyle.split(' ').slice(0, 1).join(' ')}</Badge> : <span className="text-[10px] text-gray-300">—</span>}</td>
                      <td className="px-2 py-2.5 text-center">{t.learning ? <Badge style={{ backgroundColor: KOLB_COLORS[t.learning.style] + '20', color: KOLB_COLORS[t.learning.style] }} className="text-[10px]">{t.learning.style}</Badge> : <span className="text-[10px] text-gray-300">—</span>}</td>
                      <td className="px-2 py-2.5 text-center">{t.thinking ? <Badge style={{ backgroundColor: THINK_COLORS[t.thinking.style] + '20', color: THINK_COLORS[t.thinking.style] }} className="text-[10px]">{t.thinking.style}</Badge> : <span className="text-[10px] text-gray-300">—</span>}</td>
                      <td className="px-2 py-2.5 text-center">{t.decision ? <Badge style={{ backgroundColor: DUAL_COLORS[t.decision.style] + '20', color: DUAL_COLORS[t.decision.style] }} className="text-[10px]">{t.decision.style}</Badge> : <span className="text-[10px] text-gray-300">—</span>}</td>
                    </tr>
                  ))}
                  {!teachers.length && <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No teachers match your search</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>)}

        {/* ── TEACHING STYLE ── */}
        {tab === 'teaching' && (<>
          {!withTeaching.length && <Card><CardContent className="py-14 text-center"><BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" /><p className="text-gray-500">No teaching style assessments yet</p></CardContent></Card>}
          {teachers.filter(t => !t.teaching).length > 0 && (
            <Card className="border-blue-100 bg-blue-50"><CardContent className="pt-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700"><strong>{teachers.filter(t => !t.teaching).length}</strong> teacher(s) haven't completed the Teaching Style Assessment: {teachers.filter(t => !t.teaching).map(t => t.user.name).join(', ')}</p>
            </CardContent></Card>
          )}
          {teachers.map(t => (
            <Card key={t.user.id} className={!t.teaching ? 'opacity-50' : ''}>
              <CardContent className="pt-4">
                <button className="w-full flex items-start justify-between gap-3 text-left" onClick={() => toggle(`ts-${t.user.id}`)} disabled={!t.teaching}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm shrink-0" style={{ backgroundColor: t.teaching ? styleColor(t.teaching.primaryStyle) : '#d1d5db' }}>{t.user.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.user.name}</p>
                      <p className="text-xs text-gray-500">{t.user.phone || t.user.email}</p>
                      {t.teaching ? <div className="flex gap-1.5 mt-1"><Badge style={{ backgroundColor: styleColor(t.teaching.primaryStyle) + '20', color: styleColor(t.teaching.primaryStyle) }} className="text-[10px]">{t.teaching.primaryStyle}</Badge>{t.teaching.secondaryStyle !== '—' && <Badge className="bg-gray-100 text-gray-600 text-[10px]">+{t.teaching.secondaryStyle}</Badge>}</div>
                        : <Badge className="bg-gray-100 text-gray-400 text-[10px] mt-1">Not assessed</Badge>}
                    </div>
                  </div>
                  {t.teaching && (expanded === `ts-${t.user.id}` ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />)}
                </button>
                {expanded === `ts-${t.user.id}` && t.teaching && (
                  <div className="mt-4 border-t pt-4 grid md:grid-cols-2 gap-4">
                    <div className="h-[190px]"><ResponsiveContainer width="100%" height="100%"><RadarChart data={TEACHING_AXES.map((ax, i) => ({ axis: RADAR_LABELS[i], value: t.teaching!.axes[ax.key] ?? 50 }))}>
                      <PolarGrid key="pg" /><PolarAngleAxis key="paa" dataKey="axis" tick={{ fontSize: 8 }} />
                      <PolarRadiusAxis key="pra" domain={[0, 100]} tick={{ fontSize: 8 }} />
                      <Radar key="r" dataKey="value" stroke={styleColor(t.teaching.primaryStyle)} fill={styleColor(t.teaching.primaryStyle)} fillOpacity={0.25} /><RechartsTip key="tip" />
                    </RadarChart></ResponsiveContainer></div>
                    <div className="space-y-2">{TEACHING_AXES.map(ax => { const v = t.teaching!.axes[ax.key] ?? 50; return (<div key={ax.key}>
                      <div className="flex justify-between text-[10px] text-gray-500 mb-0.5"><span>{ax.low}</span><span>{ax.high}</span></div>
                      <div className="relative w-full h-2 bg-gray-100 rounded-full"><div className="absolute left-0 h-2 rounded-full" style={{ width: `${v}%`, backgroundColor: styleColor(t.teaching!.primaryStyle) }} /><div className="absolute top-0 h-2 w-0.5 bg-gray-300" style={{ left: '50%' }} /></div>
                    </div>); })}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </>)}

        {/* ── COGNITIVE PROFILE (all 3 core) ── */}
        {tab === 'cognitive' && (<>
          {teachers.filter(t => !t.learning && !t.thinking && !t.decision).length === teachers.length && (
            <Card><CardContent className="py-14 text-center"><Brain className="w-12 h-12 text-gray-200 mx-auto mb-3" /><p className="text-gray-500">No cognitive assessments completed yet</p><p className="text-xs text-gray-400 mt-1">Teachers complete Learning, Thinking, and Decision assessments from their My Style tab</p></CardContent></Card>
          )}

          {/* Distribution charts */}
          {(learningDist.length > 0 || thinkingDist.length > 0 || decisionDist.length > 0) && (
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: 'Learning Styles', data: learningDist, colors: KOLB_COLORS },
                { title: 'Thinking Styles', data: thinkingDist, colors: THINK_COLORS },
                { title: 'Decision Styles', data: decisionDist, colors: DUAL_COLORS },
              ].map(({ title, data, colors }) => (
                <Card key={title}>
                  <CardHeader className="pb-2"><CardTitle className="text-xs text-gray-600">{title}</CardTitle></CardHeader>
                  <CardContent className="pt-0">
                    {!data.length ? <p className="text-xs text-gray-300 text-center py-4">No data</p>
                      : data.map(({ name, value }) => (
                        <div key={name} className="mb-2">
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-gray-700">{name}</span>
                            <span className="text-gray-500">{value}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{ width: `${Math.round((value / teachers.length) * 100)}%`, backgroundColor: colors[name] ?? '#9ca3af' }} /></div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Per-teacher cognitive cards */}
          {teachers.map(t => (
            <Card key={t.user.id} className={!t.learning && !t.thinking && !t.decision ? 'opacity-40' : ''}>
              <CardContent className="pt-4">
                <button className="w-full flex items-start justify-between gap-3 text-left" onClick={() => toggle(`cog-${t.user.id}`)}>
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm shrink-0 bg-[#6B4C9A]">{t.user.name.charAt(0)}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{t.user.name}</p>
                      <p className="text-xs text-gray-500">{t.user.phone || t.user.email}</p>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {t.learning ? <Badge style={{ backgroundColor: KOLB_COLORS[t.learning.style] + '20', color: KOLB_COLORS[t.learning.style] }} className="text-[10px]">📚 {t.learning.style}</Badge> : <Badge className="bg-gray-100 text-gray-300 text-[10px]">📚 —</Badge>}
                        {t.thinking ? <Badge style={{ backgroundColor: THINK_COLORS[t.thinking.style] + '20', color: THINK_COLORS[t.thinking.style] }} className="text-[10px]">🧠 {t.thinking.style}</Badge> : <Badge className="bg-gray-100 text-gray-300 text-[10px]">🧠 —</Badge>}
                        {t.decision ? <Badge style={{ backgroundColor: DUAL_COLORS[t.decision.style] + '20', color: DUAL_COLORS[t.decision.style] }} className="text-[10px]">⚡ {t.decision.style}</Badge> : <Badge className="bg-gray-100 text-gray-300 text-[10px]">⚡ —</Badge>}
                      </div>
                    </div>
                  </div>
                  {expanded === `cog-${t.user.id}` ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />}
                </button>

                {expanded === `cog-${t.user.id}` && (
                  <div className="mt-4 border-t pt-4 space-y-4">
                    {/* Learning Style */}
                    {t.learning && (<div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">📚 Learning Style — {t.learning.style}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(['CE','RO','AC','AE'] as const).map(k => { const v = t.learning!.scores[k]; return (<div key={k}>
                          <div className="flex justify-between text-[10px] text-gray-500 mb-0.5"><span>{k}</span><span>{v}/48</span></div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{ width: `${Math.round((v / 48) * 100)}%`, backgroundColor: KOLB_COLORS[t.learning!.style] }} /></div>
                        </div>); })}
                      </div>
                    </div>)}

                    {/* Thinking Style */}
                    {t.thinking && (<div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">🧠 Thinking Style — {t.thinking.style} <span className="text-gray-400 font-normal">({t.thinking.assessmentType})</span></p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(t.thinking.scores).filter(([k]) => ['analytical','creative','practical','reflective'].includes(k)).map(([dim, val]) => {
                          const v = Number(val); const max = v > 1 ? 30 : 100;
                          return (<div key={dim}>
                            <div className="flex justify-between text-[10px] text-gray-500 mb-0.5"><span className="capitalize">{dim}</span><span>{v}/{max}</span></div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.round((v / max) * 100))}%`, backgroundColor: THINK_COLORS[dim.charAt(0).toUpperCase() + dim.slice(1)] || '#9ca3af' }} /></div>
                          </div>);
                        })}
                      </div>
                    </div>)}

                    {/* Decision Style */}
                    {t.decision && (<div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">⚡ Decision Style — {t.decision.style}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[['Intuitive', t.decision.scores.intuitive], ['Reflective', t.decision.scores.reflective]].map(([k, v]) => (<div key={String(k)}>
                          <div className="flex justify-between text-[10px] text-gray-500 mb-0.5"><span>{String(k)}</span><span>{Number(v)}</span></div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, Number(v))}%`, backgroundColor: DUAL_COLORS[t.decision!.style] }} /></div>
                        </div>))}
                      </div>
                    </div>)}

                    {!t.learning && !t.thinking && !t.decision && <p className="text-sm text-gray-400 text-center py-2">No cognitive assessments completed</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </>)}

        {/* ── FULL ANALYSIS ── */}
        {tab === 'analysis' && (<>
          {!fullProfiles.filter(x => x.profile).length && (
            <Card><CardContent className="py-14 text-center"><TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-3" /><p className="text-gray-500">Full Analysis requires at least Teaching Style + one cognitive assessment</p><p className="text-xs text-gray-400 mt-1">Encourage teachers to complete all 4 assessments for a complete report</p></CardContent></Card>
          )}

          {avgOverall > 0 && (
            <Card style={{ borderLeft: `4px solid ${scoreColor(avgOverall)}`, backgroundColor: scoreColor(avgOverall) + '08' }}>
              <CardContent className="pt-4 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-gray-900">School-wide Educator Alignment</p>
                  <p className="text-xs text-gray-600 mt-0.5 max-w-sm">
                    {avgOverall >= 75 ? 'Your staff\'s teaching approaches align strongly with their cognitive styles — authentic, cohesive pedagogy.'
                      : avgOverall >= 55 ? 'Moderate alignment across staff — some productive tension creates diversity in teaching approaches.'
                      : 'Notable tension across several staff members. CPD sessions on authentic pedagogy are recommended.'}
                  </p>
                </div>
                <div className="text-center shrink-0">
                  <div className="text-4xl font-bold" style={{ color: scoreColor(avgOverall) }}>{avgOverall}</div>
                  <p className="text-xs mt-0.5" style={{ color: scoreColor(avgOverall) }}>{scoreLabel(avgOverall)} Alignment</p>
                </div>
              </CardContent>
            </Card>
          )}

          {fullProfiles.map(({ teacher: t, profile: p }) => {
            if (!p) return (
              <Card key={t.user.id} className="opacity-50">
                <CardContent className="pt-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm shrink-0">{t.user.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm text-gray-700">{t.user.name}</p>
                    <p className="text-xs text-gray-400">Teaching Style required for Full Analysis · {t.completedCount}/4 complete</p>
                  </div>
                  <CompletionDots t={t} />
                </CardContent>
              </Card>
            );

            return (
              <Card key={t.user.id}>
                <CardContent className="pt-4">
                  <button className="w-full flex items-start justify-between gap-3 text-left" onClick={() => toggle(`an-${t.user.id}`)}>
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm shrink-0" style={{ backgroundColor: t.teaching ? styleColor(t.teaching.primaryStyle) : '#6B4C9A' }}>{t.user.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900">{t.user.name}</p>
                          <Badge className="bg-amber-50 text-amber-800 text-[10px]">⭐ {p.name}</Badge>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{p.tagline}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <CompletionDots t={t} />
                          <Badge className="text-[10px]" style={{ backgroundColor: scoreColor(p.overallScore) + '20', color: scoreColor(p.overallScore) }}>{p.overallScore}% overall</Badge>
                        </div>
                      </div>
                    </div>
                    {expanded === `an-${t.user.id}` ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />}
                  </button>

                  {expanded === `an-${t.user.id}` && (
                    <div className="mt-4 border-t pt-4 space-y-4">
                      {/* Description */}
                      <div className="p-3 rounded-xl text-xs text-gray-700 bg-gray-50 border">{p.description}</div>

                      {/* Alignment scores */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-700">Alignment Scores</p>
                        <ScoreBar label="Teaching ↔ Thinking style" value={p.teachingAlignment} />
                        <ScoreBar label="Learning style ↔ Teaching approach" value={p.cognitiveAlignment} />
                        <ScoreBar label="Decision style ↔ Teaching environment" value={p.decisionAlignment} />
                        <div className="pt-1 border-t">
                          <ScoreBar label="Overall educator alignment" value={p.overallScore} />
                        </div>
                      </div>

                      {/* Strengths + Gaps */}
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-semibold text-green-800 mb-1.5">✓ Strengths</p>
                          <ul className="space-y-1">{p.strengths.map((s, i) => <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5"><span className="text-green-500 shrink-0 mt-0.5">•</span>{s}</li>)}</ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-amber-800 mb-1.5">△ Development Areas</p>
                          <ul className="space-y-1">{p.gaps.map((g, i) => <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5"><span className="text-amber-500 shrink-0 mt-0.5">•</span>{g}</li>)}</ul>
                        </div>
                      </div>

                      {/* Student fit */}
                      <div>
                        <p className="text-xs font-semibold text-blue-800 mb-1.5">🎯 Best suited for</p>
                        <div className="flex gap-1.5 flex-wrap">{p.studentFit.map((f, i) => <Badge key={i} className="bg-blue-50 text-blue-700 text-[10px]">{f}</Badge>)}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* School recommendations */}
          {fullProfiles.filter(x => x.profile).length >= 1 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Info className="w-4 h-4 text-blue-600" />School Recommendations</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(() => {
                  const recs: string[] = [];
                  const lowAligned = fullProfiles.filter(x => x.profile && x.profile.overallScore < 55);
                  const noCreative = !teachers.some(t => t.thinking?.style === 'Creative');
                  const incomplete = teachers.filter(t => t.completedCount < 4);
                  if (lowAligned.length) recs.push(`${lowAligned.length} teacher(s) show notable tension across their 4 assessments — consider personalised CPD: ${lowAligned.map(x => x.teacher.user.name).join(', ')}.`);
                  if (noCreative) recs.push('No Creative thinkers identified among assessed staff. Introducing imaginative teaching approaches would benefit diverging learners.');
                  if (incomplete.length) recs.push(`${incomplete.length} teacher(s) have incomplete profiles (${incomplete.map(t => t.user.name).join(', ')}). Full profiles unlock all 4 alignment dimensions.`);
                  if (!recs.length) recs.push('All assessed teachers show healthy alignment. Focus on peer observation and collaborative planning to sustain this.');
                  return recs.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-white rounded-lg border border-blue-100">
                      <span className="text-blue-500 shrink-0 mt-0.5">→</span>
                      <p className="text-xs text-gray-700">{r}</p>
                    </div>
                  ));
                })()}
              </CardContent>
            </Card>
          )}
        </>)}
      </div>
    </div>
  );
}
