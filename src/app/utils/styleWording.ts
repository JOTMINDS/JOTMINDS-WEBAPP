/**
 * Style Wording & Translation Utility
 *
 * Provides clear, accessible, and intuitive everyday phrases for cognitive assessment styles,
 * replacing confusing academic jargon (e.g. "Accommodating", "Assimilating", "Converging", "Diverging")
 * with human-friendly descriptions that students, parents, teachers, and professionals immediately grasp.
 */

export interface FriendlyStyleInfo {
  key: string;
  friendlyName: string;
  shortTag: string;
  subtitle: string;
  plainEnglishDescription: string;
  actionStrengths: string[];
  bestWayToLearn: string;
  badgeLabel: string;
  academicReference: string;
}

const NORM = (str?: string) => (str || '').trim().toLowerCase();

const KOLB_STYLES: Record<string, FriendlyStyleInfo> = {
  accommodating: {
    key: 'Accommodating',
    friendlyName: 'Hands-On Explorer',
    shortTag: 'Doing & Action',
    subtitle: 'Learns best by jumping into action, trying things out, and learning through real-world experience.',
    plainEnglishDescription:
      'You are an active, experiential learner. Instead of sitting through prolonged lectures or heavy theory, you thrive when you can touch, build, test, and figure things out through real trial, movement, and practice.',
    actionStrengths: [
      'Quick to take action and experiment with new ideas',
      'Highly adaptable and flexible when situations change',
      'Learns rapidly through real-world trial and error',
    ],
    bestWayToLearn:
      'Focus on hands-on projects, interactive labs, building physical or digital models, and learning by doing rather than just reading notes.',
    badgeLabel: 'Hands-On Explorer',
    academicReference: 'Accommodating (Experiential & Active)',
  },
  assimilating: {
    key: 'Assimilating',
    friendlyName: 'Logical Thinker',
    shortTag: 'Concepts & Logic',
    subtitle: 'Learns best by understanding big ideas, organized theories, and clear logical explanations.',
    plainEnglishDescription:
      'You excel at understanding how complex ideas fit together. You appreciate clear explanations, organized reading, and logical models, and you love organizing information into systematic frameworks and meaningful concepts.',
    actionStrengths: [
      'Exceptional at understanding complex concepts, models, and theories',
      'Synthesizes and structures information into clear logical order',
      'Approaches learning and problem solving with deep, methodical analysis',
    ],
    bestWayToLearn:
      'Create structured notes, concept maps, and summary charts. Focus on understanding the "why" and overarching logic before diving into details.',
    badgeLabel: 'Logical Thinker',
    academicReference: 'Assimilating (Conceptual & Reflective)',
  },
  converging: {
    key: 'Converging',
    friendlyName: 'Practical Problem-Solver',
    shortTag: 'Solutions & Application',
    subtitle: 'Learns best by taking ideas and applying them to solve practical, real-world problems.',
    plainEnglishDescription:
      'You love turning ideas into workable solutions. You take theories and logic and immediately look for how to put them to work to fix problems, make things run smoothly, and achieve tangible results.',
    actionStrengths: [
      'Direct, goal-oriented problem solver who cuts to workable answers',
      'Decisive and skilled at technical and practical decision-making',
      'Quickly applies knowledge and ideas to real-life situations',
    ],
    bestWayToLearn:
      'Work through practice problems, real-world case studies, simulations, and goal-oriented challenges with clear practical outcomes.',
    badgeLabel: 'Practical Problem-Solver',
    academicReference: 'Converging (Analytical & Applied)',
  },
  diverging: {
    key: 'Diverging',
    friendlyName: 'Creative Brainstormer',
    shortTag: 'Ideas & Perspectives',
    subtitle: 'Learns best by observing, exploring multiple viewpoints, and generating creative ideas.',
    plainEnglishDescription:
      'You have an imaginative, reflective mind. You learn best by watching, listening, and discussing with others, excelling at seeing situations from multiple perspectives and coming up with fresh, creative ideas.',
    actionStrengths: [
      'Generates rich, imaginative ideas and original solutions',
      'Sees situations and problems from many different angles and viewpoints',
      'Empathetic, collaborative, and works wonderfully in group discussions',
    ],
    bestWayToLearn:
      'Use brainstorming sessions, group discussions, visual mind maps, and give yourself time to reflect and explore possibilities before acting.',
    badgeLabel: 'Creative Brainstormer',
    academicReference: 'Diverging (Creative & Reflective)',
  },
};

