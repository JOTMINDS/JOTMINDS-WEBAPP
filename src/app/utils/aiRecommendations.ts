/**
 * AI Recommendation Engine
 * Provides explainable AI-powered recommendations based on user profiles and learning patterns
 */

export interface CognitiveArchetype {
  name: string;
  tagline: string;
  description: string;
  icon: string;
  primaryColor: string;
  strengths: string[];
  challenges: string[];
  idealLearningEnvironment: string;
  careerAffinities: string[];
  compatibleArchetypes: string[];
}

const ARCHETYPES: Record<string, CognitiveArchetype> = {
  analytical_visual: {
    name: 'Analytical Architect',
    tagline: 'You build knowledge with precision and clarity',
    description: 'You combine strong analytical reasoning with visual processing, making you excellent at turning complex data into clear mental models and structured frameworks.',
    icon: '🏗️',
    primaryColor: '#5B7DB1',
    strengths: ['Systems thinking', 'Data interpretation', 'Problem decomposition', 'Pattern recognition'],
    challenges: ['Open-ended creativity', 'Ambiguous tasks', 'Purely verbal instructions'],
    idealLearningEnvironment: 'Structured courses with diagrams, flowcharts, and clear learning objectives.',
    careerAffinities: ['Engineering', 'Data Science', 'Architecture', 'Finance', 'Research'],
    compatibleArchetypes: ['Creative Innovator', 'Strategic Planner']
  },
  creative_auditory: {
    name: 'Creative Communicator',
    tagline: 'You learn through stories, sound, and expression',
    description: 'Your creative thinking paired with strong auditory processing makes you a natural storyteller and communicator who learns best through discussion and narrative.',
    icon: '🎙️',
    primaryColor: '#6B4C9A',
    strengths: ['Verbal communication', 'Creative ideation', 'Storytelling', 'Collaborative thinking'],
    challenges: ['Data-heavy tasks', 'Solitary study', 'Rigid frameworks'],
    idealLearningEnvironment: 'Study groups, podcasts, discussions, and creative projects.',
    careerAffinities: ['Marketing', 'Teaching', 'Journalism', 'Arts', 'Public Relations'],
    compatibleArchetypes: ['Analytical Architect', 'Empathetic Connector']
  },
  kinesthetic_intuitive: {
    name: 'Intuitive Practitioner',
    tagline: 'You learn by doing and trusting your instincts',
    description: 'Your hands-on learning style combined with strong intuitive decision-making means you excel when you can dive in, experiment, and learn from direct experience.',
    icon: '⚡',
    primaryColor: '#E0A020',
    strengths: ['Rapid prototyping', 'Adaptive problem-solving', 'Real-world application', 'Quick decision-making'],
    challenges: ['Theoretical study', 'Long reading sessions', 'Highly structured formats'],
    idealLearningEnvironment: 'Labs, simulations, project-based learning, and internships.',
    careerAffinities: ['Entrepreneurship', 'Healthcare', 'Sports', 'Manufacturing', 'Design'],
    compatibleArchetypes: ['Analytical Architect', 'Creative Communicator']
  },
  balanced_analytical: {
    name: 'Strategic Planner',
    tagline: 'You approach every challenge with foresight and balance',
    description: 'Your balanced cognitive profile combined with analytical decision-making allows you to consider multiple perspectives systematically and craft well-reasoned strategies.',
    icon: '🎯',
    primaryColor: '#1E8A6E',
    strengths: ['Strategic thinking', 'Risk assessment', 'Multi-perspective analysis', 'Long-term planning'],
    challenges: ['Rapid pivoting', 'Highly ambiguous environments', 'Purely intuitive tasks'],
    idealLearningEnvironment: 'Case studies, seminars, structured debates, and mentorship.',
    careerAffinities: ['Management', 'Law', 'Consulting', 'Policy', 'Academia'],
    compatibleArchetypes: ['Intuitive Practitioner', 'Analytical Architect']
  },
  default: {
    name: 'Adaptive Learner',
    tagline: 'Your unique profile makes you highly flexible',
    description: 'You have a rich, multifaceted cognitive profile that allows you to adapt to a wide range of learning situations. Your versatility is your greatest strength.',
    icon: '🌟',
    primaryColor: '#6B4C9A',
    strengths: ['Adaptability', 'Versatile learning', 'Broad perspective', 'Cross-domain thinking'],
    challenges: ['Identifying your deepest strengths', 'Choosing a focus area'],
    idealLearningEnvironment: 'Varied, mixed-media content with opportunities to explore different approaches.',
    careerAffinities: ['Generalist roles', 'Interdisciplinary fields', 'Startups', 'Consulting'],
    compatibleArchetypes: ['All archetypes']
  }
};

