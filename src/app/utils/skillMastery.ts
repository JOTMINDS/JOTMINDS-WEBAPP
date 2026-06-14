/**
 * Skill Mastery System
 * Track and level up cognitive skills with mastery progression
 */

export interface CognitiveSkillMastery {
  id: string;
  name: string;
  category: 'learning' | 'thinking' | 'decision' | 'memory' | 'attention' | 'problem_solving';
  icon: string;
  description: string;
  currentLevel: number; // 1-10
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  masteryPercentage: number; // 0-100
  rank: SkillRank;
  milestones: SkillMilestone[];
  recentActivity: {
    date: string;
    xpGained: number;
    source: string;
  }[];
  strengthAreas: string[];
  improvementAreas: string[];
}

export type SkillRank = 'Novice' | 'Learner' | 'Practitioner' | 'Expert' | 'Master' | 'Grandmaster';

export interface SkillMilestone {
  level: number;
  title: string;
  description: string;
  unlocks: string[];
  achieved: boolean;
  achievedAt?: string;
}

export interface MasteryProgress {
  userId: string;
  skills: CognitiveSkillMastery[];
  overallMasteryScore: number;
  totalSkillXP: number;
  skillsMaxed: number;
  dominantSkills: string[];
  lastUpdated: string;
}

export interface SkillRecommendation {
  skillId: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  suggestedActivities: string[];
}

const STORAGE_KEY = 'jotminds_skill_mastery';

// XP requirements for each level
const XP_CURVE = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  500,   // Level 4
  850,   // Level 5
  1300,  // Level 6
  1850,  // Level 7
  2500,  // Level 8
  3250,  // Level 9
  4100   // Level 10 (max)
];

