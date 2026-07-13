import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Trophy, Star, Target, Crown } from 'lucide-react';

export const GamificationAdmin: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Gamification Rules</h2>
          <p className="text-slate-500">Configure points, badges, and platform rewards</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-none bg-white dark:bg-gray-900 opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <Trophy className="w-5 h-5" />
              Achievements
            </CardTitle>
            <CardDescription>Unlockable student milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-500">
              <p>Rule engine under construction.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-gray-900 opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-500">
              <Star className="w-5 h-5" />
              Points System
            </CardTitle>
            <CardDescription>Reward values for activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-500">
              <p>Economy balancing tools coming soon.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-gray-900 opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-500">
              <Target className="w-5 h-5" />
              Challenges
            </CardTitle>
            <CardDescription>Time-limited platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-500">
              <p>Challenge orchestration coming soon.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-gray-900 opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-500">
              <Crown className="w-5 h-5" />
              Leaderboards
            </CardTitle>
            <CardDescription>Global and institutional ranks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-500">
              <p>Leaderboard configurations coming soon.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
