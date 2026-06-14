import React from 'react';
import { Book, TrendingUp, Award, Target, BarChart3, Users } from 'lucide-react';

interface JuniorLearnerDashboardProps {
  studentName: string;
  studentAge: number;
  assessmentsCompleted: number;
  strengthsIdentified: string[];
  recentProgress: number;
  hasParentOversight: boolean;
}

/**
 * Junior Learner Dashboard for Ages 11-15
 * Features:
 * - Beginner-intermediate assessments
 * - Basic insights visible to student
 * - School analytics
 * - Progress tracking
 * - Gamification elements
 */
export function JuniorLearnerDashboard({
  studentName,
  studentAge,
  assessmentsCompleted,
  strengthsIdentified,
  recentProgress,
  hasParentOversight
}: JuniorLearnerDashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">Welcome back, {studentName}!</h1>
              <p className="text-gray-600 mt-1">
                Let's continue your learning journey 🚀
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg">
                <span className="text-sm">Junior Learner</span>
                <span className="ml-2">·</span>
                <span className="ml-2">Age {studentAge}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Parent Oversight Notice */}
        {hasParentOversight && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-amber-900">
                <strong>Parent Oversight Active:</strong> Your parent/guardian has access to your 
                results and progress. They're here to support your learning journey!
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <StatCard
            icon={<Book className="w-6 h-6" />}
            title="Assessments"
            value={assessmentsCompleted}
            subtitle="Completed"
            color="blue"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Progress"
            value={`${recentProgress}%`}
            subtitle="This month"
            color="green"
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            title="Strengths"
            value={strengthsIdentified.length}
            subtitle="Identified"
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Assessments */}
          <div className="md:col-span-2 space-y-6">
            {/* Available Assessments */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Available Assessments
              </h2>
              
              <div className="space-y-3">
                <AssessmentCard
                  title="Learning Styles Assessment"
                  description="Discover how you learn best"
                  duration="15-20 min"
                  level="Intermediate"
                  completed={false}
                />
                <AssessmentCard
                  title="Thinking Styles Assessment"
                  description="Understand how you think and solve problems"
                  duration="15-20 min"
                  level="Intermediate"
                  completed={false}
                />
                <AssessmentCard
                  title="Decision Making Styles"
                  description="Learn about your decision-making preferences"
                  duration="15-20 min"
                  level="Beginner"
                  completed={true}
                />
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Your Insights
              </h2>
              
              <div className="space-y-4">
                <InsightCard
                  title="Learning Style"
                  value="Visual-Kinesthetic Learner"
                  description="You learn best by seeing and doing. Try using diagrams and hands-on activities!"
                  color="blue"
                />
                <InsightCard
                  title="Thinking Preference"
                  value="Creative Thinker"
                  description="You excel at generating new ideas and seeing possibilities. Great for projects!"
                  color="purple"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Progress & Strengths */}
          <div className="space-y-6">
            {/* Your Strengths */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-md p-6 border border-green-200">
              <h3 className="text-gray-900 mb-4">🌟 Your Strengths</h3>
              <div className="space-y-2">
                {strengthsIdentified.map((strength, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-3 border border-green-200"
                  >
                    <p className="text-gray-800">{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress This Week */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-gray-900 mb-4">📈 This Week</h3>
              <div className="space-y-3">
                <ProgressItem label="Assessments" value={2} max={3} />
                <ProgressItem label="Insights Reviewed" value={5} max={5} />
                <ProgressItem label="Goals Set" value={1} max={2} />
              </div>
            </div>

            {/* Gamification */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl shadow-md p-6 border border-purple-200">
              <h3 className="text-gray-900 mb-3">🏆 Badges & Rewards</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-white rounded-lg p-2 text-center border border-purple-200">
                  <span className="text-2xl">🎯</span>
                  <p className="text-xs text-gray-600 mt-1">First Steps</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center border border-purple-200">
                  <span className="text-2xl">📚</span>
                  <p className="text-xs text-gray-600 mt-1">Learner</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center border border-purple-200 opacity-40">
                  <span className="text-2xl">⭐</span>
                  <p className="text-xs text-gray-600 mt-1">Locked</p>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors">
                View All Rewards
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  subtitle: string;
  color: 'blue' | 'green' | 'purple';
}

function StatCard({ icon, title, value, subtitle, color }: StatCardProps) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${colors[color]} text-white mb-3`}>
        {icon}
      </div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-gray-900 text-2xl mt-1">{value}</p>
      <p className="text-gray-500 text-sm">{subtitle}</p>
    </div>
  );
}

interface AssessmentCardProps {
  title: string;
  description: string;
  duration: string;
  level: string;
  completed: boolean;
}

function AssessmentCard({ title, description, duration, level, completed }: AssessmentCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-gray-900">{title}</h4>
        {completed && (
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
            ✓ Completed
          </span>
        )}
      </div>
      <p className="text-gray-600 text-sm mb-3">{description}</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 text-sm text-gray-500">
          <span>⏱️ {duration}</span>
          <span>•</span>
          <span>{level}</span>
        </div>
        {!completed && (
          <button className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors text-sm">
            Start →
          </button>
        )}
      </div>
    </div>
  );
}

interface InsightCardProps {
  title: string;
  value: string;
  description: string;
  color: 'blue' | 'purple';
}

function InsightCard({ title, value, description, color }: InsightCardProps) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200'
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-4`}>
      <p className="text-gray-600 text-sm mb-1">{title}</p>
      <p className="text-gray-900 mb-2">{value}</p>
      <p className="text-gray-700 text-sm">{description}</p>
    </div>
  );
}

interface ProgressItemProps {
  label: string;
  value: number;
  max: number;
}

function ProgressItem({ label, value, max }: ProgressItemProps) {
  const percentage = (value / max) * 100;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-600">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