export function getCognitiveArchetype(profile: UserProfile): CognitiveArchetype {
  const scores = profile.assessmentScores;
  if (!scores) return ARCHETYPES.default;

  const visual = scores.learning?.visual || 0;
  const auditory = scores.learning?.auditory || 0;
  const kinesthetic = scores.learning?.kinesthetic || 0;
  const analytical = scores.thinking?.analytical || 0;
  const creative = scores.thinking?.creative || 0;
  const intuitive = scores.decision?.intuitive || 0;

  if (analytical > 65 && visual > 60) return ARCHETYPES.analytical_visual;
  if (creative > 65 && auditory > 60) return ARCHETYPES.creative_auditory;
  if (kinesthetic > 60 && intuitive > 60) return ARCHETYPES.kinesthetic_intuitive;
  if (analytical > 60) return ARCHETYPES.balanced_analytical;
  return ARCHETYPES.default;
}

export interface WeeklyStudyPlan {
  weekStart: Date;
  totalHours: number;
  days: DayPlan[];
  weeklyGoal: string;
  progressMetrics: { label: string; target: number; unit: string }[];
}

export interface DayPlan {
  day: string;
  date: Date;
  sessions: {
    id: string;
    time: string;
    title: string;
    category: string;
    duration: number;
    focus: string;
    type: 'assessment' | 'lesson' | 'practice' | 'review' | 'rest';
    color: string;
    reasoning: string;
  }[];
  totalMinutes: number;
  isRestDay: boolean;
}

