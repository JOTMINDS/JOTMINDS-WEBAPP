import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Trophy, 
  Flame, 
  Star, 
  Award, 
  Target, 
  Zap, 
  Shield,
  Crown,
  Sparkles,
  Lock,
  Unlock
} from 'lucide-react';
import { getXPProgress, getCurrentLevel } from '../../utils/gamification';
import { formatDate } from '../../utils/dateFormat';

export interface GamificationData {
  totalXP: number;
  level: number;
  streak: number;
  badges: Badge[];
  weeklyChallenge: WeeklyChallenge;
  unlockedThemes: string[];
  hasStreakInsurance: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  xpReward: number;
  endsAt: string;
}

interface GamificationSystemProps {
  data: GamificationData;
  onActivateStreakInsurance?: () => void;
  onSelectTheme?: (theme: string) => void;
}

export const GamificationSystem: React.FC<GamificationSystemProps> = ({
  data,
  onActivateStreakInsurance,
  onSelectTheme
}) => {
  // Use the proper leveling system from gamification utilities
  const { current, needed, percentage } = getXPProgress(data.totalXP);
  const currentLevelInfo = getCurrentLevel(data.totalXP);
  const xpForNextLevel = needed;
  const xpProgress = percentage;
  
  // Calculate actual level from XP (don't trust stored level)
  const actualLevel = currentLevelInfo.level;

  const availableThemes = [
    { id: 'ocean', name: 'Ocean Blue', requiredLevel: 1, color: 'from-blue-400 to-cyan-500' },
    { id: 'sunset', name: 'Sunset Orange', requiredLevel: 3, color: 'from-orange-400 to-pink-500' },
    { id: 'forest', name: 'Forest Green', requiredLevel: 5, color: 'from-green-400 to-emerald-500' },
    { id: 'galaxy', name: 'Galaxy Purple', requiredLevel: 8, color: 'from-purple-400 to-indigo-500' },
    { id: 'fire', name: 'Fire Red', requiredLevel: 10, color: 'from-red-400 to-orange-500' }
  ];

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy': return <Trophy className="h-6 w-6" />;
      case 'star': return <Star className="h-6 w-6" />;
      case 'award': return <Award className="h-6 w-6" />;
      case 'target': return <Target className="h-6 w-6" />;
      case 'crown': return <Crown className="h-6 w-6" />;
      default: return <Sparkles className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* XP & Level Card */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Level {actualLevel}</CardTitle>
                <CardDescription>{data.totalXP} XP Total</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-bold text-lg">{data.streak}</span>
              <span className="text-sm text-gray-600">day streak</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress to Level {actualLevel + 1}</span>
              <span className="font-semibold">{current}/{needed} XP</span>
            </div>
            <Progress value={xpProgress} className="h-3" />
            <div className="text-xs text-gray-500 text-center">
              {currentLevelInfo.title} • {Math.round(percentage)}% complete
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Challenge */}
      <Card className="border-2 border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan-600" />
            Weekly Challenge
          </CardTitle>
          <CardDescription>{data.weeklyChallenge.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700">{data.weeklyChallenge.description}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold">
                {data.weeklyChallenge.progress}/{data.weeklyChallenge.maxProgress}
              </span>
            </div>
            <Progress 
              value={(data.weeklyChallenge.progress / data.weeklyChallenge.maxProgress) * 100} 
              className="h-2"
            />
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-gray-600">Reward</span>
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">
              <Zap className="h-3 w-3 mr-1" />
              +{data.weeklyChallenge.xpReward} XP
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Ends {formatDate(data.weeklyChallenge.endsAt)}
          </p>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            Your Badges
          </CardTitle>
          <CardDescription>Unlock badges by completing challenges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {data.badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border-2 text-center space-y-2 ${
                  badge.unlockedAt
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div
                  className={`h-12 w-12 mx-auto rounded-full flex items-center justify-center ${
                    badge.unlockedAt
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {getBadgeIcon(badge.icon)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{badge.name}</p>
                  {badge.level > 1 && (
                    <Badge variant="outline" className="text-xs mt-1">
                      Level {badge.level}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600">{badge.description}</p>
                {!badge.unlockedAt && (
                  <div className="space-y-1">
                    <Progress value={(badge.progress / badge.maxProgress) * 100} className="h-1" />
                    <p className="text-xs text-gray-500">
                      {badge.progress}/{badge.maxProgress}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Streak Insurance */}
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-600" />
            Streak Insurance
          </CardTitle>
          <CardDescription>Protect your streak from missing a day</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              data.hasStreakInsurance ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {data.hasStreakInsurance ? (
                <Shield className="h-5 w-5 text-green-600" />
              ) : (
                <Lock className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {data.hasStreakInsurance ? 'Insurance Active' : 'No Insurance'}
              </p>
              <p className="text-xs text-gray-600">
                {data.hasStreakInsurance 
                  ? 'Your streak is protected for 1 missed day'
                  : 'Earn insurance to protect your streak'}
              </p>
            </div>
          </div>
          {!data.hasStreakInsurance && (
            <Button
              onClick={onActivateStreakInsurance}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              Earn Streak Insurance (50 XP)
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Unlockable Themes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Unlockable Themes
          </CardTitle>
          <CardDescription>Customize your dashboard with level rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableThemes.map((theme) => {
              const isUnlocked = data.level >= theme.requiredLevel;
              const isSelected = data.unlockedThemes.includes(theme.id);

              return (
                <div
                  key={theme.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isUnlocked
                      ? 'border-purple-200 hover:border-purple-400 cursor-pointer'
                      : 'border-gray-200 opacity-50'
                  } ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
                  onClick={() => isUnlocked && onSelectTheme?.(theme.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${theme.color}`} />
                    <div className="flex-1">
                      <p className="font-semibold text-sm flex items-center gap-2">
                        {theme.name}
                        {isSelected && <Badge className="text-xs">Active</Badge>}
                      </p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        {isUnlocked ? (
                          <>
                            <Unlock className="h-3 w-3" />
                            Unlocked
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3" />
                            Level {theme.requiredLevel} required
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
