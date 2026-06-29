import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  ArrowLeft, Bell, Target, CheckCircle2, Circle, Zap,
  Shield, X, Plus, Trash2, Megaphone
} from 'lucide-react';
import { getAssessmentsByUserId } from '../utils/storage';
import { getEngagementMetrics, trackActivity } from '../utils/engagementTracking';
import { getGamificationProfile } from '../utils/gamification';
import { getCognitiveXPProfile, getCognitiveLevel } from '../utils/cognitiveXP';
import { getChildConsents } from '../utils/api';

interface PlatformEssentialsProps {
  user: User;
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

type Tab = 'home' | 'notifications' | 'goals' | 'setup';

interface Notification {
  id: string;
  type: 'achievement' | 'reminder' | 'system' | 'insight';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  icon: string;
}

interface StudyGoal {
  id: string;
  title: string;
  type: 'weekly_sessions' | 'assessment' | 'streak' | 'custom';
  target: number;
  current: number;
  completed: boolean;
  createdAt: string;
}

const ANNOUNCEMENTS = [
  { id: 'ann1', title: '🎉 345 Assessment Questions Now Live', body: 'Kolb, Sternberg, and Decision-Making question banks are available. Take your assessments to build your cognitive profile!', priority: 'high' },
  { id: 'ann2', title: '🧠 AI Learning Coach Available', body: 'Your personalised AI Coach creates study plans, weekly planners, and smart reminders based on your cognitive profile.', priority: 'normal' },
  { id: 'ann3', title: '📊 Teacher Intelligence & School Analytics', body: 'Head teachers and school admins now have class heatmaps, intervention recommendations, and Jots Code linking.', priority: 'normal' },
];

const GOAL_TEMPLATES: Omit<StudyGoal, 'id' | 'current' | 'completed' | 'createdAt'>[] = [
  { title: 'Complete 3 study sessions this week', type: 'weekly_sessions', target: 3 },
  { title: 'Maintain a 7-day streak', type: 'streak', target: 7 },
  { title: 'Complete all 3 assessment types', type: 'assessment', target: 3 },
];

const GOALS_KEY = (id: string) => `jotminds_goals_${id}`;
const NOTIF_KEY = (id: string) => `jotminds_notif_${id}`;
const NOTIF_COLORS = { achievement: '#E0A020', reminder: '#5B7DB1', system: '#6B4C9A', insight: '#1E8A6E' };

function loadGoals(userId: string): StudyGoal[] {
  try { return JSON.parse(localStorage.getItem(GOALS_KEY(userId)) ?? '[]'); } catch { return []; }
}
function saveGoals(userId: string, goals: StudyGoal[]) {
  localStorage.setItem(GOALS_KEY(userId), JSON.stringify(goals));
}
function loadNotifs(userId: string): Notification[] {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY(userId)) ?? '[]'); } catch { return []; }
}
function saveNotifs(userId: string, n: Notification[]) {
  localStorage.setItem(NOTIF_KEY(userId), JSON.stringify(n));
}

