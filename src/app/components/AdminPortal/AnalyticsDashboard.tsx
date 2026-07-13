import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { LineChart, BarChart, PieChart, Activity } from 'lucide-react';
import { useAdminData } from '../../hooks/useAdminData';

export const AnalyticsDashboard: React.FC = () => {
  const { stats } = useAdminData();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Platform Analytics</h2>
          <p className="text-slate-500">Business intelligence and user growth metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-indigo-500" />
              User Growth Trend
            </CardTitle>
            <CardDescription>Estimated registration volume over time</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center border-t border-slate-100 dark:border-gray-800">
            <div className="text-center text-slate-400">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Historical chart rendering disabled.</p>
              <p className="text-xs">Require timeseries aggregation backend.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-500" />
              Current Demographics
            </CardTitle>
            <CardDescription>Live breakdown by account type</CardDescription>
          </CardHeader>
          <CardContent className="border-t border-slate-100 dark:border-gray-800 pt-6">
            <div className="space-y-4">
              {Object.entries(stats?.usersByRole || {}).map(([role, count]: any) => {
                const percentage = stats?.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0;
                return (
                  <div key={role}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{role}</span>
                      <span className="text-slate-500">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