export function generateWeeklyPlan(profile: UserProfile, weeklyMinutes: number = 300): WeeklyStudyPlan {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);

  const archetype = getCognitiveArchetype(profile);
  const scores = profile.assessmentScores || {};

  const sessionColors = {
    lesson: '#5B7DB1',
    practice: '#6B4C9A',
    review: '#1E8A6E',
    assessment: '#E0A020',
    rest: '#9CA3AF'
  };

  const days: DayPlan[] = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const weakestArea = (() => {
    const all = [
      { area: 'Visual Learning', score: scores.learning?.visual || 0 },
      { area: 'Auditory Learning', score: scores.learning?.auditory || 0 },
      { area: 'Analytical Thinking', score: scores.thinking?.analytical || 0 },
      { area: 'Creative Thinking', score: scores.thinking?.creative || 0 },
    ].sort((a, b) => a.score - b.score);
    return all[0]?.area || 'Core Skills';
  })();

  const strongestArea = (() => {
    const all = [
      { area: 'Visual Learning', score: scores.learning?.visual || 0 },
      { area: 'Analytical Thinking', score: scores.thinking?.analytical || 0 },
      { area: 'Creative Thinking', score: scores.thinking?.creative || 0 },
    ].sort((a, b) => b.score - a.score);
    return all[0]?.area || 'Strengths';
  })();

  const dailyAllotments = [55, 45, 55, 45, 55, 35, 0]; // Mon-Sun in minutes (Sun = rest)

  dayNames.forEach((dayName, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const isRest = dailyAllotments[i] === 0;
    const dayMinutes = Math.round((dailyAllotments[i] / 290) * weeklyMinutes);

    const sessions: DayPlan['sessions'] = [];

    if (!isRest && dayMinutes > 0) {
      if (i % 3 === 0) {
        sessions.push({
          id: `${dayName}-warmup`,
          time: '08:00',
          title: `${strongestArea} Application`,
          category: 'Lesson',
          duration: Math.round(dayMinutes * 0.5),
          focus: strongestArea,
          type: 'lesson',
          color: sessionColors.lesson,
          reasoning: `Leverages your cognitive strength in ${strongestArea} for high-impact learning.`
        });
        sessions.push({
          id: `${dayName}-practice`,
          time: '10:00',
          title: 'Active Practice & Recall',
          category: 'Practice',
          duration: Math.round(dayMinutes * 0.5),
          focus: 'Retrieval Practice',
          type: 'practice',
          color: sessionColors.practice,
          reasoning: 'Spaced retrieval practice consolidates learning by 50% over passive review.'
        });
      } else if (i % 3 === 1) {
        sessions.push({
          id: `${dayName}-development`,
          time: '09:00',
          title: `${weakestArea} Development`,
          category: 'Skill Building',
          duration: Math.round(dayMinutes * 0.6),
          focus: weakestArea,
          type: 'practice',
          color: sessionColors.practice,
          reasoning: `Targeted development of ${weakestArea} to create a more balanced cognitive profile.`
        });
        sessions.push({
          id: `${dayName}-review`,
          time: '11:00',
          title: 'Reflection & Review',
          category: 'Review',
          duration: Math.round(dayMinutes * 0.4),
          focus: 'Metacognition',
          type: 'review',
          color: sessionColors.review,
          reasoning: 'Metacognitive reflection improves long-term retention and self-awareness.'
        });
      } else {
        sessions.push({
          id: `${dayName}-challenge`,
          time: '09:30',
          title: 'Challenge Assessment',
          category: 'Assessment',
          duration: Math.round(dayMinutes * 0.45),
          focus: 'Testing Knowledge',
          type: 'assessment',
          color: sessionColors.assessment,
          reasoning: 'Regular self-assessment identifies gaps before they become obstacles.'
        });
        sessions.push({
          id: `${dayName}-lesson`,
          time: '11:00',
          title: 'New Concept Exploration',
          category: 'Lesson',
          duration: Math.round(dayMinutes * 0.55),
          focus: 'New Learning',
          type: 'lesson',
          color: sessionColors.lesson,
          reasoning: 'Introducing new concepts after assessment primes the brain for learning.'
        });
      }
    }

    days.push({
      day: dayName,
      date,
      sessions,
      totalMinutes: sessions.reduce((sum, s) => sum + s.duration, 0),
      isRestDay: isRest
    });
  });

  return {
    weekStart,
    totalHours: Math.round(weeklyMinutes / 60 * 10) / 10,
    days,
    weeklyGoal: `Build ${weakestArea} skills while applying ${strongestArea} strengths — aligned with your ${archetype.name} archetype.`,
    progressMetrics: [
      { label: 'Lessons Completed', target: 5, unit: 'lessons' },
      { label: 'Practice Sessions', target: 4, unit: 'sessions' },
      { label: 'Study Minutes', target: weeklyMinutes, unit: 'mins' },
      { label: 'Assessment Score', target: 80, unit: '%' }
    ]
  };
}

export interface ReminderConfig {
  studyDays: number[];
  preferredTime: 'morning' | 'afternoon' | 'evening';
  sessionDuration: number;
  reminderTypes: ('streak' | 'lesson' | 'assessment' | 'break')[];
}

export function applyReminderConfig(
  reminders: ReturnType<typeof generateSmartReminders>,
  config: ReminderConfig
): ReturnType<typeof generateSmartReminders> {
  return reminders.filter(r => config.reminderTypes.includes(r.type as any));
}

export interface UserProfile {
  id: string;
  learningStyle?: string;
  thinkingStyle?: string;
  decisionStyle?: string;
  assessmentScores?: {
    learning?: Record<string, number>;
    thinking?: Record<string, number>;
    decision?: Record<string, number>;
  };
  educationLevel?: string;
  age?: number;
  role?: string;
}

export interface Recommendation {
  id: string;
  type: 'activity' | 'lesson' | 'resource' | 'skill' | 'habit';
  title: string;
  description: string;
  reasoning: string; // Explainable AI: why this recommendation
  relevanceScore: number; // 0-100
  priority: 'low' | 'medium' | 'high';
  estimatedTime?: number; // minutes
  category: string;
  evidence: string[]; // Data points supporting this recommendation
}

