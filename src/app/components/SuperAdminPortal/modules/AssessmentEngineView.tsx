import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Input } from '../../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Search, BrainCircuit, Globe2, Loader } from 'lucide-react';
import { listAssessmentModules, getAssessmentModuleAnalytics } from '../../../utils/api';
import { toast } from 'sonner';

export function AssessmentEngineView() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsFor, setAnalyticsFor] = useState<any | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    async function fetchModules() {
      try {
        // Assessment modules are the seeded question banks in the KV store
        // (questions:<framework>:<version>), not a Postgres table.
        const response = await listAssessmentModules();
        setModules(response?.modules || []);
      } catch (err) {
        console.error('Error:', err);
        setModules([]);
      } finally {
        setLoading(false);
      }
    }
    fetchModules();
  }, []);

  const openAnalytics = async (mod: any) => {
    setAnalyticsFor(mod);
    setLoadingAnalytics(true);
    try {
      const response = await getAssessmentModuleAnalytics(mod.framework);
      setAnalytics(response?.analytics || null);
    } catch (err) {
      console.error('Error loading module analytics:', err);
      toast.error('Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Assessment Engine</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Cognitive assessment modules and their completion analytics. Question banks (100 questions each) are seeded in
          code, not editable from here - a developer change is needed to modify question content or add new frameworks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <BrainCircuit className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Active Modules</h3>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{modules.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search modules..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Module Name</th>
                  <th className="px-6 py-4 font-medium">Target Age</th>
                  <th className="px-6 py-4 font-medium">Questions</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading assessment modules...</td>
                  </tr>
                ) : modules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <BrainCircuit className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700 mb-3" />
                      No assessment modules found.
                    </td>
                  </tr>
                ) : (
                  modules.map((mod) => (
                    <tr key={mod.id} className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{mod.name}</td>
                      <td className="px-6 py-4 text-slate-500">{mod.target_age || 'All Ages'}</td>
                      <td className="px-6 py-4 text-slate-500">{mod.question_count || 0}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Published
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openAnalytics(mod)} className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                          <Globe2 className="w-4 h-4" /> View Analytics
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!analyticsFor} onOpenChange={(open) => { if (!open) { setAnalyticsFor(null); setAnalytics(null); } }}>
        <DialogContent>
          {analyticsFor && (
            <>
              <DialogHeader><DialogTitle>{analyticsFor.name} - Analytics</DialogTitle></DialogHeader>
              {loadingAnalytics ? (
                <div className="flex items-center justify-center py-8 text-slate-500"><Loader className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Total Completions</p>
                      <p className="text-xl font-bold">{analytics?.totalCompletions ?? 0}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Last 30 Days</p>
                      <p className="text-xl font-bold">{analytics?.completionsLast30Days ?? 0}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-400 mb-2">Style Distribution</p>
                    {Object.keys(analytics?.styleDistribution || {}).length === 0 ? (
                      <p className="text-sm text-slate-500">No completed assessments yet.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {Object.entries(analytics?.styleDistribution || {}).map(([style, count]) => (
                          <div key={style} className="flex items-center justify-between text-sm">
                            <span>{style}</span>
                            <span className="font-medium">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
