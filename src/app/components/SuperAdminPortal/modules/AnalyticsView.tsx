import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { createClient } from '../../../utils/supabase/client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

export function AnalyticsView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const supabase = createClient();
        // Here we would ideally group by date. For now, we simulate a grouping using real created_at dates if available.
        const { data: usersData, error } = await supabase.from('users').select('created_at').order('created_at', { ascending: true });
        
        if (error) throw error;
        
        // Process into monthly data safely
        const monthlyData: Record<string, number> = {};
        if (usersData) {
          usersData.forEach((u: any) => {
            if (u.created_at) {
              const date = new Date(u.created_at);
              const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
              monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
            }
          });
        }
        
        const chartData = Object.keys(monthlyData).map(key => ({
          name: key,
          users: monthlyData[key]
        }));
        
        setData(chartData);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Platform Analytics</h2>
          <p className="text-slate-500 dark:text-slate-400">Deep dive into user growth, retention, and engagement metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-500">Loading growth data...</div>
            ) : data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="users" stroke="#4f46e5" fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">Not enough data to display trend.</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Regional Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center text-slate-500 text-center px-6">
            <p className="mb-2">Regional geographic data visualization requires the Maps Integration plugin.</p>
            <p className="text-sm opacity-70">Waiting for live data signals from active tenants.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