function generateNotifs(user: User): Notification[] {
  const assessments = getAssessmentsByUserId(user.id).filter((a: any) => a.completedAt);
  const gam = getGamificationProfile(user.id);
  const cxp = getCognitiveXPProfile(user.id);
  const notifs: Notification[] = [];

  if (assessments.length === 0)
    notifs.push({ id: 'n_first', type: 'reminder', title: 'Start your first assessment', body: 'Discover your learning style by completing the Kolb Learning Style assessment.', timestamp: new Date().toISOString(), read: false, icon: '🎯' });
  if (assessments.length > 0 && assessments.length < 3)
    notifs.push({ id: 'n_more', type: 'reminder', title: 'Complete your cognitive profile', body: `You've done ${assessments.length}/3 assessment types. Finish the remaining ones for a full cognitive profile.`, timestamp: new Date().toISOString(), read: false, icon: '🧠' });
  if (gam?.currentStreak && gam.currentStreak >= 3)
    notifs.push({ id: 'n_streak', type: 'achievement', title: `🔥 ${gam.currentStreak}-day streak!`, body: "Keep logging in daily to maintain your streak and earn XP.", timestamp: new Date().toISOString(), read: false, icon: '🔥' });
  if (cxp.level > 1)
    notifs.push({ id: 'n_level', type: 'achievement', title: `Cognitive Level ${cxp.level} reached!`, body: `Unlocked: ${getCognitiveLevel(cxp.totalXP).perks.join(', ')}.`, timestamp: new Date().toISOString(), read: false, icon: '⬆️' });
  if (assessments.length >= 3)
    notifs.push({ id: 'n_ai', type: 'insight', title: 'AI Coach ready', body: 'Your cognitive profile is complete — check your personalised AI Learning Coach for study tips.', timestamp: new Date().toISOString(), read: false, icon: '🤖' });
  return notifs;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getProfileCompleteness(user: User) {
  const assessments = getAssessmentsByUserId(user.id).filter((a: any) => a.completedAt);
  const hasLearning = assessments.some((a: any) => ['kolb', 'vark'].includes(a.type));
  const hasThinking = assessments.some((a: any) => ['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking'].includes(a.type));
  const hasDecision = assessments.some((a: any) => a.type === 'dual-process');
  const items = [
    { label: 'Learning style assessment', done: hasLearning },
    { label: 'Thinking style assessment', done: hasThinking },
    { label: 'Decision style assessment', done: hasDecision },
    { label: 'School set in profile', done: !!user.school },
    { label: 'Age / date of birth', done: !!(user.age || user.dateOfBirth) },
    { label: 'Education level', done: !!user.educationLevel },
  ];
  return { score: Math.round((items.filter(i => i.done).length / items.length) * 100), items };
}

export function PlatformEssentials({ user, onBack, onNavigate }: PlatformEssentialsProps) {
  const [tab, setTab] = useState<Tab>('home');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [addingGoal, setAddingGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [announcementsSeen, setAnnouncementsSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = loadNotifs(user.id);
    const fresh = generateNotifs(user);
    const storedIds = new Set(stored.map(n => n.id));
    setNotifications([...stored, ...fresh.filter(n => !storedIds.has(n.id))]);

    // Fetch pending consents for student
    if (user.role === 'student') {
      getChildConsents(user.id).then(data => {
        if (data.success && data.consents) {
          const pending = data.consents.filter((c: any) => c.consentGiven === false && !c.automatic);
          if (pending.length > 0) {
            setNotifications(prev => {
              const updated = [...prev];
              let changed = false;
              pending.forEach((c: any) => {
                const id = `consent_${c.parentId}`;
                if (!updated.some(n => n.id === id)) {
                  updated.push({
                    id,
                    type: 'reminder',
                    title: 'Parent Link Request',
                    body: 'Your parent/guardian has requested to link to your account. Please review in Privacy Settings.',
                    timestamp: new Date().toISOString(),
                    read: false,
                    icon: '👪'
                  });
                  changed = true;
                }
              });
              if (changed) saveNotifs(user.id, updated);
              return updated;
            });
          }
        }
      }).catch(err => console.error('Failed to load pending consents', err));
    }

    const gam = getGamificationProfile(user.id);
    const eng = getEngagementMetrics(user.id);
    const assessments = getAssessmentsByUserId(user.id).filter((a: any) => a.completedAt);
    const completedTypes = new Set(assessments.map((a: any) => {
      if (['kolb', 'vark'].includes(a.type)) return 'learning';
      if (['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking'].includes(a.type)) return 'thinking';
      if (a.type === 'dual-process') return 'decision';
      return a.type;
    }));
    const stored2 = loadGoals(user.id).map(g => {
      let current = g.current;
      if (g.type === 'streak') current = gam?.currentStreak ?? 0;
      else if (g.type === 'assessment') current = completedTypes.size;
      else if (g.type === 'weekly_sessions') current = eng?.totalSessions ?? 0;
      return { ...g, current, completed: current >= g.target };
    });
    setGoals(stored2);

    trackActivity(user.id, 'profile_view', 60);
    const seen = JSON.parse(localStorage.getItem(`jm_ann_seen_${user.id}`) ?? '[]');
    setAnnouncementsSeen(new Set(seen));
  }, [user.id]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const cxp = useMemo(() => getCognitiveXPProfile(user.id), [user.id]);
  const gam = useMemo(() => getGamificationProfile(user.id), [user.id]);
  const eng = useMemo(() => getEngagementMetrics(user.id), [user.id]);
  const completeness = useMemo(() => getProfileCompleteness(user), [user]);

  const markRead = (id: string) => {
    const u = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(u); saveNotifs(user.id, u);
  };
  const markAllRead = () => {
    const u = notifications.map(n => ({ ...n, read: true }));
    setNotifications(u); saveNotifs(user.id, u);
  };
  const deleteNotif = (id: string) => {
    const u = notifications.filter(n => n.id !== id);
    setNotifications(u); saveNotifs(user.id, u);
  };
  const addGoal = (template?: typeof GOAL_TEMPLATES[0]) => {
    const goal: StudyGoal = { id: `goal_${Date.now()}`, title: template?.title ?? newGoalTitle, type: template?.type ?? 'custom', target: template ? template.target : parseInt(newGoalTarget) || 1, current: 0, completed: false, createdAt: new Date().toISOString() };
    const u = [...goals, goal]; setGoals(u); saveGoals(user.id, u);
    setAddingGoal(false); setNewGoalTitle(''); setNewGoalTarget('');
  };
  const deleteGoal = (id: string) => {
    const u = goals.filter(g => g.id !== id); setGoals(u); saveGoals(user.id, u);
  };
  const dismissAnn = (id: string) => {
    const u = new Set([...announcementsSeen, id]);
    setAnnouncementsSeen(u);
    localStorage.setItem(`jm_ann_seen_${user.id}`, JSON.stringify([...u]));
  };

  const quickActions = [
    { label: 'Take Assessment', icon: '📋', view: 'dashboard' },
    { label: 'Brain Gym', icon: '🏋️', view: 'skill-builder' },
    { label: 'AI Coach', icon: '🤖', view: 'ai-coach' },
    { label: 'Cognitive Growth', icon: '🧠', view: 'cognitive-growth' },
    { label: 'Gamification', icon: '🎮', view: 'gamification' },
    { label: 'Engagement Stats', icon: '📊', view: 'engagement' },
  ];

  const featureList = [
    { label: 'Cognitive Assessments', available: true, desc: 'Kolb, Sternberg, Dual-Process' },
    { label: 'AI Learning Coach', available: true, desc: 'Personalised study plans' },
    { label: 'Cognitive Growth Tracker', available: true, desc: 'XP, milestones, progress graphs' },
    { label: 'Brain Gym', available: true, desc: 'Daily cognitive exercises' },
    { label: 'Gamification', available: true, desc: 'Badges, streaks, levels' },
    { label: 'Teacher Intelligence', available: user.role === 'teacher' || user.role === 'school_admin' || user.role === 'admin', desc: 'Class analytics & interventions' },
    { label: 'School Analytics', available: user.role === 'school_admin' || user.role === 'admin', desc: 'School-wide performance data' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1"><ArrowLeft className="w-4 h-4" /> Back</Button>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-base"><Zap className="w-5 h-5 text-[#5B7DB1]" />Platform Essentials</h1>
            <p className="text-xs text-gray-500">{user.name} · {user.role}</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={() => setTab('notifications')} className="relative">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center">{unreadCount}</span>
            </button>
          )}
        </div>
        <div className="max-w-2xl mx-auto px-4 flex gap-1 pb-0 overflow-x-auto">
          {([['home', Zap, 'Home'], ['notifications', Bell, 'Alerts'], ['goals', Target, 'Goals'], ['setup', Shield, 'Setup']] as const).map(([t, Icon, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 shrink-0 transition-colors ${tab === t ? 'border-[#5B7DB1] text-[#5B7DB1]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-3.5 h-3.5" />{label}
              {t === 'notifications' && unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1 rounded-full">{unreadCount}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {tab === 'home' && (<>
          {ANNOUNCEMENTS.filter(a => !announcementsSeen.has(a.id)).map(ann => (
            <div key={ann.id} className={`rounded-xl p-4 border-l-4 flex items-start gap-3 ${ann.priority === 'high' ? 'bg-blue-50 border-l-[#5B7DB1]' : 'bg-gray-50 border-l-gray-300'}`}>
              <Megaphone className={`w-4 h-4 shrink-0 mt-0.5 ${ann.priority === 'high' ? 'text-[#5B7DB1]' : 'text-gray-500'}`} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{ann.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{ann.body}</p>
              </div>
              <button onClick={() => dismissAnn(ann.id)} className="text-gray-400 hover:text-gray-600 shrink-0"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-800">Profile Completeness</p>
                <span className="text-sm font-bold" style={{ color: completeness.score >= 80 ? '#1E8A6E' : completeness.score >= 50 ? '#E0A020' : '#DC2626' }}>{completeness.score}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                <div className="h-2 rounded-full" style={{ width: `${completeness.score}%`, backgroundColor: completeness.score >= 80 ? '#1E8A6E' : completeness.score >= 50 ? '#E0A020' : '#DC2626' }} />
              </div>
              <div className="space-y-1.5">
                {completeness.items.map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    {item.done ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                    <p className={`text-xs ${item.done ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'XP', value: cxp.totalXP.toLocaleString(), icon: '⚡', color: '#6B4C9A' },
              { label: 'Streak', value: `${gam?.currentStreak ?? 0}d`, icon: '🔥', color: '#E0A020' },
              { label: 'Eng. Score', value: `${eng?.engagementScore ?? 0}`, icon: '📊', color: '#1E8A6E' },
            ].map(s => (
              <Card key={s.label}><CardContent className="pt-3 pb-3 text-center">
                <div className="text-lg">{s.icon}</div>
                <div className="text-base font-bold" style={{ color: s.color }}>{s.value}</div>
                <p className="text-[10px] text-gray-500">{s.label}</p>
              </CardContent></Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {quickActions.map(qa => (
                <button key={qa.label} onClick={() => onNavigate?.(qa.view)}
                  className="flex items-center gap-2 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors text-left">
                  <span className="text-xl">{qa.icon}</span>
                  <p className="text-xs font-semibold text-gray-800">{qa.label}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {goals.filter(g => !g.completed).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Active Goals</span>
                  <button onClick={() => setTab('goals')} className="text-xs text-[#5B7DB1]">See all →</button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {goals.filter(g => !g.completed).slice(0, 3).map(g => (
                  <div key={g.id}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-gray-700 truncate flex-1 mr-2">{g.title}</span>
                      <span className="text-gray-500 shrink-0">{g.current}/{g.target}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-[#5B7DB1]" style={{ width: `${Math.min(100, (g.current / g.target) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>)}

        {tab === 'notifications' && (<>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{unreadCount} unread</p>
            {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-[#5B7DB1]">Mark all read</button>}
          </div>
          {notifications.length === 0 && (
            <Card><CardContent className="py-12 text-center">
              <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No notifications yet</p>
            </CardContent></Card>
          )}
          {notifications.map(n => (
            <div key={n.id} className={`rounded-xl border p-4 flex items-start gap-3 ${!n.read ? 'bg-white border-blue-100' : 'bg-gray-50 border-gray-100 opacity-70'}`}>
              <span className="text-xl shrink-0">{n.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                  <Badge style={{ backgroundColor: NOTIF_COLORS[n.type] + '20', color: NOTIF_COLORS[n.type] }} className="text-[10px] shrink-0">{n.type}</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.timestamp)}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                {!n.read && <button onClick={() => markRead(n.id)} className="text-[10px] text-blue-600 hover:underline">Mark read</button>}
                <button onClick={() => deleteNotif(n.id)}><X className="w-3.5 h-3.5 text-gray-300 hover:text-red-400" /></button>
              </div>
            </div>
          ))}
        </>)}

        {tab === 'goals' && (<>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{goals.filter(g => g.completed).length}/{goals.length} completed</p>
            <Button size="sm" onClick={() => setAddingGoal(!addingGoal)} style={{ backgroundColor: '#5B7DB1' }}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Goal
            </Button>
          </div>

          {addingGoal && (
            <Card className="border-blue-200">
              <CardHeader><CardTitle className="text-sm">New Study Goal</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-gray-600">Quick templates:</p>
                {GOAL_TEMPLATES.map((t, i) => (
                  <button key={i} onClick={() => addGoal(t)}
                    className="w-full text-left text-xs p-2 rounded-lg border hover:bg-blue-50 hover:border-blue-200 text-gray-700">
                    + {t.title}
                  </button>
                ))}
                <div className="border-t pt-3 space-y-2">
                  <p className="text-xs text-gray-600">Or custom:</p>
                  <input className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#5B7DB1]" placeholder="Goal title..." value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} />
                  <div className="flex gap-2">
                    <input type="number" className="flex-1 text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#5B7DB1]" placeholder="Target" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} />
                    <Button size="sm" onClick={() => addGoal()} disabled={!newGoalTitle || !newGoalTarget} style={{ backgroundColor: '#5B7DB1' }}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setAddingGoal(false)}>Cancel</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {goals.length === 0 && !addingGoal && (
            <Card><CardContent className="py-12 text-center">
              <Target className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No goals yet — add one to track your progress</p>
            </CardContent></Card>
          )}

          {goals.filter(g => !g.completed).map(g => (
            <Card key={g.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm text-gray-800">{g.title}</p>
                  <button onClick={() => deleteGoal(g.id)}><Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-400" /></button>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{g.current}/{g.target} ({Math.round(Math.min(100, (g.current / g.target) * 100))}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-[#5B7DB1]" style={{ width: `${Math.min(100, (g.current / g.target) * 100)}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}

          {goals.filter(g => g.completed).length > 0 && (<>
            <p className="text-xs text-gray-500 mt-4">Completed</p>
            {goals.filter(g => g.completed).map(g => (
              <div key={g.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-sm text-gray-600 line-through flex-1">{g.title}</p>
                <button onClick={() => deleteGoal(g.id)}><Trash2 className="w-3.5 h-3.5 text-gray-300" /></button>
              </div>
            ))}
          </>)}
        </>)}

        {tab === 'setup' && (<>
          <Card>
            <CardHeader><CardTitle className="text-sm">Your Account</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Name', value: user.name },
                { label: 'Email', value: user.email },
                { label: 'Role', value: user.role },
                { label: 'School', value: user.school ?? 'Not set' },
                { label: 'Jots Code', value: user.jotsCode ?? 'Not set' },
                { label: 'Education Level', value: user.educationLevel ?? 'Not set' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <p className="text-xs text-gray-500">{row.label}</p>
                  <p className="text-xs text-gray-800">{row.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Platform Features</CardTitle><CardDescription>Available for your role</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {featureList.map(f => (
                <div key={f.label} className="flex items-center gap-3 py-1.5 border-b last:border-0">
                  {f.available ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> : <Circle className="w-4 h-4 text-gray-300 shrink-0" />}
                  <div className="flex-1">
                    <p className={`text-xs ${f.available ? 'text-gray-800' : 'text-gray-400'}`}>{f.label}</p>
                    <p className="text-[10px] text-gray-400">{f.desc}</p>
                  </div>
                  {f.available && <Badge className="bg-green-50 text-green-700 text-[10px]">Active</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4" />Data & Privacy</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 mb-3">Your cognitive assessment data is stored securely and only accessible to you and your teacher (if applicable).</p>
              <Button variant="outline" size="sm" className="w-full" onClick={() => onNavigate?.('privacy-dashboard')}>
                <Shield className="w-3.5 h-3.5 mr-2" /> View Privacy Dashboard
              </Button>
            </CardContent>
          </Card>
        </>)}
      </div>
    </div>
  );
}