const STERNBERG_STYLES: Record<string, FriendlyStyleInfo> = {
  analytical: {
    key: 'Analytical',
    friendlyName: 'Critical Thinker',
    shortTag: 'Analysis & Logic',
    subtitle: 'Breaks problems down, weighs evidence, and evaluates logic step by step.',
    plainEnglishDescription:
      'You shine when analyzing, comparing, and judging information. You excel at taking complicated problems apart to understand how each piece works and finding the most logical path forward.',
    actionStrengths: [
      'Strong critical thinking and logical evaluation',
      'Breaks complex problems down into manageable pieces',
      'Weighs evidence objectively before drawing conclusions',
    ],
    bestWayToLearn: 'Compare and contrast ideas, evaluate arguments, and test claims with logic and evidence.',
    badgeLabel: 'Critical Thinker',
    academicReference: 'Analytical Intelligence',
  },
  creative: {
    key: 'Creative',
    friendlyName: 'Innovative Creator',
    shortTag: 'Ideas & Innovation',
    subtitle: 'Generates original ideas, envisions new possibilities, and creates novel solutions.',
    plainEnglishDescription:
      'You are imaginative and resourceful. You enjoy thinking outside conventional boundaries, connecting unconnected ideas, and designing original answers to challenges.',
    actionStrengths: [
      'Abundant imagination and original thinking',
      'Finds unexpected connections between different concepts',
      'Thrives when given freedom to explore new possibilities',
    ],
    bestWayToLearn: 'Experiment with creative projects, brainstorming, and open-ended exploration.',
    badgeLabel: 'Innovative Creator',
    academicReference: 'Creative Intelligence',
  },
  practical: {
    key: 'Practical',
    friendlyName: 'Real-World Achiever',
    shortTag: 'Practical Application',
    subtitle: 'Applies knowledge to daily life, focusing on common sense and what works.',
    plainEnglishDescription:
      'You focus on real-world usefulness. You excel at taking ideas and putting them into practice, adapting to everyday situations, and getting things done effectively.',
    actionStrengths: [
      'Pragmatic, common-sense approach to challenges',
      'Translates textbook knowledge into real everyday action',
      'Resourceful and highly effective at getting results',
    ],
    bestWayToLearn: 'Connect every topic to how it is used in real jobs, daily life, and tangible projects.',
    badgeLabel: 'Real-World Achiever',
    academicReference: 'Practical Intelligence',
  },
};