export interface AIProfileInterpretation {
  summary: string;
  strengths: {
    area: string;
    score: number;
    explanation: string;
    evidenceFromProfile: string;
  }[];
  developmentAreas: {
    area: string;
    currentLevel: number;
    explanation: string;
    evidenceFromProfile: string;
    suggestedActions: string[];
  }[];
  learningPathway: {
    stage: string;
    focus: string;
    reasoning: string;
  };
  personalizedInsights: string[];
}

export interface StudySession {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  activities: {
    type: string;
    name: string;
    duration: number;
    reasoning: string;
  }[];
  reasoning: string;
  expectedOutcomes: string[];
}

export interface SmartReminder {
  id: string;
  type: 'streak' | 'lesson' | 'study_session' | 'assessment' | 'break';
  message: string;
  reasoning: string;
  scheduledFor?: Date;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Interpret user profile with explainable AI
 */
export function interpretProfile(userId: string, profile: UserProfile): AIProfileInterpretation {
  const strengths: AIProfileInterpretation['strengths'] = [];
  const developmentAreas: AIProfileInterpretation['developmentAreas'] = [];
  const insights: string[] = [];

  // Analyze learning style
  if (profile.assessmentScores?.learning) {
    const learningScores = profile.assessmentScores.learning;
    const visualScore = learningScores.visual || 0;
    const auditoryScore = learningScores.auditory || 0;
    const kinestheticScore = learningScores.kinesthetic || 0;
    const readingScore = learningScores.reading || 0;

    // Identify strengths (scores > 70)
    if (visualScore > 70) {
      strengths.push({
        area: 'Visual Learning',
        score: visualScore,
        explanation: 'You excel at processing visual information like diagrams, charts, and images.',
        evidenceFromProfile: `Your visual learning score of ${visualScore}% indicates strong ability to learn through visual aids.`
      });
      insights.push(`Use diagrams, mind maps, and color-coding to enhance your learning.`);
    }

    if (auditoryScore > 70) {
      strengths.push({
        area: 'Auditory Learning',
        score: auditoryScore,
        explanation: 'You learn effectively through listening and verbal explanation.',
        evidenceFromProfile: `Your auditory score of ${auditoryScore}% shows you benefit from discussions and audio resources.`
      });
      insights.push(`Engage in study groups and use audio lectures to maximize retention.`);
    }

    // Identify development areas (scores < 50)
    if (readingScore < 50) {
      developmentAreas.push({
        area: 'Reading Comprehension',
        currentLevel: readingScore,
        explanation: 'Strengthening text-based learning could broaden your learning toolkit.',
        evidenceFromProfile: `Your reading score of ${readingScore}% suggests room for improvement.`,
        suggestedActions: [
          'Practice active reading with note-taking',
          'Use the SQ3R method (Survey, Question, Read, Recite, Review)',
          'Break long texts into smaller, manageable chunks'
        ]
      });
    }
  }

  // Analyze thinking style
  if (profile.assessmentScores?.thinking) {
    const thinkingScores = profile.assessmentScores.thinking;
    const analyticalScore = thinkingScores.analytical || 0;
    const creativeScore = thinkingScores.creative || 0;

    if (analyticalScore > 70) {
      strengths.push({
        area: 'Analytical Thinking',
        score: analyticalScore,
        explanation: 'You excel at breaking down complex problems systematically.',
        evidenceFromProfile: `Analytical score of ${analyticalScore}% indicates strong logical reasoning.`
      });
    }

    if (creativeScore > 70) {
      strengths.push({
        area: 'Creative Thinking',
        score: creativeScore,
        explanation: 'You have strong ability to generate innovative ideas and solutions.',
        evidenceFromProfile: `Creative score of ${creativeScore}% shows excellent divergent thinking.`
      });
    }

    // Balance recommendation
    const gap = Math.abs(analyticalScore - creativeScore);
    if (gap > 30) {
      const lowerArea = analyticalScore < creativeScore ? 'analytical' : 'creative';
      const lowerScore = Math.min(analyticalScore, creativeScore);

      developmentAreas.push({
        area: lowerArea === 'analytical' ? 'Analytical Thinking' : 'Creative Thinking',
        currentLevel: lowerScore,
        explanation: `Balancing both analytical and creative thinking creates cognitive flexibility.`,
        evidenceFromProfile: `Gap of ${gap} points between analytical (${analyticalScore}%) and creative (${creativeScore}%) thinking.`,
        suggestedActions: lowerArea === 'analytical'
          ? [
              'Practice breaking down problems into smaller parts',
              'Work on logic puzzles and strategy games',
              'Analyze case studies systematically'
            ]
          : [
              'Engage in brainstorming exercises',
              'Try creative problem-solving challenges',
              'Explore different perspectives on familiar topics'
            ]
      });
    }
  }

  // Determine learning pathway based on profile
  let learningPathway: AIProfileInterpretation['learningPathway'];

  if (profile.role === 'student' && profile.age && profile.age < 18) {
    learningPathway = {
      stage: 'Foundation Building',
      focus: 'Developing core cognitive skills and learning strategies',
      reasoning: 'As a young learner, building strong foundational skills across all areas creates long-term success.'
    };
  } else if (profile.role === 'professional') {
    learningPathway = {
      stage: 'Optimization & Application',
      focus: 'Leveraging strengths in professional contexts',
      reasoning: 'Focus on applying your cognitive profile to improve workplace performance and leadership.'
    };
  } else {
    learningPathway = {
      stage: 'Balanced Development',
      focus: 'Strengthening weak areas while maintaining strengths',
      reasoning: 'A balanced approach ensures comprehensive cognitive development.'
    };
  }

  // Generate summary
  const summary = `Based on your assessment results, you show ${strengths.length} key strength${strengths.length !== 1 ? 's' : ''} and ${developmentAreas.length} area${developmentAreas.length !== 1 ? 's' : ''} for growth. ${learningPathway.focus} will help you maximize your learning potential.`;

  return {
    summary,
    strengths,
    developmentAreas,
    learningPathway,
    personalizedInsights: insights
  };
}

/**
 * Generate personalized recommendations with explainable reasoning
 */
export function generateRecommendations(userId: string, profile: UserProfile): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const scores = profile.assessmentScores;