// Define cognitive skills
const COGNITIVE_SKILLS: Omit<CognitiveSkillMastery, 'currentLevel' | 'currentXP' | 'xpToNextLevel' | 'totalXP' | 'masteryPercentage' | 'rank' | 'recentActivity' | 'strengthAreas' | 'improvementAreas'>[] = [
  {
    id: 'visual_learning',
    name: 'Visual Learning',
    category: 'learning',
    icon: '👁️',
    description: 'Master visual processing, spatial reasoning, and diagram-based learning',
    milestones: [
      {
        level: 2,
        title: 'Visual Thinker',
        description: 'Can create basic mind maps and visual notes',
        unlocks: ['Advanced visualization lessons'],
        achieved: false
      },
      {
        level: 5,
        title: 'Spatial Master',
        description: 'Expert at spatial reasoning and 3D visualization',
        unlocks: ['Expert visual puzzles'],
        achieved: false
      },
      {
        level: 10,
        title: 'Visualization Guru',
        description: 'Master of all visual learning techniques',
        unlocks: ['Teaching visual methods to others'],
        achieved: false
      }
    ]
  },
  {
    id: 'analytical_thinking',
    name: 'Analytical Thinking',
    category: 'thinking',
    icon: '🔍',
    description: 'Develop logical reasoning, systematic analysis, and problem decomposition',
    milestones: [
      {
        level: 2,
        title: 'Logic Learner',
        description: 'Can solve basic logic puzzles',
        unlocks: ['Intermediate logic challenges'],
        achieved: false
      },
      {
        level: 5,
        title: 'Systems Analyst',
        description: 'Expert at breaking down complex problems',
        unlocks: ['Advanced analytical frameworks'],
        achieved: false
      },
      {
        level: 10,
        title: 'Logic Grandmaster',
        description: 'Master of analytical and logical reasoning',
        unlocks: ['Create custom logic puzzles'],
        achieved: false
      }
    ]
  },
  {
    id: 'creative_thinking',
    name: 'Creative Thinking',
    category: 'thinking',
    icon: '💡',
    description: 'Enhance ideation, divergent thinking, and innovative problem-solving',
    milestones: [
      {
        level: 2,
        title: 'Idea Generator',
        description: 'Can brainstorm multiple solutions',
        unlocks: ['Creative techniques library'],
        achieved: false
      },
      {
        level: 5,
        title: 'Innovation Expert',
        description: 'Creates novel solutions to complex problems',
        unlocks: ['Innovation challenges'],
        achieved: false
      },
      {
        level: 10,
        title: 'Creative Genius',
        description: 'Master of creative problem solving',
        unlocks: ['Design thinking projects'],
        achieved: false
      }
    ]
  },
  {
    id: 'memory',
    name: 'Memory & Recall',
    category: 'memory',
    icon: '🧠',
    description: 'Build powerful memory techniques and rapid recall abilities',
    milestones: [
      {
        level: 2,
        title: 'Memory Apprentice',
        description: 'Can use basic mnemonics',
        unlocks: ['Memory palace technique'],
        achieved: false
      },
      {
        level: 5,
        title: 'Recall Expert',
        description: 'Mastered multiple memory systems',
        unlocks: ['Speed memory challenges'],
        achieved: false
      },
      {
        level: 10,
        title: 'Memory Champion',
        description: 'Peak memory performance',
        unlocks: ['Memory competitions'],
        achieved: false
      }
    ]
  },
  {
    id: 'attention',
    name: 'Focus & Attention',
    category: 'attention',
    icon: '🎯',
    description: 'Develop laser focus, sustained attention, and distraction resistance',
    milestones: [
      {
        level: 2,
        title: 'Focus Learner',
        description: 'Can maintain focus for 15 minutes',
        unlocks: ['Advanced focus techniques'],
        achieved: false
      },
      {
        level: 5,
        title: 'Concentration Master',
        description: 'Deep focus for extended periods',
        unlocks: ['Flow state training'],
        achieved: false
      },
      {
        level: 10,
        title: 'Zen Master',
        description: 'Complete attention control',
        unlocks: ['Mindfulness mastery'],
        achieved: false
      }
    ]
  },
  {
    id: 'problem_solving',
    name: 'Problem Solving',
    category: 'problem_solving',
    icon: '🧩',
    description: 'Master frameworks for tackling any problem systematically',
    milestones: [
      {
        level: 2,
        title: 'Problem Solver',
        description: 'Can apply basic problem-solving frameworks',
        unlocks: ['Advanced problem types'],
        achieved: false
      },
      {
        level: 5,
        title: 'Solution Architect',
        description: 'Designs elegant solutions',
        unlocks: ['Complex system problems'],
        achieved: false
      },
      {
        level: 10,
        title: 'Problem Solving Sage',
        description: 'Master of all problem-solving methods',
        unlocks: ['Real-world project challenges'],
        achieved: false
      }
    ]
  },
  {
    id: 'intuitive_decision',
    name: 'Intuitive Decision Making',
    category: 'decision',
    icon: '⚡',
    description: 'Develop fast, accurate intuition for rapid decisions',
    milestones: [
      {
        level: 2,
        title: 'Quick Thinker',
        description: 'Can make fast decisions on simple matters',
        unlocks: ['Speed decision challenges'],
        achieved: false
      },
      {
        level: 5,
        title: 'Intuition Expert',
        description: 'Trusts and uses intuition effectively',
        unlocks: ['Pattern recognition mastery'],
        achieved: false
      },
      {
        level: 10,
        title: 'Instant Insight',
        description: 'Lightning-fast accurate decisions',
        unlocks: ['Executive decision simulations'],
        achieved: false
      }
    ]
  },
  {
    id: 'reflective_decision',
    name: 'Reflective Decision Making',
    category: 'decision',
    icon: '🤔',
    description: 'Master deliberate, analytical decision-making processes',
    milestones: [
      {
        level: 2,
        title: 'Thoughtful Decider',
        description: 'Can weigh pros and cons systematically',
        unlocks: ['Decision frameworks'],
        achieved: false
      },
      {
        level: 5,
        title: 'Strategic Thinker',
        description: 'Makes optimal long-term decisions',
        unlocks: ['Strategic planning challenges'],
        achieved: false
      },
      {
        level: 10,
        title: 'Wisdom Keeper',
        description: 'Master of deliberate decision-making',
        unlocks: ['Leadership decision scenarios'],
        achieved: false
      }
    ]
  }
];

// Initialize user mastery profile
export function initializeSkillMastery(userId: string): MasteryProgress {
  const skills: CognitiveSkillMastery[] = COGNITIVE_SKILLS.map(skill => ({
    ...skill,
    currentLevel: 1,
    currentXP: 0,
    xpToNextLevel: XP_CURVE[1],
    totalXP: 0,
    masteryPercentage: 0,
    rank: 'Novice' as SkillRank,
    recentActivity: [],
    strengthAreas: [],
    improvementAreas: [],
    milestones: skill.milestones.map(m => ({ ...m, achieved: false }))
  }));

  const progress: MasteryProgress = {
    userId,
    skills,
    overallMasteryScore: 0,
    totalSkillXP: 0,
    skillsMaxed: 0,
    dominantSkills: [],
    lastUpdated: new Date().toISOString()
  };

  saveMasteryProgress(progress);
  return progress;
}

