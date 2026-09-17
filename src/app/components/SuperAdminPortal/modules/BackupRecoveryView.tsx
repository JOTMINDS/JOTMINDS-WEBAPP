import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { DatabaseBackup, ExternalLink } from 'lucide-react';
import { projectId } from '../../../utils/supabase/info';

const DASHBOARD_BASE = `https://supabase.com/dashboard/project/${projectId}`;

export function BackupRecoveryView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Backup & Recovery</h2>
        <p className="text-slate-500 dark:text-slate-400">Database snapshots and disaster recovery.</p>
      </div>

      <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
        <CardContent className="p-4 text-sm text-amber-800 dark:text-amber-300">
          One-click restore/snapshot triggers aren't built into this panel on purpose - a destructive action like a database
          restore is too high-blast-radius for a client-facing web app, regardless of how well the admin check is gated.
          Backups and point-in-time recovery are managed safely through Supabase's own dashboard, linked below.
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><DatabaseBackup className="w-4 h-4 text-indigo-600" /> Backups & PITR</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-500">View backup history, restore points, and configure point-in-time recovery.</p>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <a href={`${DASHBOARD_BASE}/database/backups/scheduled`} target="_blank" rel="noopener noreferrer">
              Open Backups Dashboard <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
