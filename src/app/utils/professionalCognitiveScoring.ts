import { ProfessionalAssessmentResponses } from '../components/ProfessionalCognitiveAssessment';

export interface ProfessionalCognitiveProfile {
  learning: {
    score: number;
    style: string;
    anchors: string;
    description: string;
  };
  thinking: {
    score: number;
    style: string;
    anchors: string;
    description: string;
  };
  decisionMaking: {
    score: number;
    style: string;
    anchors: string;
    description: string;
  };
  motivation?: {
    score: number;
    style: string;
    anchors: string;
    description: string;
  };
  overallProfile: string;
  summary: string;
  matchScore: number;
}

export function calculateProfessionalCognitiveProfile(
  responses: ProfessionalAssessmentResponses
): ProfessionalCognitiveProfile {
  
  // Calculate Learning Style
  const learningScore = responses.learning.reduce((sum, val) => sum + val, 0);
  const learningStyle = getLearningStyle(learningScore);
  
  // Calculate Thinking Style
  const thinkingScore = responses.thinking.reduce((sum, val) => sum + val, 0);
  const thinkingStyle = getThinkingStyle(thinkingScore);
  
  // Calculate Decision-Making Style
  const decisionScore = responses.decisionMaking.reduce((sum, val) => sum + val, 0);
  const decisionStyle = getDecisionMakingStyle(decisionScore);
  
  // Calculate Motivation Style (if available)
  let motivationStyle = null;
  if (responses.motivation && responses.motivation.length > 0) {
    const motivationScore = responses.motivation.reduce((sum, val) => sum + val, 0);
    motivationStyle = getMotivationStyle(motivationScore);
  }
  
  // Generate overall profile
  const overallProfile = `${learningStyle.style} | ${thinkingStyle.style} | ${decisionStyle.style}`;
  
  // Generate summary
  const summary = generateSummary(learningStyle, thinkingStyle, decisionStyle);
  
  // Calculate match score (based on balance and strength across dimensions)
  const matchScore = calculateMatchScore(learningScore, thinkingScore, decisionScore);
  
  return {
    learning: learningStyle,
    thinking: thinkingStyle,
    decisionMaking: decisionStyle,
    motivation: motivationStyle || undefined,
    overallProfile,
    summary,
    matchScore
  };
}

function getLearningStyle(score: number) {
  if (score >= 24) {
    return {
      score,
      style: 'Hands-On Learner',
      anchors: 'Curious · Practical · Engaged',
      description: 'Learns best by doing, testing, and applying directly. Thrives in experiential environments with immediate feedback.'
    };
  } else if (score >= 18) {
    return {
      score,
      style: 'Analytical Learner',
      anchors: 'Thoughtful · Precise · Evaluative',
      description: 'Prefers analysis and structure before acting. Excels at observing and reflecting on information systematically.'
    };
  } else if (score >= 12) {
    return {
      score,
      style: 'Conceptual Planner',
      anchors: 'Strategic · Visionary · Logical',
      description: 'Enjoys theories, models, and connecting concepts. Builds frameworks to understand the big picture.'
    };
  } else {
    return {
      score,
      style: 'Developing Learner',
      anchors: 'Reserved · Observant · Dependent',
      description: 'Learns best with structured guidance and examples. Benefits from mentorship and clear direction.'
    };
  }
}

function getThinkingStyle(score: number) {
  if (score >= 24) {
    return {
      score,
      style: 'Creative–Analytical Thinker',
      anchors: 'Innovative · Integrative · Adaptive',
      description: 'Combines imagination with logic — balances creativity and precision for data-driven innovation.'
    };
  } else if (score >= 18) {
    return {
      score,
      style: 'Analytical Thinker',
      anchors: 'Logical · Systematic · Evidence-based',
      description: 'Uses structured reasoning to solve complex problems. Relies on data and methodical evaluation.'
    };
  } else if (score >= 12) {
    return {
      score,
      style: 'Creative Thinker',
      anchors: 'Imaginative · Curious · Visionary',
      description: 'Generates original ideas and enjoys open-ended thinking. Thrives in exploratory environments.'
    };
  } else {
    return {
      score,
      style: 'Developing Thinker',
      anchors: 'Emerging · Reflective · Learning',
      description: 'Strengthening ability to structure and validate thoughts. Building confidence in analytical processes.'
    };
  }
}