  if (!scores) return recommendations;

  // Learning-based recommendations
  if (scores.learning) {
    const visualScore = scores.learning.visual || 0;
    const auditoryScore = scores.learning.auditory || 0;
    const kinestheticScore = scores.learning.kinesthetic || 0;

    // Recommend activities aligned with learning style
    if (visualScore > 70) {
      recommendations.push({
        id: `rec-visual-${Date.now()}`,
        type: 'activity',
        title: 'Visual Mind Mapping',
        description: 'Create visual mind maps to organize and connect concepts',
        reasoning: 'Your high visual learning score (${visualScore}%) indicates you process visual information effectively. Mind mapping leverages this strength.',
        relevanceScore: Math.min(95, visualScore + 15),
        priority: 'high',
        estimatedTime: 20,
        category: 'Study Technique',
        evidence: [
          `Visual learning score: ${visualScore}%`,
          'Research shows visual learners retain 65% more with diagrams',
          'Your profile indicates preference for spatial organization'
        ]
      });
    }

    // Recommend development in weaker areas
    if (auditoryScore < 50) {
      recommendations.push({
        id: `rec-auditory-${Date.now()}`,
        type: 'lesson',
        title: 'Auditory Learning Strategies',
        description: 'Develop listening and verbal processing skills',
        reasoning: `Your auditory score (${auditoryScore}%) suggests room for growth. Strengthening this creates more flexible learning options.`,
        relevanceScore: 100 - auditoryScore,
        priority: 'medium',
        estimatedTime: 15,
        category: 'Skill Development',
        evidence: [
          `Auditory learning score: ${auditoryScore}%`,
          'Gap identified compared to visual (${visualScore}%)',
          'Developing multiple learning channels improves adaptability'
        ]
      });
    }
  }

