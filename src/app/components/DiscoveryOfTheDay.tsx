import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Lightbulb, Sparkles, Star, CheckCircle2, Trophy } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DiscoveryOfTheDayProps {
  userId: string;
  userName: string;
  showAsWidget?: boolean;
}

interface Discovery {
  id: number;
  category: string;
  tip: string;
  description: string;
  emoji: string;
  color: string;
}

const discoveries: Discovery[] = [
  { id: 1, category: 'Thinking Smart', tip: "Your brain gets stronger every time you try something new — just like muscles!", description: 'Encourages curiosity and persistence', emoji: '🧠', color: 'from-purple-500 to-indigo-500' },
  { id: 2, category: 'Talking & Sharing', tip: "Explaining your ideas to others helps you understand them better too!", description: 'Promotes verbal reasoning', emoji: '💬', color: 'from-blue-500 to-cyan-500' },
  { id: 3, category: 'Creative Mind', tip: "There's no wrong way to draw or imagine — every idea is a good start!", description: 'Builds creative confidence', emoji: '🎨', color: 'from-pink-500 to-purple-500' },
  { id: 4, category: 'Focus & Observation', tip: "When you slow down and look carefully, you see things others might miss.", description: 'Strengthens attention', emoji: '🔍', color: 'from-yellow-500 to-orange-500' },
  { id: 5, category: 'Reflection', tip: "Thinking about what went well today helps your brain plan for tomorrow.", description: 'Promotes reflection and planning', emoji: '💭', color: 'from-green-500 to-emerald-500' },
  { id: 6, category: 'Kind Thinking', tip: "Being kind makes your brain release happy chemicals!", description: 'Encourages empathy and emotional learning', emoji: '❤️', color: 'from-red-500 to-pink-500' },
  { id: 7, category: 'Growth Mindset', tip: "Even mistakes are messages — they tell your brain how to get better.", description: 'Reinforces resilience', emoji: '🌱', color: 'from-green-600 to-lime-500' },
  { id: 8, category: 'Problem Solving', tip: "Big problems get smaller when you break them into tiny steps.", description: 'Supports logical reasoning', emoji: '🧩', color: 'from-indigo-500 to-blue-500' },
  { id: 9, category: 'Practical Thinking', tip: "When you use what you learn in real life, your brain says, 'Yay, that works!'", description: 'Connects learning with real application', emoji: '🛠️', color: 'from-orange-500 to-amber-500' },
  { id: 10, category: 'Confidence Boost', tip: "Your brain is one of a kind — no one thinks exactly like you!", description: 'Builds identity and self-worth', emoji: '🌟', color: 'from-yellow-400 to-yellow-600' },
  { id: 11, category: 'Learning Power', tip: "When you practice something every day, it becomes easier and easier!", description: 'Builds discipline and habit formation', emoji: '📚', color: 'from-blue-600 to-purple-500' },
  { id: 12, category: 'Curiosity', tip: "Asking questions is how smart people learn — never stop wondering!", description: 'Encourages curiosity', emoji: '❓', color: 'from-cyan-500 to-teal-500' },
  { id: 13, category: 'Brain Rest', tip: "Your brain needs breaks to stay strong — play and rest are important too!", description: 'Promotes work-life balance', emoji: '😴', color: 'from-purple-400 to-pink-400' },
  { id: 14, category: 'Teamwork', tip: "Two brains working together can solve bigger puzzles than one!", description: 'Promotes collaboration', emoji: '🤝', color: 'from-green-500 to-blue-500' },
  { id: 15, category: 'Memory Magic', tip: "When you connect new things to what you already know, they stick better!", description: 'Teaches memory techniques', emoji: '🎯', color: 'from-red-500 to-orange-500' },
  { id: 16, category: 'Feelings Matter', tip: "Happy, sad, excited, or worried — all your feelings help you learn and grow.", description: 'Emotional intelligence', emoji: '😊', color: 'from-yellow-500 to-pink-500' },
  { id: 17, category: 'Body & Brain', tip: "Moving your body helps your brain think better — so jump, run, and play!", description: 'Mind-body connection', emoji: '🏃', color: 'from-orange-600 to-red-500' },
  { id: 18, category: 'Imagination Power', tip: "When you imagine doing something, your brain starts learning it!", description: 'Visualization techniques', emoji: '✨', color: 'from-purple-500 to-pink-600' },
  { id: 19, category: 'Mistakes = Learning', tip: "Every expert was once a beginner who kept trying!", description: 'Growth through practice', emoji: '🚀', color: 'from-blue-500 to-indigo-600' },
  { id: 20, category: 'Be Yourself', tip: "Your unique way of thinking is your superpower — use it!", description: 'Self-acceptance and confidence', emoji: '🦸', color: 'from-pink-500 to-purple-600' },
];

