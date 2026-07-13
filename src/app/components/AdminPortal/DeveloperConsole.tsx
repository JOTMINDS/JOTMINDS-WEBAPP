import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Terminal, Database, Server, Cpu, Wifi } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';

export const DeveloperConsole: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Developer Console</h2>
          <p className="text-slate-500">System health and environment configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              Supabase Project
            </CardTitle>
            <CardDescription>Primary database and backend services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-gray-800">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Project ID</span>
              <span className="text-sm text-slate-800 dark:text-white font-mono">{projectId || 'Unknown'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-gray-800">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Database Status</span>
              <span className="text-sm text-emerald-600 font-medium flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> Online
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Edge Functions</span>
              <span className="text-sm text-emerald-600 font-medium flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> Online
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-500" />
              Frontend Hosting
            </CardTitle>
            <CardDescription>Cloudflare Pages deployment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-gray-800">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Environment</span>
              <span className="text-sm text-slate-800 dark:text-white capitalize">{import.meta.env.MODE || 'production'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-gray-800">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Version</span>
              <span className="text-sm text-slate-800 dark:text-white font-mono">v1.2.0</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">CDN Status</span>
              <span className="text-sm text-emerald-600 font-medium flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> Online
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
