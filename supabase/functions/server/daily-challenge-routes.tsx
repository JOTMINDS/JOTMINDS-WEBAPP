import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Helper function to get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Helper function to calculate badge awards
function calculateBadges(completedDays: string[], currentStreak: number): string[] {
  const badges: string[] = [];
  
  // First challenge badge
  if (completedDays.length === 1) {
    badges.push('First Steps');
  }
  
  // Streak badges
  if (currentStreak === 7) {
    badges.push('7-Day Warrior');
  } else if (currentStreak === 30) {
    badges.push('30-Day Champion');
  } else if (currentStreak === 100) {
    badges.push('100-Day Legend');
  }
  
  // Total completion badges
  if (completedDays.length === 10) {
    badges.push('10 Challenges Master');
  } else if (completedDays.length === 50) {
    badges.push('50 Challenges Hero');
  } else if (completedDays.length === 100) {
    badges.push('100 Challenges Titan');
  }
  
  return badges;
}

// GET /daily-challenge/progress/:userId
app.get('/progress/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const key = `daily_challenge:${userId}`;
    const progressData = await kv.get(key);

    const today = getTodayDate();

    if (!progressData) {
      // Initialize new user progress
      const initialProgress = {
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        badges: [],
        completedDays: [],
        lastCompletedDate: null,
        todayCompleted: false,
        notificationFrequency: 'daily' as const,
      };

      await kv.set(key, initialProgress);
      
      return c.json({
        success: true,
        progress: initialProgress,
      });
    }

    // Check if today is already completed
    const todayCompleted = progressData.completedDays?.includes(today) || false;

    // Update todayCompleted status
    const updatedProgress = {
      ...progressData,
      todayCompleted,
    };

    return c.json({
      success: true,
      progress: updatedProgress,
    });
  } catch (error) {
    console.error('Error getting daily challenge progress:', error);
    return c.json({ 
      error: 'Failed to get daily challenge progress', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// POST /daily-challenge/complete
app.post('/complete', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, challengeId, response, completedAt } = body;

    if (!userId || !challengeId) {
      return c.json({ error: 'User ID and Challenge ID are required' }, 400);
    }

    const key = `daily_challenge:${userId}`;
    const progressData = await kv.get(key);

    if (!progressData) {
      return c.json({ error: 'Progress data not found. Please refresh the page.' }, 404);
    }

    const today = getTodayDate();
    
    // Check if today's challenge is already completed
    if (progressData.completedDays?.includes(today)) {
      return c.json({ error: 'Today\'s challenge is already completed' }, 400);
    }

    // Determine points based on challenge type
    const pointsEarned = calculatePoints(challengeId, response);

    // Update completed days
    const completedDays = [...(progressData.completedDays || []), today];
    
    // Calculate streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];
    
    let currentStreak = 1;
    if (progressData.lastCompletedDate === yesterdayDate) {
      currentStreak = (progressData.currentStreak || 0) + 1;
    }
    
    const longestStreak = Math.max(currentStreak, progressData.longestStreak || 0);
    
    // Calculate new badges
    const existingBadges = progressData.badges || [];
    const newBadgesCandidates = calculateBadges(completedDays, currentStreak);
    const newBadges = newBadgesCandidates.filter(badge => !existingBadges.includes(badge));
    const allBadges = [...existingBadges, ...newBadges];

    // Update progress
    const updatedProgress = {
      currentStreak,
      longestStreak,
      totalPoints: (progressData.totalPoints || 0) + pointsEarned,
      badges: allBadges,
      completedDays,
      lastCompletedDate: today,
      todayCompleted: true,
      notificationFrequency: progressData.notificationFrequency || 'daily',
    };

    await kv.set(key, updatedProgress);

    // Save the challenge response for history
    const responseKey = `daily_challenge_response:${userId}:${today}`;
    await kv.set(responseKey, {
      challengeId,
      response,
      completedAt,
      pointsEarned,
    });

    return c.json({
      success: true,
      pointsEarned,
      newBadges,
      updatedProgress,
    });
  } catch (error) {
    console.error('Error completing daily challenge:', error);
    return c.json({ 
      error: 'Failed to complete daily challenge', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// PUT /daily-challenge/notifications
app.put('/notifications', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, frequency } = body;

    if (!userId || !frequency) {
      return c.json({ error: 'User ID and frequency are required' }, 400);
    }

    const validFrequencies = ['daily', 'weekly', 'monthly', 'off'];
    if (!validFrequencies.includes(frequency)) {
      return c.json({ error: 'Invalid notification frequency' }, 400);
    }

    const key = `daily_challenge:${userId}`;
    const progressData = await kv.get(key);

    if (!progressData) {
      return c.json({ error: 'Progress data not found' }, 404);
    }

    const updatedProgress = {
      ...progressData,
      notificationFrequency: frequency,
    };

    await kv.set(key, updatedProgress);

    return c.json({
      success: true,
      notificationFrequency: frequency,
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return c.json({ 
      error: 'Failed to update notification settings', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// GET /daily-challenge/settings/:userId
app.get('/settings/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const key = `daily_challenge:${userId}`;
    const progressData = await kv.get(key);

    if (!progressData) {
      return c.json({
        success: true,
        notificationFrequency: 'daily',
      });
    }

    return c.json({
      success: true,
      notificationFrequency: progressData.notificationFrequency || 'daily',
    });
  } catch (error) {
    console.error('Error getting challenge settings:', error);
    return c.json({ 
      error: 'Failed to get challenge settings', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// Helper function to calculate points based on challenge completion
function calculatePoints(challengeId: string, response: any): number {
  // Extract challenge type from ID
  if (challengeId.startsWith('questions-')) {
    return 20; // Questions challenges
  } else if (challengeId.startsWith('puzzle-')) {
    return 30; // Puzzle challenges
  } else if (challengeId.startsWith('reflection-')) {
    return 25; // Reflection challenges
  } else if (challengeId.startsWith('practical-')) {
    return 35; // Practical challenges
  }
  return 20; // Default
}

export default app;
