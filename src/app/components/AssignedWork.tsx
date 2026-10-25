import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';
import { getMyAssignments, getChildrenAssignments } from '../utils/api';

interface AssignedItem {
  id: string;
  teacherName: string;
  content: Record<string, any>;
  note?: string;
  dueDate?: string | null;
  createdAt: string;
}

const SECTIONS: Array<[string, string]> = [
  ['mcqs', 'Multiple choice'],
  ['shortAnswer', 'Short answer'],
  ['discussion', 'Discussion'],
  ['practicalExercises', 'Practical'],
  ['homework', 'Homework'],
];

function AssignmentCard({ item }: { item: AssignedItem }) {
  const [open, setOpen] = useState(false);
  const total = SECTIONS.reduce((n, [key]) => n + (item.content?.[key]?.length || 0), 0);
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button className="w-full flex items-center justify-between gap-3 p-3 text-left" onClick={() => setOpen(!open)}>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{item.content?.title || 'Assigned work'}</p>
          <p className="text-xs text-slate-500">
            From {item.teacherName} · {total} question{total === 1 ? '' : 's'}
            {item.dueDate ? ` · Due ${item.dueDate}` : ''}
          </p>
          {item.note && <p className="text-xs text-indigo-700 mt-0.5">{item.note}</p>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-slate-100 p-3 space-y-4">
          {SECTIONS.map(([key, label]) => {
            const qs: any[] = item.content?.[key] || [];
            if (!qs.length) return null;
            return (
              <div key={key}>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">{label}</p>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-800">
                  {qs.map((q, i) => (
                    <li key={q.id || i}>
                      {q.question}
                      {Array.isArray(q.options) && q.options.length > 0 && (
                        <ul className="mt-1 space-y-0.5 text-slate-600">
                          {q.options.map((o: string, oi: number) => (
                            <li key={oi}>{String.fromCharCode(65 + oi)}. {o}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Work a teacher has shared. Students see their own; parents see each linked child's. */
export function AssignedWork({ role }: { role: 'student' | 'parent' }) {
  const [loading, setLoading] = useState(true);
  const [mine, setMine] = useState<AssignedItem[]>([]);
  const [byChild, setByChild] = useState<Array<{ childId: string; childName: string; assignments: AssignedItem[] }>>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (role === 'student') {
          const res = await getMyAssignments();
          if (!cancelled && res?.success) setMine(res.assignments || []);
        } else {
          const res = await getChildrenAssignments();
          if (!cancelled && res?.success) setByChild(res.children || []);
        }
      } catch (err) {
        console.error('Failed to load assigned work', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [role]);

  const groups = role === 'student'
    ? [{ key: 'me', title: null as string | null, items: mine }]
    : byChild.map(c => ({ key: c.childId, title: c.childName, items: c.assignments }));
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  // Nothing assigned yet: stay out of the way
  if (loading || total === 0) return null;

  return (
    <Card className="border-indigo-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-indigo-600" />
          {role === 'student' ? 'Work from your teacher' : 'Work assigned to your children'}
          <Badge className="bg-indigo-100 text-indigo-800">{total}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.filter(g => g.items.length > 0).map(g => (
          <div key={g.key} className="space-y-2">
            {g.title && <p className="text-sm font-semibold text-slate-700">{g.title}</p>}
            {g.items.map(item => <AssignmentCard key={item.id} item={item} />)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
