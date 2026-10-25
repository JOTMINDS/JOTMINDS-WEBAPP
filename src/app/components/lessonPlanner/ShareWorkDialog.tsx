import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Loader, Send } from 'lucide-react';
import { toast } from 'sonner';
import { shareAssignment } from '../../utils/api';
import { GeneratedAssessment } from '../../types/lessonPlannerTypes';

interface ShareWorkDialogProps {
  open: boolean;
  onClose: () => void;
  assessment: GeneratedAssessment;
  students: any[];
}

/** Lets a teacher send an assessment or homework to the whole class or to chosen students. */
export const ShareWorkDialog: React.FC<ShareWorkDialogProps> = ({ open, onClose, assessment, students }) => {
  const [mode, setMode] = useState<'all' | 'some'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const roster = useMemo(
    () => [...students].sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''))),
    [students]
  );
  const questionCount =
    assessment.mcqs.length + assessment.shortAnswer.length + assessment.discussion.length +
    assessment.practicalExercises.length + assessment.homework.length;

  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const send = async () => {
    const studentIds = mode === 'all' ? roster.map(s => s.id) : Array.from(selected);
    if (studentIds.length === 0) {
      toast.error(mode === 'all' ? 'You have no students to share with yet.' : 'Choose at least one student.');
      return;
    }
    setSending(true);
    try {
      const res = await shareAssignment({ content: assessment, studentIds, dueDate: dueDate || undefined, note: note.trim() || undefined });
      if (!res?.success) throw new Error(res?.error || 'Could not share');
      toast.success(`Shared with ${res.sharedWith} student${res.sharedWith === 1 ? '' : 's'}. Their linked parents will see it too.`);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Could not share this work. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle>Share with students</DialogTitle>
          <DialogDescription>
            "{assessment.title}" ({questionCount} questions). Students see the questions only; answers stay with you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            {([['all', `Whole class (${roster.length})`], ['some', 'Choose students']] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${mode === value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === 'some' && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 divide-y">
              {roster.length === 0 && <p className="p-3 text-sm text-slate-500">No students yet.</p>}
              {roster.map(s => (
                <label key={s.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50">
                  <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} />
                  <span>{s.name}</span>
                </label>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Due date (optional)</label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Note (optional)</label>
              <Input value={note} onChange={e => setNote(e.target.value)} maxLength={200} placeholder="e.g. Do this tonight" className="mt-1" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={send} disabled={sending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {sending ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
