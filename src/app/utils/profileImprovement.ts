// Profile Improvement Tracker - Cognitive Growth System
// Tracks actual cognitive skill development (separate from gamification XP)

export interface CognitiveSkill {
  id: string;
  name: string;
  category: 'learning' | 'thinking' | 'decision';
  currentLevel: number; // 0-100
  targetLevel: number; // Goal level
  xp: number; // Cognitive XP (not gamification XP)
  xpToNextLevel: number;
  milestones: Milestone[];
  lastImprovement?: string; // ISO date
  improvementRate: number; // % per week
}

export interface Milestone {
  id: string;
  skillId: string;
  level: number;
  title: string;
  description: string;
  achieved: boolean;
  achievedAt?: string;
  reward?: string;
}

export interface DevelopmentMilestone {
  id: string;
  title: string;
  description: string;
  category: 'cognitive' | 'behavioral' | 'social' | 'academic';
  targetAge?: number; // For age-appropriate milestones
  achieved: boolean;
  achievedAt?: string;
  icon: string;
}

export interface ProgressSnapshot {
  id: string;
  userId: string;
  timestamp: string;
  cognitiveScores: {
    learningAgility: number;
    analyticalDepth: number;
    creativeCapacity: number;
    practicalExecution: number;
    intuitiveSpeed: number;
    reflectiveDepth: number;
  };
  skills: CognitiveSkill[];
  notes?: string;
}

export interface ImprovementMetrics {
  overallGrowth: number; // Overall % improvement
  topImprovingSkills: Array<{ skill: string; improvement: number }>;
  stagnantSkills: Array<{ skill: string; daysSinceImprovement: number }>;
  weeklyProgress: number;
  monthlyProgress: number;
  predictedNextMilestone?: Milestone;
}

