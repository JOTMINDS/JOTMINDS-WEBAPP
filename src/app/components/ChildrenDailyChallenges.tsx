import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sparkles, Star, Trophy, CheckCircle2, Flame, Gift } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ChildrenDailyChallengesProps {
  userId: string;
  userName: string;
}

interface Challenge {
  id: number;
  challenge: string;
  purpose: string;
  category: 'creative' | 'analytical' | 'practical' | 'reflective';
  emoji: string;
}

const challenges: Challenge[] = [
  // Creative Thinking
  { id: 1, challenge: "🧱 Build something new using 3 random things around you (like a spoon, paper, and a sock!).", purpose: "Sparks imagination & flexibility", category: 'creative', emoji: '🎨' },
  { id: 2, challenge: "✏️ Draw a creature that can live on the moon — give it a name and a special power.", purpose: "Encourages divergent thinking", category: 'creative', emoji: '🎨' },
  { id: 3, challenge: "📖 Make up a short story that begins with 'One morning, my shadow started talking to me…'", purpose: "Boosts storytelling and creativity", category: 'creative', emoji: '🎨' },
  { id: 4, challenge: "🎵 Clap a rhythm or beat and ask someone to copy it. Then switch!", purpose: "Builds pattern recognition and creative memory", category: 'creative', emoji: '🎨' },
  { id: 5, challenge: "🧠 Imagine a new school subject that doesn't exist. What would students learn?", purpose: "Inspires innovation and open-ended thinking", category: 'creative', emoji: '🎨' },
  
  // Thinking Carefully (Analytical)
  { id: 6, challenge: "🧩 Find 3 things in your room that are shaped like a circle — what else do they have in common?", purpose: "Observation & logical grouping", category: 'analytical', emoji: '🔍' },
  { id: 7, challenge: "💭 If 2 pencils cost 4 coins, how many coins for 6 pencils?", purpose: "Problem-solving through patterns", category: 'analytical', emoji: '🔍' },
  { id: 8, challenge: "👀 Spot the difference: Look out your window — what changed since yesterday?", purpose: "Builds memory and awareness", category: 'analytical', emoji: '🔍' },
  { id: 9, challenge: "🔢 Create your own riddle or brain teaser for your friend.", purpose: "Encourages reasoning and communication", category: 'analytical', emoji: '🔍' },
  { id: 10, challenge: "🕵️ What do a chair and a table have in common? What makes them different?", purpose: "Analytical comparison skills", category: 'analytical', emoji: '🔍' },
  
  // Practical Thinking
  { id: 11, challenge: "🧽 Help fix or tidy something small around the house or class.", purpose: "Builds real-life problem solving", category: 'practical', emoji: '🛠️' },
  { id: 12, challenge: "🍎 Make a simple snack using only 3 ingredients (with an adult's help).", purpose: "Encourages planning and action", category: 'practical', emoji: '🛠️' },
  { id: 13, challenge: "🎒 Pack your school bag for tomorrow — can you make it neater or lighter?", purpose: "Promotes organization & responsibility", category: 'practical', emoji: '🛠️' },
  { id: 14, challenge: "📦 Design a small box or holder to keep your favorite things.", purpose: "Hands-on creativity & practicality", category: 'practical', emoji: '🛠️' },
  { id: 15, challenge: "⚙️ Use 2 items in a new way (like a cup as a pen holder).", purpose: "Encourages adaptive, applied thinking", category: 'practical', emoji: '🛠️' },
  
  // Thoughtful / Reflective
  { id: 16, challenge: "❤️ Tell someone one nice thing you noticed about them today.", purpose: "Builds empathy and reflection", category: 'reflective', emoji: '💭' },
  { id: 17, challenge: "🔄 Think of something you did today — what went well, and what could you do better?", purpose: "Encourages self-reflection", category: 'reflective', emoji: '💭' },
  { id: 18, challenge: "🌈 Think of a time you helped someone — how did it make you feel?", purpose: "Builds emotional awareness", category: 'reflective', emoji: '💭' },
  { id: 19, challenge: "🗣️ Listen carefully while someone talks and then tell them what you understood.", purpose: "Improves focus and listening skills", category: 'reflective', emoji: '💭' },
  { id: 20, challenge: "✨ Close your eyes and imagine your happiest moment this week — draw it or describe it.", purpose: "Fosters gratitude and mindfulness", category: 'reflective', emoji: '💭' },
];

const categoryInfo = {
  creative: { name: 'Creative Thinking', subtitle: 'Use Your Imagination!', color: 'from-pink-500 to-purple-500', bgColor: 'from-pink-50 to-purple-50', borderColor: 'border-pink-300' },
  analytical: { name: 'Thinking Carefully', subtitle: 'Figure It Out!', color: 'from-blue-500 to-cyan-500', bgColor: 'from-blue-50 to-cyan-50', borderColor: 'border-blue-300' },
  practical: { name: 'Practical Thinking', subtitle: 'Make It Work!', color: 'from-orange-500 to-amber-500', bgColor: 'from-orange-50 to-amber-50', borderColor: 'border-orange-300' },
  reflective: { name: 'Thoughtful Thinking', subtitle: 'Think About It!', color: 'from-green-500 to-emerald-500', bgColor: 'from-green-50 to-emerald-50', borderColor: 'border-green-300' },
};

