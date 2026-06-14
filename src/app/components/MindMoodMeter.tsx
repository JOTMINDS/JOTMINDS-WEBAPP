import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sparkles, TrendingUp, Cloud, Sun, CloudRain } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface MindMoodMeterProps {
  userId: string;
  userName: string;
  onMoodSelected?: (mood: string) => void;
  showAsWidget?: boolean;
}

interface MoodOption {
  emoji: string;
  mood: string;
  description: string;
  response: string;
  color: string;
  bgColor: string;
}

const moodOptions: MoodOption[] = [
  {
    emoji: '😄',
    mood: 'Happy',
    description: "I'm excited and ready to think!",
    response: "Awesome energy! Let's see what your brain can do today!",
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-300'
  },
  {
    emoji: '😐',
    mood: 'Okay',
    description: "I feel calm and relaxed.",
    response: "Cool and calm — perfect for smart thinking.",
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-300'
  },
  {
    emoji: '😕',
    mood: 'Tired',
    description: "I'm not full of energy yet.",
    response: "Let's warm up with something easy — your brain will wake up soon!",
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-300'
  },
  {
    emoji: '😠',
    mood: 'Frustrated',
    description: "I'm upset or something didn't go my way.",
    response: "Deep breath... you've got this! Let's turn that energy into great ideas.",
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-300'
  },
  {
    emoji: '😢',
    mood: 'Sad',
    description: "I'm feeling low today.",
    response: "Hey buddy, even small steps make big smiles. Ready to try something gentle?",
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-300'
  }
];

export function MindMoodMeter({ userId, userName, onMoodSelected, showAsWidget = false }: MindMoodMeterProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showResponse, setShowResponse] = useState(false);
  const [moodHistory, setMoodHistory] = useState<Array<{ mood: string; date: string }>>([]);
  const [moodStats, setMoodStats] = useState<Record<string, number>>({});
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    loadMoodHistory();
  }, [userId]);

  const loadMoodHistory = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fc8eb847/get-mood-history?userId=${userId}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.history) {
          setMoodHistory(data.history);
          calculateStats(data.history);
          setCurrentStreak(data.currentStreak || 0);
        }
      }
    } catch (error) {
      console.error('Error loading mood history:', error);
    }
  };

  const calculateStats = (history: Array<{ mood: string; date: string }>) => {
    const stats: Record<string, number> = {};
    history.forEach(entry => {
      stats[entry.mood] = (stats[entry.mood] || 0) + 1;
    });
    setMoodStats(stats);
  };

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    setShowResponse(true);

    // Save mood
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fc8eb847/save-mood`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            userId,
            mood,
            timestamp: new Date().toISOString()
          })
        }
      );

      // Reload history to update stats
      loadMoodHistory();
    } catch (error) {
      console.error('Error saving mood:', error);
    }

    if (onMoodSelected) {
      onMoodSelected(mood);
    }
  };

  const getMoodTrendIcon = () => {
    const recentMoods = moodHistory.slice(0, 7);
    const positiveCount = recentMoods.filter(m => m.mood === 'Happy' || m.mood === 'Okay').length;
    
    if (positiveCount >= 5) return { icon: Sun, color: 'text-yellow-500', label: 'Sunny' };
    if (positiveCount >= 3) return { icon: Cloud, color: 'text-blue-400', label: 'Cloudy' };
    return { icon: CloudRain, color: 'text-gray-500', label: 'Rainy' };
  };

  const selectedMoodOption = moodOptions.find(m => m.mood === selectedMood);
  const trendInfo = getMoodTrendIcon();
  const TrendIcon = trendInfo.icon;

  if (showAsWidget) {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            🌞 How are you feeling today?
          </CardTitle>
          <CardDescription>
            Tap how you feel before you start thinking!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map((option) => (
              <Button
                key={option.mood}
                variant="outline"
                onClick={() => handleMoodSelect(option.mood)}
                className={`h-20 flex flex-col items-center justify-center gap-1 ${
                  selectedMood === option.mood ? option.bgColor : ''
                }`}
              >
                <span className="text-3xl">{option.emoji}</span>
                <span className="text-xs">{option.mood}</span>
              </Button>
            ))}
          </div>

          {showResponse && selectedMoodOption && (
            <div className={`p-4 rounded-lg border-2 ${selectedMoodOption.bgColor} animate-in fade-in slide-in-from-bottom-4`}>
              <p className={`text-lg text-center ${selectedMoodOption.color}`}>
                {selectedMoodOption.response}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Check-in Streak</p>
                <p className="text-3xl">⭐ {currentStreak} days</p>
              </div>
              <Sparkles className="h-12 w-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mood Trend</p>
                <p className="text-xl">{trendInfo.label}</p>
              </div>
              <TrendIcon className={`h-12 w-12 ${trendInfo.color}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Check-ins</p>
                <p className="text-3xl">{moodHistory.length}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Mood Check-in */}
      <Card className="border-4 border-purple-300 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="text-center">
          <div className="text-5xl mb-3">🌞</div>
          <CardTitle className="text-3xl">Mind-Mood Meter</CardTitle>
          <CardDescription className="text-lg">
            Tap how you feel before you start thinking!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {moodOptions.map((option) => (
              <div
                key={option.mood}
                className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 ${
                  selectedMood === option.mood
                    ? option.bgColor + ' shadow-lg'
                    : 'bg-white border-gray-200 hover:border-purple-300'
                }`}
                onClick={() => handleMoodSelect(option.mood)}
              >
                <span className="text-5xl">{option.emoji}</span>
                <div className="flex-1">
                  <p className="text-xl mb-1"><strong>{option.mood}</strong></p>
                  <p className="text-base text-gray-600">{option.description}</p>
                </div>
                {selectedMood === option.mood && (
                  <Badge className="bg-purple-500 text-white text-base px-3 py-1">
                    Selected
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {showResponse && selectedMoodOption && (
            <div className={`p-6 rounded-lg border-2 ${selectedMoodOption.bgColor} animate-in fade-in slide-in-from-bottom-4`}>
              <div className="text-center space-y-3">
                <p className="text-2xl">{selectedMoodOption.emoji}</p>
                <p className={`text-xl ${selectedMoodOption.color}`}>
                  {selectedMoodOption.response}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mood Stats */}
      {Object.keys(moodStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-purple-500" />
              Your Mood Pattern
            </CardTitle>
            <CardDescription>
              Here's how you've been feeling lately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moodOptions.map((option) => {
                const count = moodStats[option.mood] || 0;
                const percentage = moodHistory.length > 0 ? (count / moodHistory.length) * 100 : 0;
                
                return (
                  <div key={option.mood} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{option.emoji}</span>
                        <span className="text-base">{option.mood}</span>
                      </div>
                      <span className="text-sm text-gray-600">{count} times</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${option.bgColor.split(' ')[0].replace('bg-', 'bg-').replace('-50', '-400')} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mood Tips */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-6 w-6 text-green-500 mt-1" />
            <div>
              <p className="text-lg mb-2">
                <strong>Did you know?</strong>
              </p>
              <p className="text-base leading-relaxed">
                Checking in with your feelings helps your brain understand yourself better! When you know how you feel, you can make better choices and think more clearly. Keep checking in every day! 🌟
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
