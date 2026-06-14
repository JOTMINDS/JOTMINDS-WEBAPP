import React from 'react';
import { Briefcase, TrendingUp, Target, Users, Zap, BarChart2, Award, ArrowRight } from 'lucide-react';

interface ProfessionalDashboardProps {
  userName: string;
  userAge: number;
  careerPathIdentified?: string;
  completedAssessments: number;
  strengthsCount: number;
  productivityScore: number;
  leadershipLevel: string;
}

/**
 * Professional Dashboard for Ages 19+ (Adults)
 * Features:
 * - Full suite of assessments
 * - Career routing and mapping
 * - Productivity tools
 * - Leadership insights
 * - Team analytics
 * - Advanced insights
 */
export function ProfessionalDashboard({
  userName,
  userAge,
  careerPathIdentified,
  completedAssessments,
  strengthsCount,
  productivityScore,
  leadershipLevel
}: ProfessionalDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">Welcome, {userName}</h1>
              <p className="text-gray-600 mt-1">
                Your Professional Cognitive Profile
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md">
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <MetricCard
            icon={<Briefcase className="w-5 h-5" />}
            label="Career Path"
            value={careerPathIdentified || 'Not Set'}
            trend="+2 matches"
            color="indigo"
          />
          <MetricCard
            icon={<BarChart2 className="w-5 h-5" />}
            label="Productivity"
            value={`${productivityScore}%`}
            trend="+5% this week"
            color="green"
          />
          <MetricCard
            icon={<Award className="w-5 h-5" />}
            label="Strengths"
            value={strengthsCount}
            trend="Top 10%"
            color="purple"
          />
          <MetricCard
            icon={<Users className="w-5 h-5" />}
            label="Leadership"
            value={leadershipLevel}
            trend="Advanced"
            color="blue"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content - Left 2 Columns */}
          <div className="md:col-span-2 space-y-6">
            {/* Career Routing */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  Career Routing & Development
                </h2>
                <button className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {careerPathIdentified ? (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 mb-4 border border-indigo-200">
                  <p className="text-indigo-900 mb-2">
                    <strong>Your Best Match:</strong> {careerPathIdentified}
                  </p>
                  <p className="text-indigo-700 text-sm">
                    Based on your cognitive profile, thinking styles, and decision-making preferences
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                  <p className="text-gray-700 mb-2">
                    Complete your career assessment to discover your ideal career paths
                  </p>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors text-sm">
                    Start Career Assessment →
                  </button>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-3">
                <CareerOptionCard title="Data Analyst" match={92} />
                <CareerOptionCard title="UX Designer" match={87} />
                <CareerOptionCard title="Project Manager" match={84} />
              </div>
            </div>

            {/* Assessment Suite */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-gray-900 mb-4">Full Assessment Suite</h2>
              
              <div className="space-y-3">
                <ProfessionalAssessmentCard
                  title="Advanced Cognitive Profile"
                  description="Complete 300-question assessment covering learning, thinking, and decision-making"
                  duration="45-60 min"
                  status="completed"
                  completedDate="2 weeks ago"
                />
                <ProfessionalAssessmentCard
                  title="Leadership Assessment"
                  description="Discover your leadership style and potential"
                  duration="30 min"
                  status="in-progress"
                  progress={60}
                />
                <ProfessionalAssessmentCard
                  title="Emotional Intelligence"
                  description="Assess your emotional awareness and social skills"
                  duration="25 min"
                  status="available"
                />
                <ProfessionalAssessmentCard
                  title="Team Dynamics & Communication"
                  description="Understand how you work in teams and communicate"
                  duration="20 min"
                  status="available"
                />
              </div>
            </div>

            {/* Productivity Tools */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Productivity Tools
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <ProductivityTool
                  icon="📊"
                  title="Performance Analytics"
                  description="Track your productivity patterns"
                />
                <ProductivityTool
                  icon="🎯"
                  title="Goal Setting"
                  description="Set and track professional goals"
                />
                <ProductivityTool
                  icon="⏰"
                  title="Time Management"
                  description="Optimize your work schedule"
                />
                <ProductivityTool
                  icon="🧠"
                  title="Focus Insights"
                  description="Understand your peak performance times"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Insights & Actions */}
          <div className="space-y-6">
            {/* Quick Insights */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-gray-900 mb-4">💡 Quick Insights</h3>
              
              <div className="space-y-3">
                <InsightBadge
                  label="Learning Style"
                  value="Reflective Observer"
                  color="blue"
                />
                <InsightBadge
                  label="Thinking Preference"
                  value="Analytical"
                  color="purple"
                />
                <InsightBadge
                  label="Decision Style"
                  value="Balanced"
                  color="green"
                />
                <InsightBadge
                  label="Work Style"
                  value="Detail-Oriented"
                  color="indigo"
                />
              </div>
            </div>

            {/* Top Strengths */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm p-6 border border-purple-200">
              <h3 className="text-gray-900 mb-4">🌟 Top Strengths</h3>
              
              <div className="space-y-2">
                <StrengthItem strength="Strategic Thinking" level={95} />
                <StrengthItem strength="Problem Solving" level={89} />
                <StrengthItem strength="Data Analysis" level={87} />
                <StrengthItem strength="Communication" level={82} />
              </div>
              
              <button className="w-full mt-4 bg-white text-purple-700 border border-purple-300 py-2 rounded hover:bg-purple-50 transition-colors text-sm">
                View Full Report →
              </button>
            </div>

            {/* Recommended Actions */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-sm p-6 border border-green-200">
              <h3 className="text-gray-900 mb-4">📋 Recommended Actions</h3>
              
              <div className="space-y-3">
                <ActionItem
                  icon="🎯"
                  text="Complete Leadership Assessment"
                  urgent={false}
                />
                <ActionItem
                  icon="📊"
                  text="Review Career Match Report"
                  urgent={true}
                />
                <ActionItem
                  icon="🔄"
                  text="Update Skills Profile"
                  urgent={false}
                />
              </div>
            </div>

            {/* Progress This Month */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-gray-900 mb-4">📈 This Month</h3>
              
              <div className="space-y-3">
                <ProgressBar label="Assessments" value={3} max={5} />
                <ProgressBar label="Insights Reviewed" value={12} max={15} />
                <ProgressBar label="Goals Achieved" value={2} max={3} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend: string;
  color: 'indigo' | 'green' | 'purple' | 'blue';
}

function MetricCard({ icon, label, value, trend, color }: MetricCardProps) {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${colors[color]} text-white mb-3`}>
        {icon}
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-gray-900 text-xl mb-1">{value}</p>
      <p className="text-gray-500 text-xs">{trend}</p>
    </div>
  );
}

function CareerOptionCard({ title, match }: { title: string; match: number }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
      <p className="text-gray-900 text-sm mb-1">{title}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 rounded-full"
            style={{ width: `${match}%` }}
          />
        </div>
        <span className="text-indigo-600 text-xs font-medium">{match}%</span>
      </div>
    </div>
  );
}

interface ProfessionalAssessmentCardProps {
  title: string;
  description: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'available';
  completedDate?: string;
  progress?: number;
}

function ProfessionalAssessmentCard({
  title,
  description,
  duration,
  status,
  completedDate,
  progress
}: ProfessionalAssessmentCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-gray-900">{title}</h4>
        {status === 'completed' && (
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded flex-shrink-0">
            ✓ Completed
          </span>
        )}
        {status === 'in-progress' && (
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded flex-shrink-0">
            In Progress
          </span>
        )}
      </div>
      <p className="text-gray-600 text-sm mb-3">{description}</p>
      
      {status === 'in-progress' && progress && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-sm">⏱️ {duration}</span>
        {status === 'completed' && completedDate && (
          <span className="text-gray-500 text-sm">{completedDate}</span>
        )}
        {status === 'in-progress' && (
          <button className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors text-sm">
            Continue →
          </button>
        )}
        {status === 'available' && (
          <button className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700 transition-colors text-sm">
            Start →
          </button>
        )}
      </div>
    </div>
  );
}

function ProductivityTool({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <button className="border border-gray-200 rounded-lg p-4 text-left hover:border-indigo-300 hover:shadow-md transition-all">
      <div className="text-3xl mb-2">{icon}</div>
      <h4 className="text-gray-900 text-sm mb-1">{title}</h4>
      <p className="text-gray-600 text-xs">{description}</p>
    </button>
  );
}

function InsightBadge({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    green: 'bg-green-100 text-green-800',
    indigo: 'bg-indigo-100 text-indigo-800'
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className={`${colors[color]} px-3 py-1 rounded-full text-sm`}>
        {value}
      </span>
    </div>
  );
}

function StrengthItem({ strength, level }: { strength: string; level: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{strength}</span>
        <span className="text-gray-600">{level}%</span>
      </div>
      <div className="w-full bg-white rounded-full h-2">
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  );
}

function ActionItem({ icon, text, urgent }: { icon: string; text: string; urgent: boolean }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
      <span className="text-2xl">{icon}</span>
      <span className="text-gray-700 text-sm flex-1">{text}</span>
      {urgent && (
        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
          Urgent
        </span>
      )}
    </div>
  );
}

function ProgressBar({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = (value / max) * 100;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-600">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