  // Thinking-based recommendations
  if (scores.thinking) {
    const analyticalScore = scores.thinking.analytical || 0;
    const creativeScore = scores.thinking.creative || 0;

    if (analyticalScore > 70 && creativeScore < 60) {
      recommendations.push({
        id: `rec-creative-${Date.now()}`,
        type: 'activity',
        title: 'Creative Problem-Solving Workshop',
        description: 'Balance analytical strength with creative thinking exercises',
        reasoning: `You excel in analytical thinking (${analyticalScore}%) but have room to grow in creativity (${creativeScore}%). This creates cognitive balance.`,
        relevanceScore: 85,
        priority: 'high',
        estimatedTime: 30,
        category: 'Cognitive Development',
        evidence: [
          `Analytical: ${analyticalScore}%, Creative: ${creativeScore}%`,
          'Research shows balanced thinking improves innovation',
          'Your analytical strength provides foundation for structured creativity'
        ]
      });
    }

    if (creativeScore > 70) {
      recommendations.push({
        id: `rec-creative-app-${Date.now()}`,
        type: 'resource',
        title: 'Innovation Challenges',
        description: 'Apply creative thinking to real-world problems',
        reasoning: `With your strong creative thinking (${creativeScore}%), you\'re ready for advanced innovation challenges.`,
        relevanceScore: creativeScore,
        priority: 'medium',
        estimatedTime: 45,
        category: 'Advanced Application',
        evidence: [
          `Creative thinking score: ${creativeScore}%`,
          'High creativity benefits from practical application',
          'Builds portfolio and real-world skills'
        ]
      });
    }
  }

  // Decision-based recommendations
  if (scores.decision) {
    const intuitiveScore = scores.decision.intuitive || 0;
    const analyticalDecisionScore = scores.decision.analytical || 0;

    if (intuitiveScore > 70) {
      recommendations.push({
        id: `rec-intuition-${Date.now()}`,
        type: 'habit',
        title: 'Intuition Journaling',
        description: 'Track and reflect on intuitive decisions',
        reasoning: `Your intuitive decision-making (${intuitiveScore}%) is a strength. Journaling helps refine this skill with conscious reflection.`,
        relevanceScore: intuitiveScore,
        priority: 'medium',
        estimatedTime: 10,
        category: 'Self-Awareness',
        evidence: [
          `Intuitive decision score: ${intuitiveScore}%`,
          'Reflection strengthens pattern recognition',
          'Combines intuition with analytical review'
        ]
      });
    }
  }

