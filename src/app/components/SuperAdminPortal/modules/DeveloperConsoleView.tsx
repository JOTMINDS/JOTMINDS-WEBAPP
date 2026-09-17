import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Database, FileText, ExternalLink } from 'lucide-react';
import { projectId } from '../../../utils/supabase/info';

const DASHBOARD_BASE = `https://supabase.com/dashboard/project/${projectId}`;

export function DeveloperConsoleView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Developer Console</h2>
        <p className="text-slate-500 dark:text-slate-400">Database explorer and edge function logs.</p>
      </div>

      <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
        <CardContent className="p-4 text-sm text-amber-800 dark:text-amber-300">
          Live SQL execution isn't built into this panel on purpose - an arbitrary-query surface is too high-blast-radius
          for a client-facing web app regardless of how the admin check is gated (one compromised session becomes full
          database access). Use Supabase's own dashboard tools below instead - they're properly access-controlled.
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Database className="w-4 h-4 text-indigo-600" /> SQL Editor</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-500">Query and explore the production database directly in Supabase's SQL editor.</p>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <a href={`${DASHBOARD_BASE}/sql/new`} target="_blank" rel="noopener noreferrer">
                Open SQL Editor <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-600" /> Edge Function Logs</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-500">View live logs and invocation history for the deployed edge function.</p>
            <Button asChild variant="outline">
              <a href={`${DASHBOARD_BASE}/functions`} target="_blank" rel="noopener noreferrer">
                Open Function Logs <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
