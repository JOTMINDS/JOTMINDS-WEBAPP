import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Trophy, 
  Award, 
  Flame, 
  Zap, 
  Target, 
  Shield, 
  Lock,
  Sparkles,
  TrendingUp,
  Gift
} from 'lucide-react';
import {
  getGamificationProfile,
  getCurrentLevel,
  getXPProgress,
  LEVELS,
  THEMES,
  BADGE_LIBRARY,
  type Badge as BadgeType,
  type WeeklyChallenge
} from '../utils/gamification';

interface GamificationDashboardProps {
  userId: string;
}

export function GamificationDashboard({ userId }: GamificationDashboardProps) {
  const [profile, setProfile] = useState(() => getGamificationProfile(userId));
  const currentLevel = getCurrentLevel(profile.xp);
  const xpProgress = getXPProgress(profile.xp);

  // Refresh profile periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setProfile(getGamificationProfile(userId));
    }, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  // Rarity colors
  const rarityColors = {
    common: 'bg-gray-100 text-gray-800 border-gray-300',
    rare: 'bg-blue-100 text-blue-800 border-blue-300',
    epic: 'bg-purple-100 text-purple-800 border-purple-300',
    legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  };

  return (
    <div className="space-y-6">
      {/* Level & XP Card */}
      <Card className="border-2 bg-white" style={{ borderColor: currentLevel.color }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-6 w-6" style={{ color: currentLevel.color }} />
                Level {profile.level}: {currentLevel.title}
              </CardTitle>
              <CardDescription className="mt-1">
                {profile.xp} Total XP
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: currentLevel.color }}>
                {profile.level}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress to Level {profile.level + 1}</span>
              <span className="font-semibold">
                {xpProgress.current} / {xpProgress.needed} XP
              </span>
            </div>
            <Progress value={xpProgress.percentage} className="h-3" style={{ 
              backgroundColor: `${currentLevel.color}20` 
            }} />
          </div>
          
          {/* Next Level Rewards */}
          {profile.level < LEVELS.length && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Next Level Rewards:
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {LEVELS[profile.level]?.rewards.map((reward, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    {reward}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Challenges */}
      <Card className="border-2 border-[#5B7DB1] bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#5B7DB1]" />
            Daily Challenges
          </CardTitle>
          <CardDescription>
            Fresh challenges every day!
            <br />
            <span className="text-xs text-muted-foreground">
              Resets at midnight
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.dailyChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                challenge.completed
                  ? 'bg-green-50 border-green-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{challenge.icon}</div>
                  <div>
                    <h4 className="font-semibold">{challenge.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {challenge.description}
                    </p>
                  </div>
                </div>
                {challenge.completed ? (
                  <Badge className="bg-green-500 text-white">
                    ✓ Complete
                  </Badge>
                ) : (
                  <Badge variant="outline" className="font-semibold border-[#5B7DB1] text-[#5B7DB1]">
                    +{challenge.reward} XP
                  </Badge>
                )}
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">
                    {Math.min(challenge.progress, challenge.target)} / {challenge.target}
                  </span>
                </div>
                <Progress
                  value={(challenge.progress / challenge.target) * 100}
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weekly Challenges */}
      <Card className="border-2 border-[#6B4C9A] bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#6B4C9A]" />
            Weekly Challenges
          </CardTitle>
          <CardDescription>
            Complete challenges to earn bonus XP!
            <br />
            <span className="text-xs text-muted-foreground">
              Resets every Monday
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.weekChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                challenge.completed
                  ? 'bg-green-50 border-green-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{challenge.icon}</div>
                  <div>
                    <h4 className="font-semibold">{challenge.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {challenge.description}
                    </p>
                  </div>
                </div>
                {challenge.completed ? (
                  <Badge className="bg-green-500 text-white">
                    ✓ Complete
                  </Badge>
                ) : (
                  <Badge variant="outline" className="font-semibold border-[#6B4C9A] text-[#6B4C9A]">
                    +{challenge.reward} XP
                  </Badge>
                )}
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">
                    {Math.min(challenge.progress, challenge.target)} / {challenge.target}
                  </span>
                </div>
                <Progress
                  value={(challenge.progress / challenge.target) * 100}
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Badges Collection */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Badge Collection
              </CardTitle>
              <CardDescription>
                {profile.badges.length} of {BADGE_LIBRARY.length} badges earned
              </CardDescription>
            </div>
            <div className="text-2xl font-bold text-yellow-500">
              {Math.round((profile.badges.length / BADGE_LIBRARY.length) * 100)}%
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {BADGE_LIBRARY.map((badge) => {
              const earned = profile.badges.find((b) => b.id === badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    earned
                      ? rarityColors[badge.rarity]
                      : 'bg-gray-50 border-gray-200 opacity-50'
                  }`}
                >
                  <div className="text-4xl mb-2">
                    {earned ? badge.icon : '🔒'}
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {badge.description}
                  </p>
                  {earned && (
                    <Badge variant="secondary" className="mt-2 text-xs capitalize">
                      {badge.rarity}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Unlockable Themes */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Unlockable Themes
          </CardTitle>
          <CardDescription>
            Level up to unlock new dashboard themes!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(THEMES).map(([key, theme]) => {
              const unlocked = profile.themesUnlocked.includes(key);
              const canUnlock = profile.level >= theme.unlockLevel;
              
              return (
                <div
                  key={key}
                  className={`p-4 rounded-lg border-2 text-center ${
                    unlocked
                      ? 'border-green-500 bg-green-50'
                      : canUnlock
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 bg-gray-50 opacity-50'
                  }`}
                >
                  <div
                    className={`h-16 w-full rounded-lg mb-3 bg-gradient-to-br ${theme.gradient} border border-gray-200`}
                  ></div>
                  <h4 className="font-semibold text-sm mb-1">{theme.name}</h4>
                  {unlocked ? (
                    <Badge className="bg-green-500 text-white text-xs">
                      ✓ Unlocked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Level {theme.unlockLevel}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Streak Insurance */}
      <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            XP Streak Insurance
          </CardTitle>
          <CardDescription>
            Protect your streak! Use insurance if you miss a day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-orange-200">
            <div>
              <div className="text-3xl font-bold text-orange-500">
                {profile.streakInsurance.available}
              </div>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-gray-600">
                {profile.streakInsurance.total}
              </div>
              <p className="text-sm text-muted-foreground">Total Earned</p>
            </div>
          </div>
          <div className="mt-4 bg-orange-100 rounded-lg p-3 text-sm border border-orange-200">
            <p className="font-semibold flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4" />
              How it works:
            </p>
            <ul className="text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Earn insurance by leveling up</li>
              <li>Use it if you miss a day to keep your streak</li>
              <li>Students love this feature!</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Your Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">
                {profile.totalAssessments}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Assessments
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="text-3xl font-bold text-purple-600">
                {profile.totalBrainGymChallenges}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Brain Gym
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <div className="text-3xl font-bold text-orange-600">
                {profile.longestStreak}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Longest Streak
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-600">
                {profile.badges.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Badges
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
              <div className="text-3xl font-bold text-indigo-600">
                {profile.dailyChallengesCompleted || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Daily Wins
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg border border-violet-200">
              <div className="text-3xl font-bold text-violet-600">
                {profile.weeklyChallengesCompleted || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Weekly Wins
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}