// Cognitive Skill Library
export const COGNITIVE_SKILLS: Omit<CognitiveSkill, 'currentLevel' | 'xp' | 'lastImprovement' | 'improvementRate'>[] = [
  // Learning Skills
  {
    id: 'skill_learning_visual',
    name: 'Visual Learning',
    category: 'learning',
    targetLevel: 80,
    xpToNextLevel: 100,
    milestones: [
      { id: 'm1', skillId: 'skill_learning_visual', level: 25, title: 'Visual Beginner', description: 'Starting to recognize visual patterns', achieved: false },
      { id: 'm2', skillId: 'skill_learning_visual', level: 50, title: 'Visual Learner', description: 'Can learn effectively from diagrams and images', achieved: false },
      { id: 'm3', skillId: 'skill_learning_visual', level: 75, title: 'Visual Expert', description: 'Excels at visual-spatial learning', achieved: false },
      { id: 'm4', skillId: 'skill_learning_visual', level: 100, title: 'Visual Master', description: 'Masters complex visual information processing', achieved: false },
    ]
  },
  {
    id: 'skill_learning_auditory',
    name: 'Auditory Learning',
    category: 'learning',
    targetLevel: 80,
    xpToNextLevel: 100,
    milestones: [
      { id: 'm1', skillId: 'skill_learning_auditory', level: 25, title: 'Listening Basics', description: 'Developing listening comprehension', achieved: false },
      { id: 'm2', skillId: 'skill_learning_auditory', level: 50, title: 'Active Listener', description: 'Can learn from lectures and discussions', achieved: false },
      { id: 'm3', skillId: 'skill_learning_auditory', level: 75, title: 'Audio Expert', description: 'Excels at auditory learning', achieved: false },
      { id: 'm4', skillId: 'skill_learning_auditory', level: 100, title: 'Audio Master', description: 'Masters verbal instruction processing', achieved: false },
    ]
  },
  {
    id: 'skill_learning_kinesthetic',
    name: 'Hands-On Learning',
    category: 'learning',
    targetLevel: 80,
    xpToNextLevel: 100,
    milestones: [
      { id: 'm1', skillId: 'skill_learning_kinesthetic', level: 25, title: 'Learning by Doing', description: 'Starting hands-on practice', achieved: false },
      { id: 'm2', skillId: 'skill_learning_kinesthetic', level: 50, title: 'Practical Learner', description: 'Learns best through action', achieved: false },
      { id: 'm3', skillId: 'skill_learning_kinesthetic', level: 75, title: 'Kinesthetic Expert', description: 'Masters learning through experience', achieved: false },
      { id: 'm4', skillId: 'skill_learning_kinesthetic', level: 100, title: 'Hands-On Master', description: 'Peak practical learning ability', achieved: false },
    ]
  },

  // Thinking Skills
  {
    id: 'skill_thinking_analysis',
    name: 'Analytical Thinking',
    category: 'thinking',
    targetLevel: 80,
    xpToNextLevel: 100,
    milestones: [
      { id: 'm1', skillId: 'skill_thinking_analysis', level: 25, title: 'Logic Beginner', description: 'Starting to think logically', achieved: false },
      { id: 'm2', skillId: 'skill_thinking_analysis', level: 50, title: 'Analytical Thinker', description: 'Can break down complex problems', achieved: false },
      { id: 'm3', skillId: 'skill_thinking_analysis', level: 75, title: 'Deep Analyst', description: 'Excels at systematic analysis', achieved: false },
      { id: 'm4', skillId: 'skill_thinking_analysis', level: 100, title: 'Master Analyst', description: 'Peak analytical reasoning', achieved: false },
    ]
  },
  {
    id: 'skill_thinking_creative',
    name: 'Creative Thinking',
    category: 'thinking',
    targetLevel: 80,
    xpToNextLevel: 100,
    milestones: [
      { id: 'm1', skillId: 'skill_thinking_creative', level: 25, title: 'Imagination Starter', description: 'Beginning creative exploration', achieved: false },
      { id: 'm2', skillId: 'skill_thinking_creative', level: 50, title: 'Creative Thinker', description: 'Generates original ideas', achieved: false },
      { id: 'm3', skillId: 'skill_thinking_creative', level: 75, title: 'Innovation Expert', description: 'Excels at creative problem-solving', achieved: false },
      { id: 'm4', skillId: 'skill_thinking_creative', level: 100, title: 'Creative Genius', description: 'Masters innovative thinking', achieved: false },
    ]
  },
  {
    id: 'skill_thinking_critical',
    name: 'Critical Thinking',
    category: 'thinking',
    targetLevel: 80,
    xpToNextLevel: 100,
    milestones: [
      { id: 'm1', skillId: 'skill_thinking_critical', level: 25, title: 'Question Asker', description: 'Learning to question assumptions', achieved: false },
      { id: 'm2', skillId: 'skill_thinking_critical', level: 50, title: 'Critical Thinker', description: 'Evaluates information effectively', achieved: false },
      { id: 'm3', skillId: 'skill_thinking_critical', level: 75, title: 'Sharp Evaluator', description: 'Excels at critical analysis', achieved: false },
      { id: 'm4', skillId: 'skill_thinking_critical', level: 100, title: 'Master Critic', description: 'Peak critical reasoning', achieved: false },
    ]
  },

  // Decision Skills
  {
    id: 'skill_decision_intuitive',
    name: 'Intuitive Decision Making',
    category: 'decision',
    targetLevel: 80,
    xpToNextLevel: 100,
    milestones: [
      { id: 'm1', skillId: 'skill_decision_intuitive', level: 25, title: 'Gut Feel Starter', description: 'Starting to trust instincts', achieved: false },
      { id: 'm2', skillId: 'skill_decision_intuitive', level: 50, title: 'Intuitive Decider', description: 'Makes good instinctive choices', achieved: false },
      { id: 'm3', skillId: 'skill_decision_intuitive', level: 75, title: 'Intuition Expert', description: 'Highly developed intuition', achieved: false },
      { id: 'm4', skillId: 'skill_decision_intuitive', level: 100, title: 'Intuition Master', description: 'Masters intuitive decision-making', achieved: false },
    ]
  },
  {
    id: 'skill_decision_rational',
    name: 'Rational Decision Making',
    category: 'decision',
    targetLevel: 80,
    xpToNextLevel: 100,
    milestones: [
      { id: 'm1', skillId: 'skill_decision_rational', level: 25, title: 'Logic Starter', description: 'Beginning systematic decisions', achieved: false },
      { id: 'm2', skillId: 'skill_decision_rational', level: 50, title: 'Rational Decider', description: 'Makes logical choices', achieved: false },
      { id: 'm3', skillId: 'skill_decision_rational', level: 75, title: 'Strategy Expert', description: 'Excels at planned decisions', achieved: false },
      { id: 'm4', skillId: 'skill_decision_rational', level: 100, title: 'Strategic Master', description: 'Peak rational decision-making', achieved: false },
    ]
  },
];

