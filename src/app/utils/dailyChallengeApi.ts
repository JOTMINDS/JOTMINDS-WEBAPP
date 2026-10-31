import { projectId, publicAnonKey } from './supabase/info';
import { createClient } from './supabase/client';
import { getAuthToken } from './api';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847`;

// These routes belong to one student, so they need that student's own session token.
// The public key is refused by the server.
async function authHeaders(): Promise<Record<string, string>> {
  let token: string | null = null;
  try {
    token = (await (createClient() as any).auth.getSession())?.data?.session?.access_token || null;
  } catch {
    token = null;
  }
  return {
    'Authorization': `Bearer ${token || getAuthToken() || publicAnonKey}`,
    'Content-Type': 'application/json',
  };
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

export async function getDailyChallengeProgress(userId: string): Promise<{ progress: ChallengeProgress }> {
  try {
    const response = await fetch(`${API_BASE_URL}/daily-challenge/progress/${userId}`, {
      method: 'GET',
      headers: await authHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get daily challenge progress: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting daily challenge progress:', error);
    throw error;
  }
}

export async function completeDailyChallenge(
  userId: string,
  challengeId: string,
  response: any
): Promise<{
  success: boolean;
  pointsEarned: number;
  newBadges: string[];
  updatedProgress: ChallengeProgress;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/daily-challenge/complete`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({
        userId,
        challengeId,
        response,
        completedAt: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to complete daily challenge: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error completing daily challenge:', error);
    throw error;
  }
}

export async function updateNotificationSettings(
  userId: string,
  frequency: 'daily' | 'weekly' | 'monthly' | 'off'
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/daily-challenge/notifications`, {
      method: 'PUT',
      headers: await authHeaders(),
      body: JSON.stringify({
        userId,
        frequency,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update notification settings: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
}

export async function getChallengeSettings(userId: string): Promise<{
  notificationFrequency: 'daily' | 'weekly' | 'monthly' | 'off';
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/daily-challenge/settings/${userId}`, {
      method: 'GET',
      headers: await authHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get challenge settings: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting challenge settings:', error);
    throw error;
  }
}