const DUAL_PROCESS_STYLES: Record<string, FriendlyStyleInfo> = {
  intuitive: {
    key: 'Intuitive',
    friendlyName: 'Instinctive Decision-Maker',
    shortTag: 'Rapid Instinct',
    subtitle: 'Makes quick, confident choices using pattern recognition and gut instinct.',
    plainEnglishDescription:
      'You make rapid, instinctive judgments based on deep pattern recognition and experience. You excel at quick thinking and moving fast under pressure.',
    actionStrengths: ['Quick decision-making in fast-moving environments', 'Strong intuition and pattern recognition', 'Comfortable acting under uncertainty'],
    bestWayToLearn: 'Trust your intuition while creating quick checklists for high-stakes decisions.',
    badgeLabel: 'Instinctive Decision-Maker',
    academicReference: 'Intuitive Processing (System 1)',
  },
  reflective: {
    key: 'Reflective',
    friendlyName: 'Deliberate Decision-Maker',
    shortTag: 'Careful Analysis',
    subtitle: 'Weighs evidence and carefully analyzes choices before making decisions.',
    plainEnglishDescription:
      'You prefer to pause, gather the facts, and think things through carefully. You make deliberate, well-considered choices that minimize risk.',
    actionStrengths: ['Thorough evaluation of evidence and options', 'Careful, risk-conscious decision-making', 'Resistant to hasty impulses'],
    bestWayToLearn: 'Give yourself time to analyze data and weigh alternatives before deciding.',
    badgeLabel: 'Deliberate Decision-Maker',
    academicReference: 'Deliberate Processing (System 2)',
  },
  deliberate: {
    key: 'Deliberate',
    friendlyName: 'Deliberate Decision-Maker',
    shortTag: 'Careful Analysis',
    subtitle: 'Weighs evidence and carefully analyzes choices before making decisions.',
    plainEnglishDescription:
      'You prefer to pause, gather the facts, and think things through carefully. You make deliberate, well-considered choices that minimize risk.',
    actionStrengths: ['Thorough evaluation of evidence and options', 'Careful, risk-conscious decision-making', 'Resistant to hasty impulses'],
    bestWayToLearn: 'Give yourself time to analyze data and weigh alternatives before deciding.',
    badgeLabel: 'Deliberate Decision-Maker',
    academicReference: 'Deliberate Processing (System 2)',
  },
  balanced: {
    key: 'Balanced',
    friendlyName: 'Adaptive Decision-Maker',
    shortTag: 'Instinct & Analysis',
    subtitle: 'Skillfully balances fast intuition with careful analysis depending on the situation.',
    plainEnglishDescription:
      'You use both instinct and careful thought with ease. You can make quick judgment calls when time is short, but switch to deep analysis when the stakes are high.',
    actionStrengths: ['Flexible and context-aware judgment', 'Balances speed with accuracy', 'High decision agility'],
    bestWayToLearn: 'Continue matching your decision approach to the complexity and urgency of the task.',
    badgeLabel: 'Adaptive Decision-Maker',
    academicReference: 'Dual-Process Balanced',
  },
};

const DIMENSIONS: Record<string, { friendlyName: string; subtitle: string; description: string }> = {
  ce: {
    friendlyName: 'Hands-On Experience',
    subtitle: 'Learning through direct feeling, doing, and real experience',
    description: 'Learning through real-life action, personal experience, and direct engagement.',
  },
  'concrete experience': {
    friendlyName: 'Hands-On Experience',
    subtitle: 'Learning through direct feeling, doing, and real experience',
    description: 'Learning through real-life action, personal experience, and direct engagement.',
  },
  ro: {
    friendlyName: 'Thoughtful Observation',
    subtitle: 'Learning through watching, listening, and reflecting carefully',
    description: 'Learning by stepping back, watching carefully, and thinking things through.',
  },
  'reflective observation': {
    friendlyName: 'Thoughtful Observation',
    subtitle: 'Learning through watching, listening, and reflecting carefully',
    description: 'Learning by stepping back, watching carefully, and thinking things through.',
  },
  ac: {
    friendlyName: 'Logical Concepts',
    subtitle: 'Learning through theories, models, and systematic analysis',
    description: 'Learning through theories, logical frameworks, and structured ideas.',
  },
  'abstract conceptualization': {
    friendlyName: 'Logical Concepts',
    subtitle: 'Learning through theories, models, and systematic analysis',
    description: 'Learning through theories, logical frameworks, and structured ideas.',
  },
  ae: {
    friendlyName: 'Practical Action',
    subtitle: 'Learning through testing ideas out, experimenting, and doing',
    description: 'Learning by putting ideas to the test and seeing what works in practice.',
  },
  'active experimentation': {
    friendlyName: 'Practical Action',
    subtitle: 'Learning through testing ideas out, experimenting, and doing',
    description: 'Learning by putting ideas to the test and seeing what works in practice.',
  },
};

/**
 * Returns full friendly style metadata for any style string (Kolb, Sternberg, Dual-Process).
 */
