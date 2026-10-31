import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { InfoTip } from '../ui/info-tip';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Building2, ClipboardList, GraduationCap, Users, BookOpen, Calendar, KeyRound, Sparkles, LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { User, Assessment } from '../../types';
import { getMyAssignments } from '../../utils/api';
import { formatMonthYear } from '../../utils/dateFormat';
import { getFriendlyStyleInfo } from '../../utils/styleWording';
import { AssignmentCard, AssignedItem } from '../AssignedWork';
import { latestOfType } from './assessmentInfo';

interface SchoolPortalTabProps {
  user: User;
  assessments: Assessment[];
  onNavigate: (tab: string) => void;
}

export function SchoolPortalTab({ user, assessments, onNavigate }: SchoolPortalTabProps) {
  const [assignments, setAssignments] = useState<AssignedItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const loadAssignments = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await getMyAssignments();
      setAssignments(res?.success ? res.assignments || [] : []);
      setStatus('ready');
    } catch (err) {
      console.error('Failed to load assigned work', err);
      setStatus('error');
    }
  }, []);

  useEffect(() => { loadAssignments(); }, [loadAssignments]);

  const schoolName = user.school || user.organizationName;
  const teachers = [...new Set(assignments.map(a => a.teacherName).filter(Boolean))];
  const teacherName = user.teacherName || teachers.join(', ');

  const facts: Array<{ icon: LucideIcon; label: string; value?: string }> = [
    { icon: Building2, label: 'School', value: schoolName },
    { icon: Users, label: 'Class', value: user.className },
    { icon: GraduationCap, label: user.teacherName ? 'Class teacher' : 'Teacher', value: teacherName },
    { icon: BookOpen, label: 'Level', value: user.educationLevel },
    { icon: Calendar, label: 'Joined', value: user.createdAt ? formatMonthYear(user.createdAt) : undefined },
  ];

  const kolb = latestOfType(assessments, 'kolb');
  const learning = kolb ? getFriendlyStyleInfo((kolb.score as any)?.kolb?.style) : null;

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-md overflow-hidden bg-gradient-to-r from-[#6B4C9A] to-[#5B7DB1] text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl md:text-2xl font-bold break-words">{schoolName || 'No school yet'}</h2>
              <p className="text-sm text-white/80">
                {schoolName
                  ? (user.className ? `Class ${user.className}` : 'Not in a class yet')
                  : 'Your school and class show here once your teacher adds you.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {facts.some(f => f.value) && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {facts.filter(f => f.value).map(f => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="rounded-xl border bg-card p-3 min-w-0">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-[#6B4C9A]" /> {f.label}
                </p>
                <p className="font-semibold text-sm mt-0.5 break-words">{f.value}</p>
              </div>
            );
          })}
        </div>
      )}

      <section className="space-y-3">
        <h3 className="font-bold flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-[#6B4C9A]" />
          Work from your teacher
          {status === 'ready' && assignments.length > 0 && (
            <Badge className="bg-[#6B4C9A]/10 text-[#6B4C9A]">{assignments.length}</Badge>
          )}
          <InfoTip>Tasks your teacher has shared with you. Tap one to see the questions.</InfoTip>
        </h3>
        {status === 'loading' && <Skeleton className="h-20 w-full" />}
        {status === 'error' && (
          <div className="rounded-xl border bg-card p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">We could not load your work.</p>
            <Button size="sm" variant="outline" onClick={loadAssignments}>Try again</Button>
          </div>
        )}
        {status === 'ready' && assignments.length === 0 && (
          <div className="rounded-xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
            Nothing from your teacher yet.
          </div>
        )}
        {status === 'ready' && assignments.map(item => <AssignmentCard key={item.id} item={item} />)}
      </section>

      <section className="space-y-3">
        <h3 className="font-bold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#6B4C9A]" />
          How you learn best
        </h3>
        {learning ? (
          <div className="rounded-xl border bg-card p-4 space-y-1">
            <p className="font-semibold">{learning.friendlyName}</p>
            <p className="text-sm text-muted-foreground">{learning.bestWayToLearn}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-card p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Take the Learning Style assessment to see this.</p>
            <Button size="sm" variant="outline" onClick={() => onNavigate('track-record')}>Take it</Button>
          </div>
        )}
      </section>

      {user.studentCode && (
        <div className="rounded-xl border bg-card p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <KeyRound className="h-4 w-4 text-[#6B4C9A]" />
              Your student code
              <InfoTip>Your personal code. You use it to sign in, and it links you to your school and class. Share it only with your teacher or parent.</InfoTip>
            </p>
            <code className="text-lg font-black tracking-widest text-[#6B4C9A] select-all">{user.studentCode}</code>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(user.studentCode!).then(
                () => toast.success('Code copied'),
                () => toast.error('Could not copy the code')
              );
            }}
          >
            Copy
          </Button>
        </div>
      )}
    </div>
  );
}
