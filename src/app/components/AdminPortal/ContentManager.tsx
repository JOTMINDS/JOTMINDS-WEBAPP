import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { FileText, Database, Layers, CheckCircle2 } from 'lucide-react';

export const ContentManager: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Content Library</h2>
          <p className="text-slate-500">Manage platform educational content and reference databases</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-none bg-white dark:bg-gray-900 opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              Career Clusters
            </CardTitle>
            <CardDescription>Industry pathways and professions database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-amber-600 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
              Under Construction
            </div>
            <p className="text-sm text-slate-500 mt-2">
              The career cluster database is currently managed directly via Supabase. A UI manager is planned for a future release.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-gray-900 opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              Brain Gym Library
            </CardTitle>
            <CardDescription>Exercises and cognitive training modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-amber-600 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
              Under Construction
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Cognitive exercises are currently statically bundled. A dynamic CMS is planned.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-gray-900 opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              AI Prompt Templates
            </CardTitle>
            <CardDescription>System prompts for generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-amber-600 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
              Under Construction
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Prompts are currently hardcoded in serverless functions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
