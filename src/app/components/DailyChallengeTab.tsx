import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Bell, CheckCircle2, Flame, Lock, Star } from 'lucide-react';
import {
  getDailyChallengeProgress,
  completeDailyChallenge,
  updateNotificationSettings,
} from '../utils/dailyChallengeApi';
import { BrainGame, GameResult } from './BrainGames';
import { GAME_META, GameId, QUEST_ORDER, addDaysToKey, questFor, utcDateKey } from '../data/dailyQuestData';
import { celebrateBadgeUnlock, celebrateSmallWin } from '../utils/confettiAnimations';

interface DailyChallengeTabProps {
  userId: string;
  userName: string;
  userAge?: number;
}

interface ChallengeProgress {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  badges: string[];
  completedDays: string[];
  lastCompletedDate: string | null;
  todayCompleted: boolean;
  notificationFrequency: 'daily' | 'weekly' | 'monthly' | 'off';
}

interface Breakdown {
  base: number;
  score: number;
  streak: number;
}

interface PlayedResult {
  gameId: GameId;
  game: GameResult;
  practice: boolean;
  save: 'saving' | 'saved' | 'error';
  xp: number | null;
  breakdown: Breakdown | null;
  newBadges: string[];
  streak: number | null;
}

const PURPLE = '#6B4C9A';
const BLUE = '#5B7DB1';
const GREEN = '#1E8A6E';

/** Badges a student can see and collect. Earned status is worked out from progress, so it does not depend on the server version. */
const BADGE_SHELF: { name: string; emoji: string; how: string; earned: (p: ChallengeProgress) => boolean }[] = [
  { name: 'First Steps', emoji: '⭐', how: 'Finish your first challenge', earned: (p) => p.completedDays.length >= 1 },
  { name: '3-Day Spark', emoji: '✨', how: 'Play 3 days in a row', earned: (p) => p.longestStreak >= 3 },
  { name: '7-Day Warrior', emoji: '🔥', how: 'Play 7 days in a row', earned: (p) => p.longestStreak >= 7 },
  { name: '10 Challenges Master', emoji: '🎓', how: 'Finish 10 challenges', earned: (p) => p.completedDays.length >= 10 },
  { name: '30-Day Champion', emoji: '🏆', how: 'Play 30 days in a row', earned: (p) => p.longestStreak >= 30 },
  { name: '50 Challenges Hero', emoji: '🦸', how: 'Finish 50 challenges', earned: (p) => p.completedDays.length >= 50 },
];

const STREAK_GOALS = [
  { days: 3, badge: '3-Day Spark' },
  { days: 7, badge: '7-Day Warrior' },
  { days: 30, badge: '30-Day Champion' },
  { days: 100, badge: '100-Day Legend' },
];

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** A streak only counts if the last game was today or yesterday. */
function liveStreak(p: ChallengeProgress, today: string): number {
  if (!p.lastCompletedDate) return 0;
  if (p.lastCompletedDate === today || p.lastCompletedDate === addDaysToKey(today, -1)) return p.currentStreak;
  return 0;
}

function weekKeys(today: string): string[] {
  const dow = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7; // Monday = 0
  const monday = addDaysToKey(today, -dow);
  return Array.from({ length: 7 }, (_, i) => addDaysToKey(monday, i));
}

