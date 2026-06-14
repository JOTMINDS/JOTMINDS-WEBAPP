import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, ChevronRight, Bell, BellOff } from 'lucide-react';
import {
  getUserNudges,
  dismissNudge,
  interactWithNudge,
  refreshNudges,
  getReminderSchedule,
  updateReminderSchedule,
  type Nudge,
} from '../utils/nudgeSystem';

interface Props {
  userId: string;
  onNavigate: (route: string) => void;
}

export function NudgesPanel({ userId, onNavigate }: Props) {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [showNudges, setShowNudges] = useState(false);

  useEffect(() => {
    loadNudges();
    const schedule = getReminderSchedule(userId);
    setRemindersEnabled(schedule.enabled);

    // Refresh nudges every 5 minutes
    const interval = setInterval(loadNudges, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadNudges = () => {
    refreshNudges(userId);
    const userNudges = getUserNudges(userId, false);
    setNudges(userNudges);
  };

  const handleDismiss = (nudgeId: string) => {
    dismissNudge(nudgeId);
    loadNudges();
  };

  const handleAction = (nudge: Nudge) => {
    interactWithNudge(nudge.id);
    if (nudge.action) {
      onNavigate(nudge.action.route);
    }
    loadNudges();
  };

  const handleToggleReminders = () => {
    const newEnabled = !remindersEnabled;
    updateReminderSchedule(userId, { enabled: newEnabled });
    setRemindersEnabled(newEnabled);
  };

  if (!showNudges || nudges.length === 0) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <Button
            variant="outline"
            size="icon"
            className="relative h-14 w-14 rounded-full shadow-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 transition-transform hover:scale-105 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            onClick={() => setShowNudges(true)}
          >
            <Bell className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
            {nudges.length > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 text-white text-[10px] items-center justify-center font-bold border-2 border-white dark:border-zinc-900">
                  {nudges.length}
                </span>
              </span>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[700px] overflow-y-auto space-y-4 p-1 animate-in fade-in slide-in-from-bottom-8 duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl p-4 sticky top-0 z-10 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">Notifications</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{nudges.length} new updates</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-full p-1 border border-zinc-100 dark:border-zinc-800">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-zinc-700 transition-colors"
              onClick={handleToggleReminders}
              title={remindersEnabled ? 'Disable reminders' : 'Enable reminders'}
            >
              {remindersEnabled ? (
                <Bell className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              ) : (
                <BellOff className="h-4 w-4 text-zinc-400" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-zinc-700 hover:text-red-500 transition-colors"
              onClick={() => setShowNudges(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Nudges List */}
      <div className="space-y-3 pb-2">
        {nudges.map((nudge, index) => (
          <div
            key={nudge.id}
            className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md rounded-2xl overflow-hidden transition-all duration-300 animate-in slide-in-from-right-8"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Icon Container */}
                {nudge.icon && (
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm border border-zinc-100 dark:border-zinc-800"
                    style={{
                      background: `linear-gradient(135deg, ${nudge.color || '#3b82f6'}15, ${nudge.color || '#3b82f6'}05)`
                    }}
                  >
                    {nudge.icon}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{nudge.title}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
                      onClick={() => handleDismiss(nudge.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">{nudge.message}</p>

                  <div className="flex items-center justify-between mt-4">
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-none"
                    >
                      {nudge.priority}
                    </Badge>

                    {nudge.action && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-3 text-xs font-medium rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        style={{ color: nudge.color || '#3b82f6' }}
                        onClick={() => handleAction(nudge)}
                      >
                        {nudge.action.label}
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
