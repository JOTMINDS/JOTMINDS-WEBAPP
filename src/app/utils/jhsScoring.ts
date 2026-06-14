// JHS Thinking Styles Scoring Algorithm

export interface JHSScores {
  creative: number;
  analytical: number;
  practical: number;
  reflective: number;
}

export interface JHSResults {
  scores: JHSScores;
  percentages: JHSScores;
  strengthLevels: Record<string, string>;
  primaryStyle: string;
  secondaryStyle: string;
  profileType: 'single' | 'dual' | 'balanced';
  personalityType: string;
  recommendations: string[];
}

export function calculateJHSScores(responses: number[]): JHSResults {
  // Each section has 6 questions (score range 6-30)
  const creative = responses.slice(0, 6).reduce((sum, val) => sum + val, 0);
  const analytical = responses.slice(6, 12).reduce((sum, val) => sum + val, 0);
  const practical = responses.slice(12, 18).reduce((sum, val) => sum + val, 0);
  const reflective = responses.slice(18, 24).reduce((sum, val) => sum + val, 0);

  const scores: JHSScores = {
    creative,
    analytical,
    practical,
    reflective
  };

  // Calculate percentages (out of 30)
  const percentages: JHSScores = {
    creative: Math.round((creative / 30) * 100),
    analytical: Math.round((analytical / 30) * 100),
    practical: Math.round((practical / 30) * 100),
    reflective: Math.round((reflective / 30) * 100)
  };

  // Determine strength levels
  const strengthLevels: Record<string, string> = {};
  for (const [key, value] of Object.entries(scores)) {
    if (value >= 24) {
      strengthLevels[key] = '🌟 Strong Thinker — Natural talent!';
    } else if (value >= 18) {
      strengthLevels[key] = '👍 Growing Thinker — Getting better every day!';
    } else if (value >= 12) {
      strengthLevels[key] = '🙂 Developing Thinker — Keep practicing this skill!';
    } else {
      strengthLevels[key] = '🌱 Emerging Thinker — Ready to explore more!';
    }
  }

  // Find primary and secondary styles
  const sortedStyles = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([style]) => style);

  const primaryStyle = sortedStyles[0];
  const secondaryStyle = sortedStyles[1];

  const primaryScore = scores[primaryStyle as keyof JHSScores];
  const secondaryScore = scores[secondaryStyle as keyof JHSScores];
  const difference = primaryScore - secondaryScore;

  // Determine profile type
  let profileType: 'single' | 'dual' | 'balanced' = 'single';
  let personalityType = '';

  if (difference <= 2) {
    // Co-dominant
    profileType = 'dual';
    const combo = [primaryStyle, secondaryStyle].sort().join('-');
    personalityType = getPersonalityType(combo);
  } else {
    const max = Math.max(...Object.values(scores));
    const min = Math.min(...Object.values(scores));
    if (max - min <= 4) {
      profileType = 'balanced';
      personalityType = 'Balanced Thinker';
    } else {
      profileType = 'single';
      personalityType = getFriendlyName(primaryStyle);
    }
  }

  // Get recommendations
  const recommendations = getSHSRecommendations(primaryStyle, secondaryStyle, profileType);

  return {
    scores,
    percentages,
    strengthLevels,
    primaryStyle,
    secondaryStyle,
    profileType,
    personalityType,
    recommendations
  };
}

function getPersonalityType(combo: string): string {
  const types: Record<string, string> = {
    'analytical-creative': 'Inventive Thinker',
    'analytical-reflective': 'Insightful Thinker',
    'creative-practical': 'Innovator / Builder',
    'creative-reflective': 'Empathetic Creator',
    'analytical-practical': 'Logical Problem Solver',
    'practical-reflective': 'Thoughtful Doer'
  };
  return types[combo] || 'Unique Thinker';
}

function getFriendlyName(style: string): string {
  const names: Record<string, string> = {
    creative: 'The Idea Explorer',
    analytical: 'The Smart Detective',
    practical: 'The Real-World Builder',
    reflective: 'The Wise Observer'
  };
  return names[style] || style;
}

function getSHSRecommendations(
  primary: string,
  secondary: string,
  type: 'single' | 'dual' | 'balanced'
): string[] {
  if (type === 'balanced') {
    return [
      'General Arts',
      'General Science',
      'Business'
    ];
  }

  if (type === 'dual') {
    const combo = [primary, secondary].sort().join('-');
    const programs: Record<string, string[]> = {
      'analytical-creative': ['General Science', 'ICT / Computer Science', 'Design Technology'],
      'analytical-reflective': ['General Arts', 'Education', 'Health Science'],
      'creative-practical': ['Visual Arts', 'Technical / Vocational', 'Home Economics'],
      'creative-reflective': ['General Arts', 'Languages', 'Home Economics'],
      'analytical-practical': ['General Science', 'Technical Science', 'ICT'],
      'practical-reflective': ['Health Science', 'Agriculture Science', 'Education']
    };
    return programs[combo] || ['General Arts', 'General Science', 'Business'];
  }

  // Single dominant style
  const recommendations: Record<string, string[]> = {
    creative: ['Visual Arts', 'Home Economics (Creative Design)', 'General Arts (Communication)'],
    analytical: ['General Science', 'ICT / Computer Science', 'Business'],
    practical: ['Technical / Vocational', 'Agricultural Science', 'Business (Entrepreneurship)'],
    reflective: ['Health Science / Home Economics', 'General Arts (Social Studies)', 'Education']
  };

  return recommendations[primary] || ['General Arts', 'General Science', 'Business'];
}

export function getStrengthDescription(score: number): string {
  if (score >= 24) {
    return '🌟 Strong Thinker — Natural talent!';
  } else if (score >= 18) {
    return '👍 Growing Thinker — Getting better every day!';
  } else if (score >= 12) {
    return '🙂 Developing Thinker — Keep practicing this skill!';
  } else {
    return '🌱 Emerging Thinker — Ready to explore more!';
  }
}
