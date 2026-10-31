import React, { useEffect, useState } from 'react';
import { Copy, CheckCircle2, KeyRound, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { InfoTip } from './ui/info-tip';
import { Class } from '../types';
import { generateClassCodeForClass } from '../utils/api';
import { saveClass } from '../utils/storage';

interface ClassCodeCardProps {
  cls: Class;
  onUpdated?: (updated: Class) => void;
}

/** One code for a whole class: students enter it, confirm their name and birthday, and get their own code. */
export function ClassCodeCard({ cls, onUpdated }: ClassCodeCardProps) {
  const [code, setCode] = useState(cls.classCode || '');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCode(cls.classCode || '');
  }, [cls.id, cls.classCode]);

  const generate = async (regenerate: boolean) => {
    if (regenerate && !window.confirm('Make a new class code? The old one stops working for students who have not signed in yet. Personal codes students already have keep working.')) return;
    setBusy(true);
    try {
      const res = await generateClassCodeForClass(cls.id, regenerate);
      if (!res.success || !res.classCode) {
        toast.error(res.error || 'Could not generate the class code.');
        return;
      }
      setCode(res.classCode);
      const updated = { ...cls, classCode: res.classCode };
      saveClass(updated);
      onUpdated?.(updated);
    } catch {
      toast.error('Could not generate the class code.');
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy. Select the code and copy it by hand.');
    }
  };

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" /> Class code for {cls.name}
            <InfoTip>Give this one code to the whole class. Each student enters it on the sign-in page, confirms their name and date of birth, and is given their own personal code. That code then shows in your roster, in their parent's account and on their own dashboard.</InfoTip>
          </p>
          {code ? (
            <p className="text-2xl font-mono font-bold tracking-widest text-indigo-700 mt-1 select-all">{code}</p>
          ) : (
            <p className="text-xs text-indigo-700/80 mt-1">No class code yet.</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {code ? (
            <>
              <Button size="sm" variant="outline" onClick={copy} className="bg-white">
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => generate(true)} disabled={busy} title="Make a new class code">
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => generate(false)} disabled={busy} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {busy ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <KeyRound className="w-3.5 h-3.5 mr-1" />}
              Generate class code
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