function getDecisionMakingStyle(score: number) {
  if (score >= 24) {
    return {
      score,
      style: 'Balanced Decision Maker',
      anchors: 'Composed · Insightful · Strategic',
      description: 'Blends data with intuition — effective under varied conditions. Adapts decision approach to context.'
    };
  } else if (score >= 18) {
    return {
      score,
      style: 'Reflective Decision Maker',
      anchors: 'Analytical · Methodical · Prudent',
      description: 'Relies on evidence, analysis, and deliberation. Takes time to evaluate all options thoroughly.'
    };
  } else if (score >= 12) {
    return {
      score,
      style: 'Intuitive Decision Maker',
      anchors: 'Decisive · Confident · Quick',
      description: 'Acts on gut instinct and rapid evaluation. Comfortable making decisions with incomplete information.'
    };
  } else {
    return {
      score,
      style: 'Developing Decision Maker',
      anchors: 'Hesitant · Observant · Emerging',
      description: 'Benefits from practice and mentorship for confidence. Building decisiveness through experience.'
    };
  }
}

function getMotivationStyle(score: number) {
  if (score >= 16) {
    return {
      score,
      style: 'Autonomous Professional',
      anchors: 'Self-Driven · Visionary · Independent',
      description: 'Thrives with freedom and innovation. Excels in entrepreneurial and self-directed environments.'
    };
  } else if (score >= 12) {
    return {
      score,
      style: 'Collaborative Professional',
      anchors: 'Cooperative · Engaged · Team-Focused',
      description: 'Works best in supportive, idea-sharing environments. Values teamwork and collective success.'
    };
  } else if (score >= 8) {
    return {
      score,
      style: 'Guided Professional',
      anchors: 'Learning · Responsive · Adaptable',
      description: 'Performs well with mentoring and structure. Appreciates clear expectations and feedback.'
    };
  } else {
    return {
      score,
      style: 'Dependent Professional',
      anchors: 'Cautious · Task-Oriented · Developing',
      description: 'Needs external direction and feedback to stay motivated. Benefits from close supervision.'
    };
  }
}

function generateSummary(learning: any, thinking: any, decision: any): string {
  const summaries: { [key: string]: string } = {
    // High performers
    'Hands-On Learner_Creative–Analytical Thinker_Balanced Decision Maker': 
      'You learn by experimenting, generate ideas grounded in both logic and creativity, and make well-balanced decisions under pressure. You excel in dynamic, innovative environments that value both creativity and execution.',
    
    'Analytical Learner_Creative–Analytical Thinker_Balanced Decision Maker':
      'You learn by observing and reflecting, generate ideas grounded in logic, and make well-balanced decisions under pressure. You excel in structured, innovative environments that value both creativity and discipline.',
    
    'Analytical Learner_Analytical Thinker_Reflective Decision Maker':
      'You learn through careful observation, think systematically, and make thoroughly considered decisions. You excel in research, planning, and strategy roles requiring precision and depth.',
    
    'Hands-On Learner_Creative Thinker_Intuitive Decision Maker':
      'You learn by doing, think creatively, and make quick intuitive decisions. You thrive in fast-paced, experimental environments that reward agility and innovation.',
    
    'Conceptual Planner_Creative–Analytical Thinker_Balanced Decision Maker':
      'You build strategic frameworks, balance creative and analytical thinking, and make contextually appropriate decisions. You excel in leadership and innovation strategy roles.',
  };
  
  const key = `${learning.style}_${thinking.style}_${decision.style}`;
  
  if (summaries[key]) {
    return summaries[key];
  }
  
  // Generate dynamic summary
  const learningDesc = learning.style === 'Hands-On Learner' ? 'learn by doing' :
                       learning.style === 'Analytical Learner' ? 'learn by observing and reflecting' :
                       learning.style === 'Conceptual Planner' ? 'learn by building frameworks' :
                       'benefit from structured guidance';
  
  const thinkingDesc = thinking.style.includes('Creative–Analytical') ? 'balance creativity with logic' :
                       thinking.style === 'Analytical Thinker' ? 'think systematically' :
                       thinking.style === 'Creative Thinker' ? 'think creatively' :
                       'are developing your thinking approach';
  
  const decisionDesc = decision.style === 'Balanced Decision Maker' ? 'make well-balanced decisions' :
                       decision.style === 'Reflective Decision Maker' ? 'make thoroughly considered decisions' :
                       decision.style === 'Intuitive Decision Maker' ? 'make quick intuitive decisions' :
                       'are building decision-making confidence';
  
  const environment = (thinking.style.includes('Creative') || learning.style === 'Hands-On Learner') ?
                      'innovative, dynamic environments' :
                      'structured, strategic environments';
  
  return `You ${learningDesc}, ${thinkingDesc}, and ${decisionDesc}. You excel in ${environment} that align with your cognitive strengths.`;
}