// Development Milestones
export const DEVELOPMENT_MILESTONES: DevelopmentMilestone[] = [
  // Cognitive Milestones
  { id: 'cog_1', title: 'First Assessment Complete', description: 'Completed your first cognitive assessment', category: 'cognitive', achieved: false, icon: '🎯' },
  { id: 'cog_2', title: 'Full Profile', description: 'Completed all three assessments', category: 'cognitive', achieved: false, icon: '🧠' },
  { id: 'cog_3', title: 'Profile Expert', description: 'Retaken assessments to track growth', category: 'cognitive', achieved: false, icon: '📈' },
  { id: 'cog_4', title: 'Balanced Mind', description: 'All cognitive dimensions above 60', category: 'cognitive', achieved: false, icon: '⚖️' },
  { id: 'cog_5', title: 'Cognitive Excellence', description: 'All cognitive dimensions above 80', category: 'cognitive', achieved: false, icon: '🌟' },

  // Behavioral Milestones
  { id: 'beh_1', title: 'Consistent Learner', description: 'Maintained a 7-day streak', category: 'behavioral', achieved: false, icon: '🔥' },
  { id: 'beh_2', title: 'Dedicated Student', description: 'Maintained a 30-day streak', category: 'behavioral', achieved: false, icon: '💎' },
  { id: 'beh_3', title: 'Growth Mindset', description: 'Completed 10 Brain Gym challenges', category: 'behavioral', achieved: false, icon: '💪' },
  { id: 'beh_4', title: 'Practice Makes Perfect', description: 'Completed 50 Brain Gym challenges', category: 'behavioral', achieved: false, icon: '🏆' },

  // Social Milestones
  { id: 'soc_1', title: 'Sharing is Caring', description: 'Shared your cognitive profile', category: 'social', achieved: false, icon: '🤝' },
  { id: 'soc_2', title: 'Helper', description: 'Helped a peer understand their profile', category: 'social', achieved: false, icon: '👥' },

  // Academic Milestones
  { id: 'aca_1', title: 'Career Explorer', description: 'Explored career recommendations', category: 'academic', achieved: false, icon: '💼' },
  { id: 'aca_2', title: 'Future Planner', description: 'Created a skill development plan', category: 'academic', achieved: false, icon: '🗺️' },
  { id: 'aca_3', title: 'Skill Builder', description: 'Completed a skill plan', category: 'academic', achieved: false, icon: '🎓' },
];

const STORAGE_KEY = 'jotminds_profile_improvement';

