import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Search, MoreVertical, BrainCircuit, FileEdit, Trash2, Globe2 } from 'lucide-react';
import { createClient } from '../../../utils/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

export function AssessmentEngineView() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModules() {
      try {
        const supabase = createClient();
        // Assuming an assessment_modules table exists. If not, it will return empty safely.
        const { data, error } = await supabase.from('assessment_modules').select('*');
        if (error) {
          console.error('Error fetching modules:', error);
          setModules([]);
        } else {
          setModules(data || []);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchModules();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Assessment Engine</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage cognitive assessment modules, question banks, and scoring logic.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">Create Module</Button>
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
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
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
                      <p>No assessment modules found in database.</p>
                      <Button variant="link" className="mt-2 text-indigo-600">Create your first module</Button>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><FileEdit className="mr-2 h-4 w-4" /> Edit Questions</DropdownMenuItem>
                            <DropdownMenuItem><Globe2 className="mr-2 h-4 w-4" /> View Analytics</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete Module</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