export function ChildrenDailyChallenges({ userId, userName }: ChildrenDailyChallengesProps) {
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [todayChallenge, setTodayChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
    selectTodayChallenge();
  }, [userId]);

  const loadProgress = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fc8eb847/get-challenge-progress?userId=${userId}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.progress) {
          setCompletedChallenges(new Set(data.progress.completedChallenges || []));
          setCurrentStreak(data.progress.currentStreak || 0);
          setTotalStars(data.progress.totalStars || 0);
        }
      }
    } catch (error) {
      console.error('Error loading challenge progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectTodayChallenge = () => {
    // Use date as seed for consistent daily challenge
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = seed % challenges.length;
    setTodayChallenge(challenges[index]);
  };

  const handleCompleteChallenge = async (challengeId: number) => {
    const challengeKey = `${new Date().toDateString()}-${challengeId}`;
    
    if (completedChallenges.has(challengeKey)) {
      return; // Already completed today
    }

    const newCompleted = new Set(completedChallenges);
    newCompleted.add(challengeKey);
    setCompletedChallenges(newCompleted);
    setTotalStars(totalStars + 1);
    setCurrentStreak(currentStreak + 1);

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fc8eb847/save-challenge-progress`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            userId,
            challengeId,
            completedAt: new Date().toISOString(),
            currentStreak: currentStreak + 1,
            totalStars: totalStars + 1
          })
        }
      );
    } catch (error) {
      console.error('Error saving challenge progress:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading your challenges...</div>;
  }

  if (!todayChallenge) {
    return <div className="flex items-center justify-center p-8">No challenge available</div>;
  }

  const categoryDetails = categoryInfo[todayChallenge.category];
  const isTodayCompleted = completedChallenges.has(`${new Date().toDateString()}-${todayChallenge.id}`);

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Thinking Stars</p>
                <p className="text-3xl">⭐ {totalStars}</p>
              </div>
              <Star className="h-12 w-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Day Streak</p>
                <p className="text-3xl">🔥 {currentStreak}</p>
              </div>
              <Flame className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Brain Hero</p>
                <p className="text-3xl">{currentStreak >= 7 ? '🏆' : '🎯'}</p>
              </div>
              {currentStreak >= 7 ? (
                <Trophy className="h-12 w-12 text-purple-500" />
              ) : (
                <Gift className="h-12 w-12 text-purple-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Progress */}
      {currentStreak < 7 && (
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="h-6 w-6 text-purple-500" />
              <p className="text-lg">
                <strong>{7 - currentStreak} more days</strong> to unlock your Brain Hero Badge! 🏆
              </p>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-3 flex-1 rounded ${i < currentStreak ? 'bg-purple-500' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Challenge */}
      <Card className={`border-4 ${categoryDetails.borderColor} shadow-xl`}>
        <CardHeader className={`bg-gradient-to-r ${categoryDetails.color} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-5xl">{todayChallenge.emoji}</span>
              <div>
                <CardTitle className="text-2xl">🎯 Today's Thinking Challenge!</CardTitle>
                <CardDescription className="text-white opacity-90 text-base">
                  {categoryDetails.name} — {categoryDetails.subtitle}
                </CardDescription>
              </div>
            </div>
            {isTodayCompleted && (
              <Badge className="bg-green-500 text-white text-base px-4 py-2">
                <CheckCircle2 className="h-5 w-5 mr-1" />
                Completed!
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className={`bg-gradient-to-r ${categoryDetails.bgColor} p-6 rounded-lg border-2 ${categoryDetails.borderColor}`}>
            <p className="text-xl leading-relaxed mb-4">{todayChallenge.challenge}</p>
            <div className="flex items-start gap-2 text-base text-gray-700">
              <Sparkles className="h-5 w-5 text-yellow-500 mt-0.5" />
              <p><strong>Why this helps:</strong> {todayChallenge.purpose}</p>
            </div>
          </div>

          {!isTodayCompleted ? (
            <Button
              onClick={() => handleCompleteChallenge(todayChallenge.id)}
              size="lg"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg"
            >
              <CheckCircle2 className="mr-2 h-6 w-6" />
              I Did It! (+1 Star ⭐)
            </Button>
          ) : (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center">
              <p className="text-xl text-green-700 mb-2">
                🎉 Amazing work, {userName}! 🎉
              </p>
              <p className="text-lg text-green-600">
                You earned a Thinking Star! Come back tomorrow for a new challenge.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Challenges Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            All Thinking Challenges
          </CardTitle>
          <CardDescription>
            Complete different challenges to become a thinking champion!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((challenge) => {
              const catDetails = categoryInfo[challenge.category];
              return (
                <div
                  key={challenge.id}
                  className={`p-4 rounded-lg border-2 ${catDetails.borderColor} bg-gradient-to-r ${catDetails.bgColor}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{challenge.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">{catDetails.name}</p>
                      <p className="text-base leading-relaxed">{challenge.challenge}</p>
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
}