// Initialize improvement tracker
export function initializeImprovementTracker(userId: string): void {
  const key = `${STORAGE_KEY}_${userId}`;
  const existing = localStorage.getItem(key);

  if (!existing) {
    const initialSkills = COGNITIVE_SKILLS.map(skill => ({
      ...skill,
      currentLevel: 0,
      xp: 0,
      improvementRate: 0,
    }));

    const tracker = {
      userId,
      skills: initialSkills,
      snapshots: [],
      milestones: DEVELOPMENT_MILESTONES,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(key, JSON.stringify(tracker));
  }
}

// Record a progress snapshot
export function recordProgressSnapshot(
  userId: string,
  cognitiveScores: ProgressSnapshot['cognitiveScores'],
  notes?: string
): void {
  const key = `${STORAGE_KEY}_${userId}`;
  const stored = localStorage.getItem(key);

  if (!stored) {
    initializeImprovementTracker(userId);
    return recordProgressSnapshot(userId, cognitiveScores, notes);
  }

  const tracker = JSON.parse(stored);
  const snapshot: ProgressSnapshot = {
    id: `snapshot_${Date.now()}`,
    userId,
    timestamp: new Date().toISOString(),
    cognitiveScores,
    skills: tracker.skills,
    notes,
  };

  tracker.snapshots.push(snapshot);
  tracker.lastUpdated = new Date().toISOString();

  // Update skill levels based on cognitive scores
  updateSkillLevels(tracker, cognitiveScores);

  localStorage.setItem(key, JSON.stringify(tracker));
}

// Update skill levels based on assessment scores
function updateSkillLevels(tracker: any, scores: ProgressSnapshot['cognitiveScores']): void {
  const skillMapping: Record<string, number> = {
    'skill_learning_visual': scores.learningAgility,
    'skill_learning_auditory': scores.reflectiveDepth,
    'skill_learning_kinesthetic': scores.practicalExecution,
    'skill_thinking_analysis': scores.analyticalDepth,
    'skill_thinking_creative': scores.creativeCapacity,
    'skill_thinking_critical': scores.analyticalDepth,
    'skill_decision_intuitive': scores.intuitiveSpeed,
    'skill_decision_rational': scores.reflectiveDepth,
  };

  tracker.skills.forEach((skill: CognitiveSkill) => {
    const newLevel = skillMapping[skill.id] || skill.currentLevel;
    const levelGain = newLevel - skill.currentLevel;

    if (levelGain > 0) {
      skill.currentLevel = newLevel;
      skill.xp += levelGain * 10; // 10 cognitive XP per level point
      skill.lastImprovement = new Date().toISOString();

      // Check for milestone achievements
      skill.milestones.forEach(milestone => {
        if (!milestone.achieved && skill.currentLevel >= milestone.level) {
          milestone.achieved = true;
          milestone.achievedAt = new Date().toISOString();
        }
      });
    }
  });

  // Check development milestones
  checkDevelopmentMilestones(tracker);
}

// Check and update development milestones
function checkDevelopmentMilestones(tracker: any): void {
  // Implementation based on various conditions
  // This will be expanded based on user actions
}

// Get improvement metrics
export function getImprovementMetrics(userId: string): ImprovementMetrics | null {
  const key = `${STORAGE_KEY}_${userId}`;
  const stored = localStorage.getItem(key);

  if (!stored) return null;

  const tracker = JSON.parse(stored);
  const snapshots = tracker.snapshots as ProgressSnapshot[];

  if (snapshots.length < 2) {
    return {
      overallGrowth: 0,
      topImprovingSkills: [],
      stagnantSkills: [],
      weeklyProgress: 0,
      monthlyProgress: 0,
    };
  }

  const latest = snapshots[snapshots.length - 1];
  const first = snapshots[0];

  // Calculate overall growth
  const firstAvg = Object.values(first.cognitiveScores).reduce((a, b) => a + b, 0) / 6;
  const latestAvg = Object.values(latest.cognitiveScores).reduce((a, b) => a + b, 0) / 6;
  const overallGrowth = latestAvg - firstAvg;

  // Calculate skill improvements
  const skillImprovements = tracker.skills.map((skill: CognitiveSkill) => ({
    skill: skill.name,
    improvement: skill.currentLevel,
  }));

  const topImprovingSkills = skillImprovements
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, 3);

  // Find stagnant skills
  const now = new Date();
  const stagnantSkills = tracker.skills
    .filter((skill: CognitiveSkill) => {
      if (!skill.lastImprovement) return true;
      const daysSince = (now.getTime() - new Date(skill.lastImprovement).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 14; // Stagnant if no improvement in 2 weeks
    })
    .map((skill: CognitiveSkill) => ({
      skill: skill.name,
      daysSinceImprovement: skill.lastImprovement
        ? Math.floor((now.getTime() - new Date(skill.lastImprovement).getTime()) / (1000 * 60 * 60 * 24))
        : 999,
    }));

  // Calculate weekly/monthly progress
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const weekSnapshot = snapshots.find(s => new Date(s.timestamp) >= weekAgo) || first;
  const monthSnapshot = snapshots.find(s => new Date(s.timestamp) >= monthAgo) || first;

  const weekAvg = Object.values(weekSnapshot.cognitiveScores).reduce((a, b) => a + b, 0) / 6;
  const monthAvg = Object.values(monthSnapshot.cognitiveScores).reduce((a, b) => a + b, 0) / 6;

  return {
    overallGrowth: Math.round(overallGrowth * 10) / 10,
    topImprovingSkills,
    stagnantSkills,
    weeklyProgress: Math.round((latestAvg - weekAvg) * 10) / 10,
    monthlyProgress: Math.round((latestAvg - monthAvg) * 10) / 10,
  };
}

// Get all snapshots for graphing
export function getProgressSnapshots(userId: string): ProgressSnapshot[] {
  const key = `${STORAGE_KEY}_${userId}`;
  const stored = localStorage.getItem(key);

  if (!stored) return [];

  const tracker = JSON.parse(stored);
  return tracker.snapshots || [];
}

// Get skills for display
export function getCognitiveSkills(userId: string): CognitiveSkill[] {
  const key = `${STORAGE_KEY}_${userId}`;
  const stored = localStorage.getItem(key);

  if (!stored) {
    initializeImprovementTracker(userId);
    return getCognitiveSkills(userId);
  }

  const tracker = JSON.parse(stored);
  return tracker.skills || [];
}

// Get development milestones
export function getDevelopmentMilestones(userId: string): DevelopmentMilestone[] {
  const key = `${STORAGE_KEY}_${userId}`;
  const stored = localStorage.getItem(key);

  if (!stored) {
    initializeImprovementTracker(userId);
    return getDevelopmentMilestones(userId);
  }

  const tracker = JSON.parse(stored);
  return tracker.milestones || DEVELOPMENT_MILESTONES;
}