function calculateMatchScore(learningScore: number, thinkingScore: number, decisionScore: number): number {
  // Calculate individual component scores (normalized to 0-100)
  const learningPct = (learningScore / 30) * 100;
  const thinkingPct = (thinkingScore / 30) * 100;
  const decisionPct = (decisionScore / 30) * 100;
  
  // Average the three dimensions
  const baseScore = (learningPct + thinkingPct + decisionPct) / 3;
  
  // Bonus for balanced profile (all three dimensions relatively close)
  const avg = (learningScore + thinkingScore + decisionScore) / 3;
  const variance = [learningScore, thinkingScore, decisionScore]
    .reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / 3;
  const balanceBonus = Math.max(0, 10 - (variance / 2));
  
  // Final score (capped at 99 for professional humility)
  return Math.min(99, Math.round(baseScore + balanceBonus));
}

export function getProfessionalInsights(profile: ProfessionalCognitiveProfile): {
  strengths: string[];
  developmentAreas: string[];
  recommendations: string[];
  idealRoles: string[];
} {
  const strengths: string[] = [];
  const developmentAreas: string[] = [];
  const recommendations: string[] = [];
  const idealRoles: string[] = [];
  
  // Analyze strengths
  if (profile.learning.score >= 24) {
    strengths.push('Strong hands-on learning ability — adapts quickly through experimentation');
  }
  if (profile.thinking.score >= 24) {
    strengths.push('Rare balance of creative and analytical thinking — drives data-driven innovation');
  }
  if (profile.decisionMaking.score >= 24) {
    strengths.push('Adaptive decision-making — uses both intuition and analysis contextually');
  }
  
  // Identify development areas
  if (profile.learning.score < 18) {
    developmentAreas.push('Develop more active learning strategies through hands-on projects');
  }
  if (profile.thinking.score < 18) {
    developmentAreas.push('Strengthen analytical or creative thinking through targeted training');
  }
  if (profile.decisionMaking.score < 18) {
    developmentAreas.push('Build decision-making confidence through practice and mentorship');
  }
  
  // Generate recommendations
  if (profile.thinking.style.includes('Creative') && profile.decisionMaking.style === 'Intuitive Decision Maker') {
    recommendations.push('Pair with analytical team members for balanced decision-making');
    recommendations.push('Document your intuitive decisions to build pattern recognition');
  }
  
  if (profile.learning.style === 'Analytical Learner' && profile.thinking.style === 'Analytical Thinker') {
    recommendations.push('Balance analytical depth with rapid prototyping exercises');
    recommendations.push('Seek cross-functional projects to broaden your thinking');
  }
  
  if (profile.decisionMaking.style === 'Balanced Decision Maker') {
    recommendations.push('Leverage your adaptive decision-making in leadership roles');
    recommendations.push('Mentor others on contextual decision-making approaches');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Continue developing both technical and interpersonal competencies');
    recommendations.push('Seek feedback regularly to refine your professional approach');
    recommendations.push('Build expertise in areas that align with your cognitive strengths');
  }
  
  // Suggest ideal roles
  if (profile.thinking.style.includes('Creative–Analytical')) {
    idealRoles.push('Product Manager', 'Innovation Lead', 'Strategy Consultant', 'Marketing Director');
  } else if (profile.thinking.style === 'Analytical Thinker') {
    idealRoles.push('Data Analyst', 'Operations Manager', 'Financial Analyst', 'Research Lead');
  } else if (profile.thinking.style === 'Creative Thinker') {
    idealRoles.push('Creative Director', 'Brand Manager', 'UX Designer', 'Content Strategist');
  }
  
  if (profile.learning.style === 'Hands-On Learner') {
    idealRoles.push('Project Manager', 'Sales Lead', 'Entrepreneur');
  }
  
  if (profile.decisionMaking.style === 'Balanced Decision Maker') {
    idealRoles.push('Executive Leader', 'General Manager', 'Chief of Staff');
  }
  
  return {
    strengths,
    developmentAreas,
    recommendations,
    idealRoles: [...new Set(idealRoles)].slice(0, 6)
  };
}
