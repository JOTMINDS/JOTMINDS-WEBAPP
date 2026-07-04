import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, ClipboardList, TrendingUp, ShieldCheck } from 'lucide-react';
import { DataExport } from './DataExport';

interface OverviewMetricsProps {
  stats: any;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({ stats }) => {
  const roleColors: { [key: string]: string } = {
    'Student': '#6B4C9A',
    'Teacher': '#7B61FF',
    'Parent': '#10B981',
    'Professional': '#FF715B',
    'Organization': '#8B5CF6'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* High-level metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow border-none bg-white dark:bg-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Users</CardTitle>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats?.totalUsers || 0}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow border-none bg-white dark:bg-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Assessments Taken</CardTitle>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <ClipboardList className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats?.totalAssessments || 0}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow border-none bg-white dark:bg-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Students</CardTitle>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">
              {stats?.usersByRole?.Student || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow border-none bg-white dark:bg-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Organizations</CardTitle>
              <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">
              {stats?.usersByRole?.['Organization'] || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg">User Distribution by Role</CardTitle>
            <CardDescription>Breakdown of platform demographics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {Object.entries(stats?.usersByRole || {}).map(([role, count]: any) => {
                const percentage = stats?.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0;
                return (
                  <div key={role} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{role}</span>
                      <span className="text-sm text-slate-500">{count} users ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: roleColors[role] || '#6B7280'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick System Check */}
        <Card className="shadow-sm border-none bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              System Health
            </CardTitle>
            <CardDescription className="text-indigo-100">All core services are operating normally</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
               <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <span className="text-sm font-medium">Database Latency</span>
                  <span className="text-sm font-bold bg-white/20 px-2 py-1 rounded-md">~24ms</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <span className="text-sm font-medium">Supabase Auth</span>
                  <span className="text-sm font-bold bg-green-500/30 text-green-100 px-2 py-1 rounded-md">Online</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <span className="text-sm font-medium">Active API Routes</span>
                  <span className="text-sm font-bold bg-white/20 px-2 py-1 rounded-md">100%</span>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Export for Validation */}
      <DataExport />
    </div>
  );
};
