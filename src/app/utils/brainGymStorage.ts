import { DailyChallengeResults } from '../components/BrainGym';

const BRAIN_GYM_KEY = 'jotminds_brain_gym';

export interface BrainGymProgress {
  userId: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
  completedChallenges: DailyChallengeResults[];
  categoryStats: {
    learning: { completed: number; avgScore: number; totalPoints: number };
    thinking: { completed: number; avgScore: number; totalPoints: number };
    decision: { completed: number; avgScore: number; totalPoints: number };
  };
}

export function getBrainGymProgress(userId: string): BrainGymProgress {
  const stored = localStorage.getItem(`${BRAIN_GYM_KEY}_${userId}`);
  
  if (!stored) {
    return {
      userId,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: '',
      completedChallenges: [],
      categoryStats: {
        learning: { completed: 0, avgScore: 0, totalPoints: 0 },
        thinking: { completed: 0, avgScore: 0, totalPoints: 0 },
        decision: { completed: 0, avgScore: 0, totalPoints: 0 },
      },
    };
  }
  
  return JSON.parse(stored);
}

export function saveBrainGymResults(userId: string, results: DailyChallengeResults): BrainGymProgress {
  const progress = getBrainGymProgress(userId);
  
  // Update streak
  const today = new Date().toISOString().split('T')[0];
  const lastDate = progress.lastCompletedDate ? new Date(progress.lastCompletedDate).toISOString().split('T')[0] : '';
  
  if (lastDate === today) {
    // Already completed today, just update stats
    results.streak = progress.currentStreak;
  } else {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (lastDate === yesterday) {
      // Continuing streak
      progress.currentStreak += 1;
      progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
    } else if (lastDate === '') {
      // First challenge
      progress.currentStreak = 1;
      progress.longestStreak = 1;
    } else {
      // Streak broken, start over
      progress.currentStreak = 1;
    }
    
    results.streak = progress.currentStreak;
    progress.lastCompletedDate = today;
  }
  
  // Update points
  progress.totalPoints += results.totalPoints;
  
  // Update category stats
  const categoryStats = progress.categoryStats[results.category];
  const previousTotal = categoryStats.avgScore * categoryStats.completed;
  categoryStats.completed += 1;
  categoryStats.avgScore = Math.round((previousTotal + results.score) / categoryStats.completed);
  categoryStats.totalPoints += results.totalPoints;
  
  // Add to completed challenges
  progress.completedChallenges.push(results);
  
  // Keep only last 30 days of challenges
  if (progress.completedChallenges.length > 90) {
    progress.completedChallenges = progress.completedChallenges.slice(-90);
  }
  
  // Save to localStorage
  localStorage.setItem(`${BRAIN_GYM_KEY}_${userId}`, JSON.stringify(progress));
  
  return progress;
}

export function hasCompletedTodayChallenge(userId: string, category: 'learning' | 'thinking' | 'decision'): boolean {
  const progress = getBrainGymProgress(userId);
  const today = new Date().toISOString().split('T')[0];
  
  return progress.completedChallenges.some(
    challenge => challenge.category === category && challenge.completedAt.startsWith(today)
  );
}

export function getTodayProgress(userId: string): {
  learning: boolean;
  thinking: boolean;
  decision: boolean;
  total: number;
} {
  const progress = getBrainGymProgress(userId);
  const today = new Date().toISOString().split('T')[0];
  
  const todayChallenges = progress.completedChallenges.filter(
    c => c.completedAt.startsWith(today)
  );
  
  return {
    learning: todayChallenges.some(c => c.category === 'learning'),
    thinking: todayChallenges.some(c => c.category === 'thinking'),
    decision: todayChallenges.some(c => c.category === 'decision'),
    total: todayChallenges.length,
  };
}

export function getWeeklyActivity(userId: string): { date: string; points: number; completed: number }[] {
  const progress = getBrainGymProgress(userId);
  const weeklyData: { [key: string]: { points: number; completed: number } } = {};
  
  // Get last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    weeklyData[date] = { points: 0, completed: 0 };
  }
  
  // Fill in actual data
  progress.completedChallenges.forEach(challenge => {
    const date = challenge.completedAt.split('T')[0];
    if (weeklyData[date]) {
      weeklyData[date].points += challenge.totalPoints;
      weeklyData[date].completed += 1;
    }
  });
  
  return Object.entries(weeklyData).map(([date, data]) => ({
    date,
    points: data.points,
    completed: data.completed,
  }));
}

export function getCategoryInsights(userId: string): {
  strongest: 'learning' | 'thinking' | 'decision';
  needsWork: 'learning' | 'thinking' | 'decision';
  insights: string[];
} {
  const progress = getBrainGymProgress(userId);
  const stats = progress.categoryStats;
  
  // Find strongest and weakest
  const categories = Object.entries(stats) as [string, typeof stats.learning][];
  const sortedByScore = categories.sort((a, b) => b[1].avgScore - a[1].avgScore);
  
  const strongest = sortedByScore[0][0] as 'learning' | 'thinking' | 'decision';
  const needsWork = sortedByScore[sortedByScore.length - 1][0] as 'learning' | 'thinking' | 'decision';
  
  const insights: string[] = [];
  
  // Generate insights
  if (stats[strongest].avgScore >= 80) {
    insights.push(`You're excelling in ${strongest} challenges! 🌟`);
  }
  
  if (stats[needsWork].completed > 0 && stats[needsWork].avgScore < 60) {
    insights.push(`Practice more ${needsWork} challenges to improve 💪`);
  }
  
  if (progress.currentStreak >= 7) {
    insights.push(`Amazing ${progress.currentStreak}-day streak! You're building serious mental strength! 🔥`);
  } else if (progress.currentStreak >= 3) {
    insights.push(`${progress.currentStreak} days in a row! Keep it up! 🚀`);
  }
  
  if (progress.totalPoints >= 1000) {
    insights.push(`You've earned ${progress.totalPoints} points! You're a Brain Gym champion! 🏆`);
  }
  
  const totalCompleted = categories.reduce((sum, [_, data]) => sum + data.completed, 0);
  if (totalCompleted >= 30) {
    insights.push(`${totalCompleted} challenges completed! Your cognitive skills are leveling up! 📈`);
  }
  
  return { strongest, needsWork, insights };
}