  // Sort by relevance and priority
  return recommendations.sort((a, b) => {
    if (a.priority !== b.priority) {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.relevanceScore - a.relevanceScore;
  });
}

/**
 * Rank and filter recommendations based on user context
 */
export function rankRecommendations(
  recommendations: Recommendation[],
  userContext: {
    availableTime?: number; // minutes
    recentActivities?: string[];
    goals?: string[];
  }
): Recommendation[] {
  let ranked = [...recommendations];

  // Filter by available time if specified
  if (userContext.availableTime) {
    ranked = ranked.filter(rec =>
      !rec.estimatedTime || rec.estimatedTime <= userContext.availableTime
    );
  }

  // Deprioritize recently completed activities
  if (userContext.recentActivities && userContext.recentActivities.length > 0) {
    ranked = ranked.map(rec => {
      if (userContext.recentActivities!.includes(rec.category)) {
        return { ...rec, relevanceScore: rec.relevanceScore * 0.7 };
      }
      return rec;
    });
  }

  // Boost recommendations aligned with goals
  if (userContext.goals && userContext.goals.length > 0) {
    ranked = ranked.map(rec => {
      const alignsWithGoals = userContext.goals!.some(goal =>
        rec.title.toLowerCase().includes(goal.toLowerCase()) ||
        rec.category.toLowerCase().includes(goal.toLowerCase())
      );
      if (alignsWithGoals) {
        return { ...rec, relevanceScore: Math.min(100, rec.relevanceScore * 1.3) };
      }
      return rec;
    });
  }

  // Re-sort by updated relevance scores
  return ranked.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Generate AI-powered study plan
 */
export function generateStudyPlan(
  userId: string,
  profile: UserProfile,
  duration: number, // minutes
  focus?: string
): StudySession {
  const activities: StudySession['activities'] = [];
  let remainingTime = duration;

  // Warm-up (10% of time, min 5 mins)
  const warmupTime = Math.max(5, Math.floor(duration * 0.1));
  activities.push({
    type: 'warmup',
    name: 'Cognitive Warm-up',
    duration: warmupTime,
    reasoning: 'Brief activation exercises prepare your brain for focused learning. This aligns with cognitive science on attention priming.'
  });
  remainingTime -= warmupTime;

  // Main learning (60% of time)
  const mainLearningTime = Math.floor(remainingTime * 0.6);

  if (focus === 'strength-building' || !focus) {
    const primaryStrength = profile.assessmentScores?.learning?.visual || 0 > 70 ? 'visual' : 'auditory';
    activities.push({
      type: 'focused-learning',
      name: `${primaryStrength.charAt(0).toUpperCase() + primaryStrength.slice(1)} Learning Session`,
      duration: mainLearningTime,
      reasoning: `Leverages your ${primaryStrength} learning strength (${profile.assessmentScores?.learning?.[primaryStrength]}%) for efficient learning.`
    });
  } else {
    activities.push({
      type: 'focused-learning',
      name: 'Targeted Skill Development',
      duration: mainLearningTime,
      reasoning: `Focused practice on ${focus} with techniques matched to your cognitive profile.`
    });
  }
  remainingTime -= mainLearningTime;

  // Practice (20% of time)
  const practiceTime = Math.floor(remainingTime * 0.67);
  activities.push({
    type: 'practice',
    name: 'Active Practice',
    duration: practiceTime,
    reasoning: 'Immediate application reinforces learning through retrieval practice, which cognitive science shows improves retention by 50%.'
  });
  remainingTime -= practiceTime;

  // Review (remaining time)
  activities.push({
    type: 'review',
    name: 'Reflection & Review',
    duration: remainingTime,
    reasoning: 'Consolidates learning and identifies gaps. Metacognitive reflection is proven to improve long-term retention.'
  });

  return {
    id: `study-session-${Date.now()}`,
    title: `${duration}-Minute Personalized Study Session`,
    description: `AI-optimized study plan based on your cognitive profile`,
    duration,
    activities,
    reasoning: `This plan is tailored to your learning style and cognitive strengths. The ${warmupTime}-${mainLearningTime}-${practiceTime} structure follows evidence-based learning principles.`,
    expectedOutcomes: [
      'Enhanced retention through spaced practice',
      'Improved focus with structured time blocks',
      'Better understanding through active application',
      'Stronger metacognitive awareness'
    ]
  };
}

/**
 * Generate smart reminders based on user behavior and patterns
 */
export function generateSmartReminders(
  userId: string,
  userBehavior: {
    lastLogin?: Date;
    currentStreak?: number;
    completedLessonsToday?: number;
    preferredStudyTime?: string; // 'morning' | 'afternoon' | 'evening'
    assessmentProgress?: number; // 0-100
  }
): SmartReminder[] {
  const reminders: SmartReminder[] = [];
  const now = new Date();

  // Streak maintenance reminder
  if (userBehavior.currentStreak && userBehavior.currentStreak >= 3) {
    const lastLogin = userBehavior.lastLogin || new Date();
    const hoursSinceLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLogin > 20 && hoursSinceLogin < 24) {
      reminders.push({
        id: `reminder-streak-${Date.now()}`,
        type: 'streak',
        message: `You're on a ${userBehavior.currentStreak}-day streak! Complete a quick lesson to keep it going.`,
        reasoning: `Research shows maintaining streaks increases long-term engagement by 78%. Your ${userBehavior.currentStreak}-day streak represents significant investment worth protecting.`,
        priority: 'high'
      });
    }
  }

  // Break reminder if too much activity
  if (userBehavior.completedLessonsToday && userBehavior.completedLessonsToday >= 5) {
    reminders.push({
      id: `reminder-break-${Date.now()}`,
      type: 'break',
      message: 'Great progress today! Consider taking a break to consolidate your learning.',
      reasoning: 'Cognitive science shows that spaced learning with breaks improves retention by 40% compared to massed practice. You\'ve completed ${userBehavior.completedLessonsToday} lessons today.',
      priority: 'medium'
    });
  }

  // Assessment completion reminder
  if (userBehavior.assessmentProgress !== undefined && userBehavior.assessmentProgress < 100 && userBehavior.assessmentProgress > 0) {
    reminders.push({
      id: `reminder-assessment-${Date.now()}`,
      type: 'assessment',
      message: 'Complete your remaining assessments to unlock your full cognitive profile.',
      reasoning: `You're ${userBehavior.assessmentProgress}% complete. Finishing all three assessments provides comprehensive insights and unlocks personalized recommendations.`,
      priority: userBehavior.assessmentProgress > 66 ? 'high' : 'medium'
    });
  }

  // Optimal study time reminder
  if (userBehavior.preferredStudyTime) {
    const currentHour = now.getHours();
    const isOptimalTime =
      (userBehavior.preferredStudyTime === 'morning' && currentHour >= 6 && currentHour < 12) ||
      (userBehavior.preferredStudyTime === 'afternoon' && currentHour >= 12 && currentHour < 17) ||
      (userBehavior.preferredStudyTime === 'evening' && currentHour >= 17 && currentHour < 22);

    if (isOptimalTime && (!userBehavior.completedLessonsToday || userBehavior.completedLessonsToday === 0)) {
      reminders.push({
        id: `reminder-optimal-time-${Date.now()}`,
        type: 'lesson',
        message: 'It\'s your optimal learning time! Start a quick lesson.',
        reasoning: `Based on your activity patterns, you typically learn best during the ${userBehavior.preferredStudyTime}. Studying during your peak cognitive hours improves retention.`,
        priority: 'medium'
      });
    }
  }

  return reminders.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Get AI learning coach insights
 */
export function getCoachInsights(
  userId: string,
  profile: UserProfile,
  recentActivity: {
    lessonsCompleted: number;
    averageAccuracy: number;
    timeSpent: number; // minutes
    strugglingAreas?: string[];
  }
): {
  message: string;
  insights: string[];
  encouragement: string;
  nextSteps: string[];
} {
  const insights: string[] = [];
  const nextSteps: string[] = [];

  // Performance analysis
  if (recentActivity.averageAccuracy >= 85) {
    insights.push(`Your ${recentActivity.averageAccuracy}% accuracy shows strong understanding. You're ready for more challenging material.`);
    nextSteps.push('Try advanced lessons in your strength areas');
  } else if (recentActivity.averageAccuracy < 60) {
    insights.push(`Your ${recentActivity.averageAccuracy}% accuracy suggests these concepts need more practice. This is normal and expected in the learning process.`);
    nextSteps.push('Review foundational concepts before moving forward');
    nextSteps.push('Break complex topics into smaller chunks');
  }

  // Time management
  if (recentActivity.timeSpent > 120) {
    insights.push(`You've invested ${recentActivity.timeSpent} minutes - impressive dedication! Remember to take breaks for optimal retention.`);
    nextSteps.push('Schedule 5-10 minute breaks between sessions');
  }

  // Consistency
  if (recentActivity.lessonsCompleted >= 3) {
    insights.push(`Completing ${recentActivity.lessonsCompleted} lessons shows excellent consistency. Regular practice builds strong neural pathways.`);
  }

  // Struggling areas
  if (recentActivity.strugglingAreas && recentActivity.strugglingAreas.length > 0) {
    insights.push(`I notice challenges in ${recentActivity.strugglingAreas.join(', ')}. These areas often require different learning approaches.`);
    nextSteps.push(`Focus on ${recentActivity.strugglingAreas[0]} with your strongest learning style`);
  }

  const encouragement = recentActivity.averageAccuracy >= 75
    ? 'You\'re making excellent progress! Your effort is translating into real skill development.'
    : 'Keep going! Every lesson, even the challenging ones, is building your cognitive abilities.';

  return {
    message: `Based on your recent activity (${recentActivity.lessonsCompleted} lessons, ${recentActivity.averageAccuracy}% avg accuracy), here's what I'm observing:`,
    insights,
    encouragement,
    nextSteps
  };
}
