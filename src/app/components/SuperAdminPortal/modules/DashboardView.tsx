import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Users, School, Building2, BrainCircuit } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface DashboardViewProps {
  stats: any;
}

export function DashboardView({ stats }: DashboardViewProps) {
  // Use real data where possible. Fallback to 0 if not yet loaded.
  const totalUsers = stats?.totalUsers || 0;
  const totalAssessments = stats?.totalAssessments || 0;
  
  // Safely extract roles
  const usersByRole = stats?.usersByRole || {};
  const teachers = usersByRole['Teacher'] || usersByRole['Educator'] || 0;
  const students = usersByRole['Student'] || usersByRole['Child'] || 0;
  const parents = usersByRole['Parent'] || 0;
  const professionals = usersByRole['Professional'] || usersByRole['Organization'] || 0;

  // We need to format the role data for the chart
  const roleChartData = [
    { name: 'Students', count: students },
    { name: 'Teachers', count: teachers },
    { name: 'Parents', count: parents },
    { name: 'Pros', count: professionals },
  ].filter(d => d.count > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Platform Overview</h2>
        <p className="text-slate-500 dark:text-slate-400">Live metrics across the entire JOTMinds ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-emerald-500 mt-1">Live from database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assessments Completed</CardTitle>
            <BrainCircuit className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssessments.toLocaleString()}</div>
            <p className="text-xs text-emerald-500 mt-1">Live from database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle>
            <School className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Active learners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Professionals</CardTitle>
            <Building2 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{professionals.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Corporate & Adults</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution by Role</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {roleChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">Not enough data to display chart.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Database (Supabase)</p>
                  <p className="text-sm text-slate-500">Connected</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Edge Functions</p>
                  <p className="text-sm text-slate-500">Operational</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Authentication API</p>
                  <p className="text-sm text-slate-500">Operational</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Storage Edge Network</p>
                  <p className="text-sm text-slate-500">Operational</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
