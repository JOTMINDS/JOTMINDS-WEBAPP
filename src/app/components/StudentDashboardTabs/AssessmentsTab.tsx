import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { InfoTip } from '../ui/info-tip';
import { Skeleton } from '../ui/skeleton';
import {
  BookOpen, Brain, Target, GraduationCap, Eye, RotateCcw, Play, Lock, CheckCircle2, Calendar, TrendingUp, LucideIcon,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Assessment } from '../../types';
import { getProfileHistory } from '../../utils/cognitiveProfileApi';
import { formatDate, formatChartDate } from '../../utils/dateFormat';
import {
  assessmentLabel, assessmentParts, assessmentStyleName, byNewest, latestOfType, CORE_DIMENSIONS, EXTRA_DIMENSIONS,
} from './assessmentInfo';

type StartKey = 'kolb' | 'sternberg' | 'dual-process' | 'level';
type Level = 'JHS' | 'SHS' | 'Adult';

interface AssessmentsTabProps {
  assessments: Assessment[];
  loading: boolean;
  /** How many of the three core assessments are done (0-3). */
  coreCount: number;
  /** The extra thinking assessment for this student's level, if there is one. */
  level: Level | null;
  onStart: (key: StartKey) => void;
  onViewReport: (assessment: Assessment) => void;
}

const LEVEL_SLOTS: Record<Level, { type: string; title: string; blurb: string }> = {
  JHS: { type: 'jhs-thinking', title: 'JHS Thinking Styles', blurb: 'Find SHS programs that fit you' },
  SHS: { type: 'shs-thinking', title: 'SHS Thinking Styles', blurb: 'Find programs and careers that fit you' },
  Adult: { type: 'adult-thinking', title: 'Professional Thinking Styles', blurb: 'Find careers that fit you' },
};

interface Slot {
  startKey: StartKey;
  type: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  color: string;
  locked: boolean;
}

function AssessmentCard({ slot, record, onStart, onView }: {
  slot: Slot;
  record?: Assessment;
  onStart: () => void;
  onView: () => void;
}) {
  const Icon = slot.icon;
  const style = record ? assessmentStyleName(record) : '';
  const parts = record ? assessmentParts(record) : [];

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${slot.color}1A`, color: slot.color }}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm">{slot.title}</p>
          <p className="text-xs text-muted-foreground">{record ? (style || 'Result saved') : slot.blurb}</p>
        </div>
        {record && (
          <Badge variant="outline" className="shrink-0 gap-1 border-[#1E8A6E] text-[#1E8A6E]">
            <CheckCircle2 className="h-3 w-3" /> Done
          </Badge>
        )}
      </div>

      {record && (
        <>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> {formatDate(record.completedAt)}
          </p>
          {parts.length > 0 && (
            <div className="space-y-1.5">
              {parts.map(p => (
                <div key={p.key} className="flex items-center gap-2 text-xs">
                  <span className="w-28 shrink-0 truncate text-muted-foreground">{p.label}</span>
                  <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.pct}%`, backgroundColor: slot.color }} />
                  </div>
                  <span className="w-9 text-right tabular-nums">{p.pct}%</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="flex gap-2 mt-auto pt-1">
        {record ? (
          <>
            <Button size="sm" className="flex-1 text-white" style={{ backgroundColor: slot.color }} onClick={onView}>
              <Eye className="mr-1.5 h-3.5 w-3.5" /> View report
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={onStart}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Retake
            </Button>
          </>
        ) : slot.locked ? (
          <Button size="sm" variant="outline" className="w-full" disabled>
            <Lock className="mr-1.5 h-3.5 w-3.5" /> Finish the 3 core first
          </Button>
        ) : (
          <Button size="sm" className="w-full text-white" style={{ backgroundColor: slot.color }} onClick={onStart}>
            <Play className="mr-1.5 h-3.5 w-3.5" /> Start
          </Button>
        )}
      </div>
    </div>
  );
}