// Get user mastery progress
export function getMasteryProgress(userId: string): MasteryProgress {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return initializeSkillMastery(userId);
  }

  const allProgress: Record<string, MasteryProgress> = JSON.parse(data);
  return allProgress[userId] || initializeSkillMastery(userId);
}

// Add XP to a skill
export function addSkillXP(
  userId: string,
  skillId: string,
  xp: number,
  source: string
): { leveledUp: boolean; newLevel?: number; milestonesUnlocked?: SkillMilestone[] } {
  const progress = getMasteryProgress(userId);
  const skill = progress.skills.find(s => s.id === skillId);

  if (!skill) {
    throw new Error('Skill not found');
  }

  const initialLevel = skill.currentLevel;
  skill.currentXP += xp;
  skill.totalXP += xp;

  // Track recent activity
  skill.recentActivity.push({
    date: new Date().toISOString(),
    xpGained: xp,
    source
  });

  // Keep only last 20 activities
  if (skill.recentActivity.length > 20) {
    skill.recentActivity = skill.recentActivity.slice(-20);
  }

  // Check for level up
  let leveledUp = false;
  let newLevel = initialLevel;
  const milestonesUnlocked: SkillMilestone[] = [];

  while (skill.currentLevel < 10 && skill.currentXP >= skill.xpToNextLevel) {
    skill.currentXP -= skill.xpToNextLevel;
    skill.currentLevel++;
    leveledUp = true;
    newLevel = skill.currentLevel;

    // Check for milestone unlock
    const milestone = skill.milestones.find(m => m.level === skill.currentLevel && !m.achieved);
    if (milestone) {
      milestone.achieved = true;
      milestone.achievedAt = new Date().toISOString();
      milestonesUnlocked.push(milestone);
    }

    // Update XP requirement for next level
    if (skill.currentLevel < 10) {
      skill.xpToNextLevel = XP_CURVE[skill.currentLevel] - XP_CURVE[skill.currentLevel - 1];
    }
  }

  // Cap at level 10
  if (skill.currentLevel === 10) {
    skill.currentXP = 0;
    skill.xpToNextLevel = 0;
  }

  // Update mastery percentage
  skill.masteryPercentage = (skill.currentLevel / 10) * 100;

  // Update rank
  skill.rank = getSkillRank(skill.currentLevel);

  // Update overall progress
  updateOverallProgress(progress);

  // Save
  saveMasteryProgress(progress);

  return {
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
    milestonesUnlocked: milestonesUnlocked.length > 0 ? milestonesUnlocked : undefined
  };
}

function getSkillRank(level: number): SkillRank {
  if (level === 1) return 'Novice';
  if (level <= 3) return 'Learner';
  if (level <= 5) return 'Practitioner';
  if (level <= 7) return 'Expert';
  if (level <= 9) return 'Master';
  return 'Grandmaster';
}

function updateOverallProgress(progress: MasteryProgress): void {
  // Calculate total XP across all skills
  progress.totalSkillXP = progress.skills.reduce((sum, skill) => sum + skill.totalXP, 0);

  // Count maxed skills
  progress.skillsMaxed = progress.skills.filter(s => s.currentLevel === 10).length;

  // Calculate overall mastery score (average of all skill percentages)
  const avgMastery = progress.skills.reduce((sum, skill) => sum + skill.masteryPercentage, 0) / progress.skills.length;
  progress.overallMasteryScore = Math.round(avgMastery);

  // Identify dominant skills (top 3)
  const sortedSkills = [...progress.skills].sort((a, b) => b.totalXP - a.totalXP);
  progress.dominantSkills = sortedSkills.slice(0, 3).map(s => s.name);

  // Update timestamp
  progress.lastUpdated = new Date().toISOString();
}

// Get skill by ID
export function getSkill(userId: string, skillId: string): CognitiveSkillMastery | null {
  const progress = getMasteryProgress(userId);
  return progress.skills.find(s => s.id === skillId) || null;
}

