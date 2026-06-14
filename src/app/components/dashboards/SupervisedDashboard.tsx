import React from 'react';
import { Star, Trophy, Heart, Sparkles, Lock } from 'lucide-react';

interface SupervisedDashboardProps {
  childName: string;
  childAge: number;
  badgesEarned: number;
  activitiesCompleted: number;
  parentEmail: string;
}

/**
 * Supervised Dashboard for Ages 6-10 (Early Learners)
 * Features:
 * - Gamified, colorful, kid-friendly design
 * - Simple progress tracking
 * - Badge display
 * - Parent-facing results notice
 * - No detailed cognitive data shown to child
 */
export function SupervisedDashboard({
  childName,
  childAge,
  badgesEarned,
  activitiesCompleted,
  parentEmail
}: SupervisedDashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-4 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 flex items-center gap-3">
                <span className="text-4xl">👋</span>
                <span>Hi, {childName}!</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome to your learning adventure! 🚀
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full border-2 border-purple-300">
                <Star className="w-5 h-5 text-purple-600" />
                <span className="text-purple-900">Age {childAge}</span>
              </div>
              <span className="text-gray-500 text-sm">🌱 Early Learner</span>
            </div>
          </div>
        </div>

        {/* Parent Notice */}
        <div className="bg-blue-100 border-3 border-blue-300 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-blue-900">
                <strong>👨‍👩‍👧 For Parents:</strong> {childName}'s detailed results are visible only in your Parent Dashboard. 
                We'll send updates to <strong>{parentEmail}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Badges Earned */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl shadow-lg p-6 text-white border-4 border-yellow-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white flex items-center gap-2">
                <Trophy className="w-8 h-8" />
                Your Badges
              </h2>
              <span className="text-6xl">{badgesEarned}</span>
            </div>
            <p className="text-yellow-100">
              Awesome! You've earned {badgesEarned} special badges! 🎉
            </p>
            <button className="mt-4 bg-white text-orange-600 px-6 py-2 rounded-full hover:bg-yellow-50 transition-colors">
              See All Badges →
            </button>
          </div>

          {/* Activities Completed */}
          <div className="bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl shadow-lg p-6 text-white border-4 border-pink-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white flex items-center gap-2">
                <Sparkles className="w-8 h-8" />
                Activities
              </h2>
              <span className="text-6xl">{activitiesCompleted}</span>
            </div>
            <p className="text-purple-100">
              You've completed {activitiesCompleted} fun activities! Keep going! 💪
            </p>
            <button className="mt-4 bg-white text-purple-600 px-6 py-2 rounded-full hover:bg-pink-50 transition-colors">
              Do More Activities →
            </button>
          </div>
        </div>

        {/* Available Activities */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 border-4 border-green-200">
          <h2 className="text-gray-900 mb-4 flex items-center gap-3">
            <span className="text-3xl">🎮</span>
            Fun Things to Do
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <ActivityCard
              emoji="🧠"
              title="Learning Quiz"
              description="Discover how you learn best!"
              color="blue"
            />
            <ActivityCard
              emoji="🎨"
              title="Thinking Game"
              description="Show how you think!"
              color="purple"
            />
            <ActivityCard
              emoji="🌟"
              title="Decision Fun"
              description="Make quick choices!"
              color="pink"
            />
          </div>
        </div>

        {/* Encouragement Section */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl shadow-lg p-6 mt-6 border-4 border-green-300">
          <div className="flex items-center gap-4">
            <div className="text-6xl">
              <Heart className="w-16 h-16 text-red-500 fill-red-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-gray-900 mb-2">You're Doing Great, {childName}! 🎉</h3>
              <p className="text-gray-700">
                Keep exploring, learning, and having fun! Your parent/guardian is proud of you! 
                Remember to ask them if you have any questions. ❤️
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ActivityCardProps {
  emoji: string;
  title: string;
  description: string;
  color: 'blue' | 'purple' | 'pink';
}

function ActivityCard({ emoji, title, description, color }: ActivityCardProps) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-400 text-blue-900',
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-400 text-purple-900',
    pink: 'bg-pink-50 border-pink-200 hover:border-pink-400 text-pink-900'
  };

  return (
    <button className={`${colors[color]} border-3 rounded-xl p-4 text-left hover:shadow-lg transition-all`}>
      <div className="text-4xl mb-2">{emoji}</div>
      <h4 className="mb-1">{title}</h4>
      <p className="text-sm opacity-80">{description}</p>
    </button>
  );
}
