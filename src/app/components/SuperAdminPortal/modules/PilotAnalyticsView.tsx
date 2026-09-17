import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Loader, Users, CheckCircle2, Clock, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { getPilotAnalytics, exportPilotData } from '../../../utils/api';

function formatMs(ms: number | null) {
  if (ms === null || ms === undefined) return '—';
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export function PilotAnalyticsView() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setAnalytics(await getPilotAnalytics()); }
    catch (e) { console.error(e); toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportPilotData();
      const blob = new Blob([JSON.stringify(data.participants, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jotminds-pilot-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${data.participants.length} de-identified participant records`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to export pilot data');
    } finally {
      setExporting(false);
    }
  };

  if (loading || !analytics) {
    return <div className="flex items-center justify-center min-h-[300px] text-slate-500"><Loader className="w-6 h-6 animate-spin mr-2" /> Loading...</div>;
  }

  const { sessionStats, itemStats, qualityFlags } = analytics;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Pilot Analytics</h2>
          <p className="text-slate-500 dark:text-slate-400">Completion, duration, drop-off, and response quality across all Professional V2 pilot sessions.</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Export De-identified Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{sessionStats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{sessionStats.completionRate}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatMs(sessionStats.avgDurationMs)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quality Flags</CardTitle>
            <AlertTriangle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">{qualityFlags.veryFastResponses} very fast · {qualityFlags.heavilyRevisedResponses} heavily revised</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Item-Level Breakdown</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Item</th>
                  <th className="px-6 py-4 font-medium">Served</th>
                  <th className="px-6 py-4 font-medium">Completed</th>
                  <th className="px-6 py-4 font-medium">Drop-Off</th>
                  <th className="px-6 py-4 font-medium">Avg Response Time</th>
                  <th className="px-6 py-4 font-medium">Option Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {itemStats.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No pilot sessions yet.</td></tr>
                ) : (
                  itemStats.map((item: any) => (
                    <tr key={item.itemKey} className="bg-white dark:bg-slate-950">
                      <td className="px-6 py-4 font-mono text-xs">{item.itemKey}</td>
                      <td className="px-6 py-4">{item.servedCount}</td>
                      <td className="px-6 py-4">{item.completedCount}</td>
                      <td className="px-6 py-4">
                        <Badge variant={item.dropOffRate > 20 ? 'destructive' : 'outline'}>{item.dropOffRate}%</Badge>
                      </td>
                      <td className="px-6 py-4">{formatMs(item.avgResponseTimeMs)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(item.optionDistribution).map(([code, count]) => (
                            <Badge key={code} variant="outline">{code}: {count as number}</Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