/** How the profile has moved across saved snapshots. Only real history is shown. */
function ProfileChange() {
  const [history, setHistory] = useState<any[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProfileHistory()
      .then(res => { if (!cancelled) setHistory(res.history || []); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  if (failed) return <p className="text-sm text-muted-foreground">We could not load your history. Try again later.</p>;
  if (!history) return <Skeleton className="h-40 w-full" />;

  const when = (s: any) => s.snapshotAt || s.generatedAt;
  const snaps = history.slice().sort((a, b) => new Date(when(a)).getTime() - new Date(when(b)).getTime());
  if (snaps.length < 2) {
    return <p className="text-sm text-muted-foreground">Retake an assessment to start tracking how you change.</p>;
  }

  const average = (s: any) => Math.round(CORE_DIMENSIONS.reduce((sum, d) => sum + (Number(s[d.key]) || 0), 0) / CORE_DIMENSIONS.length);
  const points = snaps.map((s, i) => ({ n: `#${i + 1}`, date: formatChartDate(when(s)), Overall: average(s) }));

  const first = snaps[0];
  const last = snaps[snaps.length - 1];
  const changes = [...CORE_DIMENSIONS, ...EXTRA_DIMENSIONS]
    .map(d => ({ label: d.label, delta: Math.round((Number(last[d.key]) || 0) - (Number(first[d.key]) || 0)) }))
    .filter(c => Math.abs(c.delta) >= 3)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 4);

  return (
    <div className="space-y-3">
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 5, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
            <XAxis dataKey="n" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} stroke="var(--border)" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} stroke="var(--border)" />
            <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ''} />
            <Line type="monotone" dataKey="Overall" stroke="#6B4C9A" strokeWidth={2.5} dot={{ r: 4, fill: '#6B4C9A' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1.5">Since {formatDate(when(first))}</p>
        {changes.length === 0 ? (
          <p className="text-sm">Steady so far. No big changes yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {changes.map(c => (
              <Badge
                key={c.label}
                variant="outline"
                className={c.delta > 0 ? 'border-[#1E8A6E] text-[#1E8A6E]' : 'border-amber-500 text-amber-700'}
              >
                {c.label} {c.delta > 0 ? '+' : '−'}{Math.abs(c.delta)}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AssessmentsTab({ assessments, loading, coreCount, level, onStart, onViewReport }: AssessmentsTabProps) {
  const slots: Slot[] = [
    { startKey: 'kolb', type: 'kolb', title: 'Learning Style', blurb: 'How you learn best', icon: BookOpen, color: '#5B7DB1', locked: false },
    { startKey: 'sternberg', type: 'sternberg', title: 'Thinking Style', blurb: 'How you think', icon: Brain, color: '#6B4C9A', locked: false },
    { startKey: 'dual-process', type: 'dual-process', title: 'Decision Style', blurb: 'How you decide', icon: Target, color: '#1E8A6E', locked: false },
  ];
  if (level) {
    const extra = LEVEL_SLOTS[level];
    slots.push({ startKey: 'level', type: extra.type, title: extra.title, blurb: extra.blurb, icon: GraduationCap, color: '#FF715B', locked: coreCount < 3 });
  }

  const slotTypes = slots.map(s => s.type);
  const others = assessments.filter(a => !slotTypes.includes(a.type)).sort(byNewest);
  const latest = assessments.slice().sort(byNewest)[0];

  const tiles = [
    { label: 'Taken', value: String(assessments.length) },
    { label: 'Core done', value: `${coreCount}/3` },
    { label: 'Last taken', value: latest ? formatDate(latest.completedAt) : '—' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {tiles.map(t => (
          <div key={t.label} className="rounded-xl border bg-card p-3 text-center">
            <p className="text-lg sm:text-2xl font-bold text-[#6B4C9A]">{t.value}</p>
            <p className="text-xs text-muted-foreground">{t.label}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h3 className="font-bold flex items-center">
          My assessments
          <InfoTip>Take any assessment, or retake one. A retake replaces your current result.</InfoTip>
        </h3>
        {loading && assessments.length === 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {slots.map(s => <Skeleton key={s.type} className="h-40 w-full" />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {slots.map(slot => {
              const record = latestOfType(assessments, slot.type);
              return (
                <AssessmentCard
                  key={slot.type}
                  slot={slot}
                  record={record}
                  onStart={() => onStart(slot.startKey)}
                  onView={() => record && onViewReport(record)}
                />
              );
            })}
          </div>
        )}
      </section>

      {others.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-bold">Other results</h3>
          <div className="space-y-2">
            {others.map(a => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{assessmentLabel(a.type)}{assessmentStyleName(a) ? ` · ${assessmentStyleName(a)}` : ''}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(a.completedAt)}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => onViewReport(a)}>
                  <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#6B4C9A]" />
            How you change
            <InfoTip>Your profile is saved each time you finish an assessment. This shows how it moves.</InfoTip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Take an assessment to see your analytics.</p>
          ) : (
            <ProfileChange />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