export function getFriendlyStyleInfo(style?: string): FriendlyStyleInfo {
  const norm = NORM(style);
  if (!norm) {
    return {
      key: 'Balanced',
      friendlyName: 'Balanced Learner',
      shortTag: 'Adaptive',
      subtitle: 'Draws on multiple approaches to learn and solve problems effectively.',
      plainEnglishDescription:
        'You have a versatile profile that draws on different strengths as needed, adapting well to diverse tasks.',
      actionStrengths: ['Flexible and adaptable', 'Draws on multiple approaches', 'Versatile across different topics'],
      bestWayToLearn: 'Mix hands-on activities, conceptual reading, and collaborative study.',
      badgeLabel: 'Balanced Learner',
      academicReference: 'Adaptive',
    };
  }

  if (KOLB_STYLES[norm]) return KOLB_STYLES[norm];
  if (STERNBERG_STYLES[norm]) return STERNBERG_STYLES[norm];
  if (DUAL_PROCESS_STYLES[norm]) return DUAL_PROCESS_STYLES[norm];

  // Fallback for custom or composite styles
  const clean = style || 'Adaptive';
  return {
    key: clean,
    friendlyName: clean,
    shortTag: 'Cognitive Profile',
    subtitle: `Unique cognitive approach tailored to ${clean}.`,
    plainEnglishDescription: `Your responses highlight a distinct ${clean} profile. You thrive when your environment supports your natural way of thinking and learning.`,
    actionStrengths: ['Distinct cognitive perspective', 'Strengths tailored to your profile', 'Strong personal focus'],
    bestWayToLearn: 'Align your study strategies with what feels most natural and effective for you.',
    badgeLabel: clean,
    academicReference: clean,
  };
}

/**
 * Get the user-friendly name for a style (e.g. "Accommodating" -> "Hands-On Explorer")
 */
export function getFriendlyStyleName(style?: string): string {
  return getFriendlyStyleInfo(style).friendlyName;
}

/**
 * Get a friendly formatted display string:
 * e.g. "Hands-On Explorer (Doing & Action)" or "Hands-On Explorer (Accommodating)"
 */
export function getFriendlyStyleDisplay(
  style?: string,
  options?: { showAcademic?: boolean; showTag?: boolean }
): string {
  if (!style) return 'Assessment Profile';
  const info = getFriendlyStyleInfo(style);
  const raw = style.trim();

  // If already friendly, return as is
  if (raw === info.friendlyName) return raw;

  if (options?.showAcademic) {
    return `${info.friendlyName} (${info.key})`;
  }
  if (options?.showTag) {
    return `${info.friendlyName} (${info.shortTag})`;
  }
  return `${info.friendlyName} (${info.key})`;
}

/**
 * Get the short friendly subtitle for a style
 */
export function getFriendlyStyleSubtitle(style?: string): string {
  return getFriendlyStyleInfo(style).subtitle;
}

/**
 * Get the plain English description for a style
 */
export function getFriendlyStyleDescription(framework: string, style?: string): string {
  const info = getFriendlyStyleInfo(style);
  return info.plainEnglishDescription;
}

/**
 * Get friendly wording for a score dimension (e.g. "Abstract Conceptualization" -> "Logical Concepts")
 */
export function getFriendlyDimensionName(dimKey: string): string {
  const norm = NORM(dimKey);
  return DIMENSIONS[norm]?.friendlyName || dimKey;
}

/**
 * Get dimension description
 */
export function getFriendlyDimensionDescription(dimKey: string): string {
  const norm = NORM(dimKey);
  return DIMENSIONS[norm]?.description || '';
}

/**
 * Formats a Kolb style string safely into friendly wording everywhere
 */
export function formatKolbStyle(style?: string, withOriginal = true): string {
  if (!style) return 'Learning Style';
  const info = getFriendlyStyleInfo(style);
  if (withOriginal && info.key !== info.friendlyName) {
    return `${info.friendlyName} (${info.key})`;
  }
  return info.friendlyName;
}
