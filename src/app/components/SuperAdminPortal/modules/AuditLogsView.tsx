import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Loader, ScrollText } from 'lucide-react';
import { listAuditLogs } from '../../../utils/api';

export function AuditLogsView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await listAuditLogs();
        setLogs(response?.logs || []);
      } catch (err) {
        console.error('Error loading audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Audit Logs</h2>
        <p className="text-slate-500 dark:text-slate-400">Review all actions performed by Super Admins.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Admin</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">Details</th>
                  <th className="px-6 py-4 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500"><Loader className="w-4 h-4 animate-spin inline mr-2" />Loading...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <ScrollText className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700 mb-3" />
                    No admin actions logged yet. Logging began when this dashboard was introduced, so earlier actions aren't recorded.
                  </td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{log.adminEmail}</td>
                      <td className="px-6 py-4 font-mono text-xs">{log.action}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs max-w-xs truncate" title={JSON.stringify(log.details)}>
                        {JSON.stringify(log.details)}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
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