export function DiscoveryOfTheDay({ userId, userName, showAsWidget = false }: DiscoveryOfTheDayProps) {
  const [todayDiscovery, setTodayDiscovery] = useState<Discovery | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [brainSparks, setBrainSparks] = useState(0);
  const [weekProgress, setWeekProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    selectTodayDiscovery();
    loadProgress();
  }, [userId]);

  const selectTodayDiscovery = () => {
    // Use date as seed for consistent daily discovery
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = seed % discoveries.length;
    setTodayDiscovery(discoveries[index]);
  };

  const loadProgress = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/get-discovery-progress?userId=${userId}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.progress) {
          setBrainSparks(data.progress.brainSparks || 0);
          setWeekProgress(data.progress.weekProgress || 0);
          
          // Check if today's discovery was already acknowledged
          const today = new Date().toDateString();
          const lastAcknowledged = data.progress.lastAcknowledged;
          setAcknowledged(lastAcknowledged === today);
        }
      }
    } catch (error) {
      console.error('Error loading discovery progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (action: 'try' | 'got') => {
    if (acknowledged) return;

    setAcknowledged(true);
    const newSparks = brainSparks + 1;
    const newWeekProgress = weekProgress + 1;
    setBrainSparks(newSparks);
    setWeekProgress(newWeekProgress);

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847/save-discovery-progress`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            userId,
            discoveryId: todayDiscovery?.id,
            action,
            timestamp: new Date().toISOString(),
            brainSparks: newSparks,
            weekProgress: newWeekProgress
          })
        }
      );
    } catch (error) {
      console.error('Error saving discovery progress:', error);
    }
  };

  if (loading || !todayDiscovery) {
    return <div className="flex items-center justify-center p-8">Loading today's discovery...</div>;
  }

  if (showAsWidget) {
    return (
      <Card className={`border-2 border-yellow-300 bg-gradient-to-r ${todayDiscovery.color.replace('500', '50')}`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-4xl">{todayDiscovery.emoji}</span>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">💡 Today's Discovery</p>
              <p className="text-lg leading-relaxed">{todayDiscovery.tip}</p>
            </div>
          </div>
          {!acknowledged ? (
            <div className="flex gap-2">
              <Button
                onClick={() => handleAcknowledge('try')}
                size="sm"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                I'll Try It! ⚡
              </Button>
              <Button
                onClick={() => handleAcknowledge('got')}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                Got It! ❤️
              </Button>
            </div>
          ) : (
            <div className="text-center p-2 bg-green-50 border border-green-300 rounded-lg">
              <p className="text-green-700">✓ You earned a Brain Spark! ⚡</p>
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
                <p className="text-sm text-gray-600">Brain Sparks</p>
                <p className="text-3xl">⚡ {brainSparks}</p>
              </div>
              <Sparkles className="h-12 w-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-3xl">{weekProgress} / 7</p>
              </div>
              <Star className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Badge Progress</p>
                <p className="text-3xl">{weekProgress >= 7 ? '🏆' : '🎯'}</p>
              </div>
              {weekProgress >= 7 ? (
                <Trophy className="h-12 w-12 text-green-500" />
              ) : (
                <Lightbulb className="h-12 w-12 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Week Progress */}
      {weekProgress < 7 && (
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-6 w-6 text-purple-500" />
              <p className="text-lg">
                <strong>{7 - weekProgress} more discoveries</strong> to unlock your Mind Explorer Badge! 🏆
              </p>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-3 flex-1 rounded ${i < weekProgress ? 'bg-purple-500' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Discovery */}
      <Card className={`border-4 border-yellow-300 shadow-xl bg-gradient-to-br from-white to-yellow-50`}>
        <CardHeader className={`bg-gradient-to-r ${todayDiscovery.color} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-5xl">{todayDiscovery.emoji}</span>
              <div>
                <CardTitle className="text-2xl">💡 New Discovery of the Day!</CardTitle>
                <CardDescription className="text-white opacity-90 text-base">
                  {todayDiscovery.category}
                </CardDescription>
              </div>
            </div>
            {acknowledged && (
              <Badge className="bg-green-500 text-white text-base px-4 py-2">
                <CheckCircle2 className="h-5 w-5 mr-1" />
                Collected!
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-yellow-300">
            <div className="flex items-start gap-4">
              <Lightbulb className="h-10 w-10 text-yellow-600 mt-1 flex-shrink-0" />
              <p className="text-2xl leading-relaxed">{todayDiscovery.tip}</p>
            </div>
          </div>

          {/* Mind Buddy Reaction */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
            <div className="flex items-start gap-3">
              <span className="text-4xl">🧠</span>
              <div>
                <p className="text-sm text-purple-600 mb-1">Your Mind Buddy says:</p>
                <p className="text-lg">
                  "This is important, {userName}! {todayDiscovery.description}. Keep this in your brain pocket!"
                </p>
              </div>
            </div>
          </div>

          {!acknowledged ? (
            <div className="flex gap-4">
              <Button
                onClick={() => handleAcknowledge('try')}
                size="lg"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg"
              >
                <Sparkles className="mr-2 h-6 w-6" />
                I'll Try It! (+1 Spark ⚡)
              </Button>
              <Button
                onClick={() => handleAcknowledge('got')}
                size="lg"
                variant="outline"
                className="flex-1 text-lg"
              >
                ❤️ Got It! (+1 Spark ⚡)
              </Button>
            </div>
          ) : (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center">
              <p className="text-xl text-green-700 mb-2">
                🎉 Great, {userName}! 🎉
              </p>
              <p className="text-lg text-green-600">
                You earned a Brain Spark! ⚡ Come back tomorrow for a new discovery.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Discoveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            All Brain Discoveries
          </CardTitle>
          <CardDescription>
            Every discovery makes you smarter!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discoveries.map((discovery) => (
              <div
                key={discovery.id}
                className={`p-4 rounded-lg border-2 border-gray-200 bg-gradient-to-r ${discovery.color.replace('500', '50')}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{discovery.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{discovery.category}</p>
                    <p className="text-base leading-relaxed">{discovery.tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