// Get recommendations for skill development
export function getSkillRecommendations(userId: string): SkillRecommendation[] {
  const progress = getMasteryProgress(userId);
  const recommendations: SkillRecommendation[] = [];

  // Recommend developing lowest skills
  const sortedByLevel = [...progress.skills].sort((a, b) => a.currentLevel - b.currentLevel);
  const lowestSkill = sortedByLevel[0];

  if (lowestSkill.currentLevel < 5) {
    recommendations.push({
      skillId: lowestSkill.id,
      reason: `${lowestSkill.name} is your least developed skill. Improving it will boost overall mastery.`,
      priority: 'high',
      suggestedActivities: [
        `Complete "${lowestSkill.name}" lessons`,
        'Practice daily exercises',
        `Aim for ${lowestSkill.name} milestone: ${lowestSkill.milestones.find(m => !m.achieved)?.title || 'Next level'}`
      ]
    });
  }

  // Recommend skills close to leveling up
  const closeToLevelUp = progress.skills.filter(s => {
    const progressToNext = (s.currentXP / s.xpToNextLevel) * 100;
    return progressToNext >= 70 && s.currentLevel < 10;
  });

  closeToLevelUp.forEach(skill => {
    recommendations.push({
      skillId: skill.id,
      reason: `${skill.name} is ${Math.round((skill.currentXP / skill.xpToNextLevel) * 100)}% to next level!`,
      priority: 'medium',
      suggestedActivities: [
        `Need ${skill.xpToNextLevel - skill.currentXP} more XP to level up`,
        'Complete a quick challenge',
        'Review recent lessons'
      ]
    });
  });

  // Recommend balanced development
  const levelDifference = sortedByLevel[sortedByLevel.length - 1].currentLevel - sortedByLevel[0].currentLevel;
  if (levelDifference > 3) {
    recommendations.push({
      skillId: sortedByLevel[0].id,
      reason: 'Balance your skill development for well-rounded cognitive growth',
      priority: 'low',
      suggestedActivities: [
        'Focus on weaker skills',
        'Cross-train different cognitive abilities',
        'Complete diverse challenges'
      ]
    });
  }

  return recommendations;
}

// Get skills by category
export function getSkillsByCategory(
  userId: string,
  category: CognitiveSkillMastery['category']
): CognitiveSkillMastery[] {
  const progress = getMasteryProgress(userId);
  return progress.skills.filter(s => s.category === category);
}

// Save mastery progress
function saveMasteryProgress(progress: MasteryProgress): void {
  const data = localStorage.getItem(STORAGE_KEY);
  const allProgress: Record<string, MasteryProgress> = data ? JSON.parse(data) : {};

  allProgress[progress.userId] = progress;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
}

// Get leaderboard position
export function getSkillLeaderboard(skillId: string, limit: number = 10): {
  rank: number;
  userId: string;
  level: number;
  totalXP: number;
}[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  const allProgress: Record<string, MasteryProgress> = JSON.parse(data);

  const leaderboard = Object.values(allProgress)
    .map(progress => {
      const skill = progress.skills.find(s => s.id === skillId);
      return {
        userId: progress.userId,
        level: skill?.currentLevel || 0,
        totalXP: skill?.totalXP || 0
      };
    })
    .sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return b.totalXP - a.totalXP;
    })
    .slice(0, limit)
    .map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));

  return leaderboard;
}

// Calculate skill synergy bonuses
export function calculateSkillSynergies(userId: string): {
  combination: string[];
  bonus: number;
  description: string;
}[] {
  const progress = getMasteryProgress(userId);
  const synergies: { combination: string[]; bonus: number; description: string }[] = [];

  // Check for complementary skill combinations
  const analytical = progress.skills.find(s => s.id === 'analytical_thinking');
  const creative = progress.skills.find(s => s.id === 'creative_thinking');

  if (analytical && creative && analytical.currentLevel >= 5 && creative.currentLevel >= 5) {
    synergies.push({
      combination: ['Analytical Thinking', 'Creative Thinking'],
      bonus: 20,
      description: 'Balanced thinking: Can analyze problems creatively and validate ideas logically'
    });
  }

  const memory = progress.skills.find(s => s.id === 'memory');
  const attention = progress.skills.find(s => s.id === 'attention');

  if (memory && attention && memory.currentLevel >= 5 && attention.currentLevel >= 5) {
    synergies.push({
      combination: ['Memory', 'Focus & Attention'],
      bonus: 15,
      description: 'Learning powerhouse: Strong focus enhances memory encoding and recall'
    });
  }

  return synergies;
}