function earnedBadgeNames(p: ChallengeProgress): string[] {
  return BADGE_SHELF.filter((b) => b.earned(p)).map((b) => b.name);
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function DailyChallengeTab({ userId, userName, userAge }: DailyChallengeTabProps) {
  const today = utcDateKey();
  const quest = useMemo(() => questFor(today), [today]);
  const tomorrowGame = useMemo(() => questFor(addDaysToKey(today, 1)).gameId, [today]);
  const young = !!userAge && userAge <= 14;

  const [progress, setProgress] = useState<ChallengeProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [playing, setPlaying] = useState<{ gameId: GameId; seed: number; practice: boolean } | null>(null);
  const [result, setResult] = useState<PlayedResult | null>(null);
  const [swappedGame, setSwappedGame] = useState<GameId | null>(null);

  const loadProgress = async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const data = await getDailyChallengeProgress(userId);
      setProgress(data.progress);
    } catch (error) {
      console.error('Error loading challenge progress:', error);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [userId]);

  const todaysGame = swappedGame ?? quest.gameId;
  const doneToday = !!progress && (progress.todayCompleted || progress.completedDays.includes(today));

  const startToday = () => {
    setResult(null);
    setPlaying({ gameId: todaysGame, seed: quest.seed, practice: false });
  };

  const startPractice = () => {
    const others = QUEST_ORDER.filter((g) => g !== todaysGame);
    const gameId = others[Math.floor(Math.random() * others.length)];
    setResult(null);
    setPlaying({ gameId, seed: Math.floor(Math.random() * 100000), practice: true });
  };

  const saveResult = async (gameId: GameId, game: GameResult, before: ChallengeProgress) => {
    setResult((r) => (r ? { ...r, save: 'saving' } : r));
    try {
      const res = await completeDailyChallenge(userId, `quest-${gameId}-${today}`, {
        gameId,
        score: Math.round(game.score * 100) / 100,
        summary: game.summary,
      });
      const after = res.updatedProgress;
      const hadBefore = new Set(earnedBadgeNames(before));
      const fresh = earnedBadgeNames(after).filter((b) => !hadBefore.has(b));
      setProgress(after);
      setResult((r) =>
        r
          ? {
              ...r,
              save: 'saved',
              xp: res.pointsEarned,
              breakdown: (res as { breakdown?: Breakdown }).breakdown ?? null,
              newBadges: fresh,
              streak: after.currentStreak,
            }
          : r,
      );
      if (!prefersReducedMotion()) {
        if (fresh.length > 0) celebrateBadgeUnlock('rare');
        else celebrateSmallWin();
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : '';
      if (text.includes('already completed')) {
        // Played on another tab or device. Just refresh.
        await loadProgress();
        setResult((r) => (r ? { ...r, save: 'saved' } : r));
        return;
      }
      console.error('Error completing challenge:', error);
      setResult((r) => (r ? { ...r, save: 'error' } : r));
    }
  };

  const handleFinish = (game: GameResult) => {
    if (!playing || !progress) return;
    const practice = playing.practice;
    setResult({
      gameId: playing.gameId,
      game,
      practice,
      save: practice ? 'saved' : 'saving',
      xp: null,
      breakdown: null,
      newBadges: [],
      streak: null,
    });
    setPlaying(null);
    if (!practice) saveResult(playing.gameId, game, progress);
    else if (!prefersReducedMotion()) celebrateSmallWin();
  };

  const handleReminderChange = async (frequency: ChallengeProgress['notificationFrequency']) => {
    if (!progress) return;
    const previous = progress.notificationFrequency;
    setProgress({ ...progress, notificationFrequency: frequency });
    try {
      await updateNotificationSettings(userId, frequency);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setProgress((p) => (p ? { ...p, notificationFrequency: previous } : p));
    }
  };

  // ---- Loading / error ---------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]" role="status">
        <div className="text-center">
          <div className="text-5xl mb-3 motion-safe:animate-bounce" aria-hidden>🧠</div>
          <p className="text-muted-foreground">Getting today's challenge ready…</p>
        </div>
      </div>
    );
  }

  if (!progress || loadFailed) {
    return (
      <div className="text-center p-8 space-y-3">
        <p className="text-foreground">We couldn't load your challenge. Check your internet and try again.</p>
        <Button onClick={loadProgress} style={{ background: PURPLE }} className="text-white">Try again</Button>
      </div>
    );
  }

  // ---- Playing -----------------------------------------------------------

  if (playing) {
    return (
      <div className="max-w-xl mx-auto">
        <Card>
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPlaying(null)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Leave game
              </button>
              <span className="text-xs rounded-full bg-muted px-3 py-1 text-muted-foreground">
                {playing.practice ? 'Practice · no XP' : "Today's challenge"}
              </span>
            </div>
            <BrainGame
              key={`${playing.gameId}-${playing.seed}`}
              gameId={playing.gameId}
              seed={playing.seed}
              young={young}
              onFinish={handleFinish}
              onSkip={
                playing.practice
                  ? undefined
                  : () => {
                      setSwappedGame('pattern');
                      setPlaying({ gameId: 'pattern', seed: quest.seed, practice: false });
                    }
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- Result ------------------------------------------------------------

  if (result) {
    const meta = GAME_META[result.gameId];
    const stars = result.game.score >= 0.9 ? 3 : result.game.score >= 0.6 ? 2 : 1;
    const tomorrow = GAME_META[tomorrowGame];
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-6xl" aria-hidden>🎉</div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {result.practice ? 'Nice practice round!' : 'Challenge complete!'}
              </h2>
              <p className="text-muted-foreground">{meta.title}: {result.game.summary}</p>
            </div>
            <div className="text-3xl" role="img" aria-label={`${stars} out of 3 stars`}>
              {[1, 2, 3].map((n) => (
                <span key={n} className={n <= stars ? '' : 'opacity-25'}>⭐</span>
              ))}
            </div>

            {result.practice ? (
              <p className="text-sm text-muted-foreground">Practice rounds are just for fun. They don't give XP.</p>
            ) : result.save === 'saving' ? (
              <p className="text-sm text-muted-foreground" role="status">Saving your reward…</p>
            ) : result.save === 'error' ? (
              <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950 p-3 text-sm text-red-800 dark:text-red-200 space-y-2" role="alert">
                <p>We couldn't save your reward yet. Your game is not lost.</p>
                <Button size="sm" onClick={() => saveResult(result.gameId, result.game, progress)}>Try saving again</Button>
              </div>
            ) : (
              <div className="rounded-xl p-4" style={{ background: `${PURPLE}14` }}>
                <p className="text-3xl font-extrabold" style={{ color: PURPLE }}>+{result.xp} XP</p>
                {result.breakdown && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Play {result.breakdown.base}
                    {result.breakdown.score > 0 && ` · Score +${result.breakdown.score}`}
                    {result.breakdown.streak > 0 && ` · Streak +${result.breakdown.streak}`}
                  </p>
                )}
                {result.streak !== null && (
                  <p className="mt-2 text-sm font-semibold text-orange-700 dark:text-orange-400">
                    <Flame className="inline h-4 w-4 mr-1" aria-hidden />
                    {result.streak}-day streak. Come back tomorrow to keep it going!
                  </p>
                )}
              </div>
            )}

            {result.newBadges.length > 0 && (
              <div className="rounded-xl border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950 p-4 space-y-2">
                <p className="font-bold text-yellow-900 dark:text-yellow-100">New badge unlocked!</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {result.newBadges.map((name) => {
                    const b = BADGE_SHELF.find((x) => x.name === name);
                    return (
                      <div key={name} className="text-center">
                        <div className="text-4xl" aria-hidden>{b?.emoji ?? '🎖️'}</div>
                        <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-100">{name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-xl bg-muted/60 p-4 text-left text-sm">
              <p className="font-semibold text-foreground">Use it in real life</p>
              <p className="text-muted-foreground mt-1">
                <span className="font-medium" style={{ color: PURPLE }}>{meta.skill}:</span> {meta.useIt}
              </p>
            </div>

            {!result.practice && (
              <p className="text-sm text-muted-foreground">
                Tomorrow: {tomorrow.emoji} <span className="font-semibold">{tomorrow.title}</span>
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button className="flex-1 text-white" style={{ background: PURPLE }} onClick={() => setResult(null)}>
                Done
              </Button>
              <Button variant="outline" className="flex-1" onClick={startPractice}>
                Play a practice round
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- Home --------------------------------------------------------------

  const meta = GAME_META[todaysGame];
  const streak = liveStreak(progress, today);
  const week = weekKeys(today);
  const nextGoal = STREAK_GOALS.find((g) => g.days > streak);
  const firstName = userName?.split(' ')[0] || 'there';
  const tomorrow = GAME_META[tomorrowGame];
  const dateLabel = new Date(`${today}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });

  let streakNote: string;
  if (doneToday) streakNote = 'Streak safe for today. See you tomorrow!';
  else if (streak > 0) streakNote = `Play today to keep your ${streak}-day streak alive!`;
  else if (progress.longestStreak > 0) streakNote = `Start a new streak today. Your best is ${progress.longestStreak} days.`;
  else streakNote = 'Play today to start your streak.';

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Today's game */}
      <section className="relative overflow-hidden rounded-2xl p-5 sm:p-7 text-white" style={{ background: PURPLE }}>
        <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-40" style={{ background: BLUE }} />
        <div className="relative space-y-4">
          <p className="text-sm text-white/85">Hi {firstName}! Today's Challenge · {dateLabel}</p>
          <div className="flex items-center gap-4">
            <div className="text-6xl" aria-hidden>{meta.emoji}</div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">{meta.title}</h2>
              <p className="text-white/90">{meta.tagline}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full bg-white/20 px-3 py-1">⏱ About 2 minutes</span>
            <span className="rounded-full bg-white/20 px-3 py-1">⭐ 20+ XP</span>
            <span className="rounded-full bg-white/20 px-3 py-1">🧠 {meta.skill}</span>
          </div>

          {doneToday ? (
            <div className="rounded-xl bg-white/15 p-4 space-y-3">
              <p className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" aria-hidden /> You played today. Nice work!
              </p>
              <p className="text-sm text-white/90">Tomorrow: {tomorrow.emoji} {tomorrow.title}</p>
              <Button variant="secondary" onClick={startPractice}>Play a practice round (no XP)</Button>
            </div>
          ) : (
            <Button size="lg" variant="secondary" className="w-full sm:w-auto font-bold" onClick={startToday}>
              Play now
            </Button>
          )}
          <p className="text-xs text-white/80">
            Just for fun! Games like this don't change your Cognitive Profile. Your assessments do that.
          </p>
        </div>
      </section>

      {/* Streak */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950">
              <Flame className="h-7 w-7 text-orange-600" aria-hidden />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-foreground leading-none">
                {streak} <span className="text-base font-medium text-muted-foreground">day streak</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">{streakNote}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-bold text-foreground flex items-center gap-1 justify-end">
                <Star className="h-4 w-4 text-yellow-500" aria-hidden /> {progress.totalPoints}
              </p>
              <p className="text-xs text-muted-foreground">total XP</p>
            </div>
          </div>

          <ol className="grid grid-cols-7 gap-1.5" aria-label="This week">
            {week.map((key, i) => {
              const done = progress.completedDays.includes(key);
              const isToday = key === today;
              const future = key > today;
              return (
                <li key={key} className="text-center">
                  <div
                    role="img"
                    aria-label={`${WEEKDAY_NAMES[i]}: ${done ? 'played' : future ? 'coming up' : isToday ? 'today' : 'missed'}`}
                    className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold ${
                      done ? 'text-white border-transparent' : isToday ? 'border-[#6B4C9A] text-[#6B4C9A]' : 'border-muted text-muted-foreground'
                    }`}
                    style={done ? { background: GREEN } : undefined}
                  >
                    {done ? '✓' : ''}
                  </div>
                  <p className={`mt-1 text-xs ${isToday ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                    {WEEKDAY_LETTERS[i]}
                  </p>
                </li>
              );
            })}
          </ol>

          {nextGoal && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">
                  Next reward: <span className="font-semibold">{nextGoal.badge}</span>
                </span>
                <span className="text-muted-foreground">{streak}/{nextGoal.days} days</span>
              </div>
              <Progress value={Math.min(100, (streak / nextGoal.days) * 100)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {nextGoal.days - streak} more {nextGoal.days - streak === 1 ? 'day' : 'days'} in a row.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <h3 className="font-semibold text-foreground">Badges to collect</h3>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BADGE_SHELF.map((b) => {
              const got = b.earned(progress);
              return (
                <li
                  key={b.name}
                  className={`rounded-xl border-2 p-3 text-center ${got ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950' : 'border-dashed border-muted'}`}
                >
                  <div className={`text-3xl ${got ? '' : 'grayscale opacity-40'}`} aria-hidden>
                    {got ? b.emoji : <Lock className="h-7 w-7 mx-auto text-muted-foreground" />}
                  </div>
                  <p className={`text-sm font-semibold mt-1 ${got ? 'text-yellow-900 dark:text-yellow-100' : 'text-foreground'}`}>{b.name}</p>
                  <p className="text-xs text-muted-foreground">{got ? 'Unlocked!' : b.how}</p>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Reminders */}
      <div className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Bell className="h-4 w-4 text-muted-foreground" aria-hidden />
          <label htmlFor="challenge-reminder">Reminders</label>
        </div>
        <Select
          value={progress.notificationFrequency}
          onValueChange={(value) => handleReminderChange(value as ChallengeProgress['notificationFrequency'])}
        >
          <SelectTrigger id="challenge-reminder" className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Every day</SelectItem>
            <SelectItem value="weekly">Every week</SelectItem>
            <SelectItem value="monthly">Every month</SelectItem>
            <SelectItem value="off">Off</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
