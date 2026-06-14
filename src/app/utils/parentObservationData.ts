export interface ParentObservationQuestion {
  id: number;
  section: 'A' | 'B' | 'C' | 'D';
  text: string;
  dimension: string;
}

export interface ParentObservationScore {
  sectionA: {
    total: number;
    style: string;
    interpretation: string;
    insights: string;
    tags: string[];
  };
  sectionB: {
    total: number;
    style: string;
    interpretation: string;
    insights: string;
    tags: string[];
  };
  sectionC: {
    total: number;
    style: string;
    interpretation: string;
    insights: string;
    tags: string[];
  };
  sectionD: {
    total: number;
    style: string;
    interpretation: string;
    insights: string;
    tags: string[];
  };
  overallSummary: string;
  harmonyScore?: number; // When compared with child's self-assessment
}

export interface ParentObservationAssessment {
  id: string;
  parentId: string;
  childId: string;
  responses: number[];
  score: ParentObservationScore;
  completedAt: string;
}

// All 24 questions for Parent Observation Assessment
export const PARENT_OBSERVATION_QUESTIONS: ParentObservationQuestion[] = [
  // Section A: Learning Habits (6 questions)
  {
    id: 1,
    section: 'A',
    text: "My child learns best when he/she sees pictures or examples.",
    dimension: "Visual Learning"
  },
  {
    id: 2,
    section: 'A',
    text: "My child enjoys doing things with his/her hands to understand better.",
    dimension: "Kinesthetic Learning"
  },
  {
    id: 3,
    section: 'A',
    text: "My child remembers more when he/she talks about what has been learned.",
    dimension: "Auditory Learning"
  },
  {
    id: 4,
    section: 'A',
    text: "My child asks a lot of \"why\" questions when learning something new.",
    dimension: "Inquiry-Based Learning"
  },
  {
    id: 5,
    section: 'A',
    text: "My child prefers learning by watching or observing others first.",
    dimension: "Observational Learning"
  },
  {
    id: 6,
    section: 'A',
    text: "When confused, my child tries different ways until understanding is clear.",
    dimension: "Experimental Learning"
  },
  
  // Section B: Thinking Patterns (6 questions)
  {
    id: 7,
    section: 'B',
    text: "My child enjoys solving puzzles or figuring things out.",
    dimension: "Problem-Solving"
  },
  {
    id: 8,
    section: 'B',
    text: "He/she often comes up with new or unusual ideas.",
    dimension: "Creativity"
  },
  {
    id: 9,
    section: 'B',
    text: "He/she likes to plan ahead before starting something.",
    dimension: "Planning"
  },
  {
    id: 10,
    section: 'B',
    text: "He/she can explain why a particular choice or action was made.",
    dimension: "Reasoning"
  },
  {
    id: 11,
    section: 'B',
    text: "My child likes to keep things neat and organized.",
    dimension: "Organization"
  },
  {
    id: 12,
    section: 'B',
    text: "He/she thinks about how others feel before making choices.",
    dimension: "Empathy"
  },
  
  // Section C: Decision-Making Behavior (6 questions)
  {
    id: 13,
    section: 'C',
    text: "My child takes time to weigh options before deciding.",
    dimension: "Deliberation"
  },
  {
    id: 14,
    section: 'C',
    text: "He/she asks for advice before making important choices.",
    dimension: "Consultation"
  },
  {
    id: 15,
    section: 'C',
    text: "My child is confident in his/her decisions, even when others disagree.",
    dimension: "Confidence"
  },
  {
    id: 16,
    section: 'C',
    text: "He/she sometimes acts based on feelings rather than logic.",
    dimension: "Emotional Decision-Making"
  },
  {
    id: 17,
    section: 'C',
    text: "He/she prefers when rules and steps are clearly explained before deciding.",
    dimension: "Structured Decision-Making"
  },
  {
    id: 18,
    section: 'C',
    text: "My child learns from mistakes and makes better choices next time.",
    dimension: "Adaptive Learning"
  },
  
  // Section D: Motivation & Self-Management (6 questions)
  {
    id: 19,
    section: 'D',
    text: "My child enjoys creative or hands-on activities.",
    dimension: "Creative Engagement"
  },
  {
    id: 20,
    section: 'D',
    text: "My child tries new things when encouraged or praised.",
    dimension: "External Motivation"
  },
  {
    id: 21,
    section: 'D',
    text: "My child gets frustrated easily when something feels difficult.",
    dimension: "Frustration Tolerance"
  },
  {
    id: 22,
    section: 'D',
    text: "My child keeps trying even when a task is challenging.",
    dimension: "Perseverance"
  },
  {
    id: 23,
    section: 'D',
    text: "My child enjoys learning independently without much help.",
    dimension: "Independence"
  },
  {
    id: 24,
    section: 'D',
    text: "My child feels more confident when appreciated for effort.",
    dimension: "Recognition Response"
  }
];

// Scoring logic for each section
export function calculateParentObservationScore(responses: number[]): ParentObservationScore {
  // Section A: Questions 1-6 (Learning Habits)
  const sectionATotal = responses.slice(0, 6).reduce((sum, val) => sum + val, 0);
  const sectionAResult = interpretSectionA(sectionATotal);
  
  // Section B: Questions 7-12 (Thinking Patterns)
  const sectionBTotal = responses.slice(6, 12).reduce((sum, val) => sum + val, 0);
  const sectionBResult = interpretSectionB(sectionBTotal);
  
  // Section C: Questions 13-18 (Decision-Making Behavior)
  const sectionCTotal = responses.slice(12, 18).reduce((sum, val) => sum + val, 0);
  const sectionCResult = interpretSectionC(sectionCTotal);
  
  // Section D: Questions 19-24 (Motivation & Self-Management)
  const sectionDTotal = responses.slice(18, 24).reduce((sum, val) => sum + val, 0);
  const sectionDResult = interpretSectionD(sectionDTotal);
  
  const overallSummary = generateOverallSummary(
    sectionAResult.style,
    sectionBResult.style,
    sectionCResult.style,
    sectionDResult.style
  );
  
  return {
    sectionA: {
      total: sectionATotal,
      ...sectionAResult
    },
    sectionB: {
      total: sectionBTotal,
      ...sectionBResult
    },
    sectionC: {
      total: sectionCTotal,
      ...sectionCResult
    },
    sectionD: {
      total: sectionDTotal,
      ...sectionDResult
    },
    overallSummary
  };
}

function interpretSectionA(total: number) {
  if (total >= 24) {
    return {
      style: "Hands-on Visual Learner",
      interpretation: "Very high active + visual learning",
      insights: "Learns best through examples, demonstrations, and doing activities.",
      tags: ["Visual-Experiential", "Active-Hands-on", "Concrete"]
    };
  } else if (total >= 18) {
    return {
      style: "Practical Learner",
      interpretation: "Moderate experiential learning",
      insights: "Learns well by combining observation and action.",
      tags: ["Practical", "Balanced", "Experiential"]
    };
  } else if (total >= 12) {
    return {
      style: "Reflective Learner",
      interpretation: "Average reflection-based learning",
      insights: "Prefers time to think before acting or experimenting.",
      tags: ["Reflective", "Conceptual", "Thoughtful"]
    };
  } else {
    return {
      style: "Passive Learner",
      interpretation: "Low engagement learning",
      insights: "May need more support or variety in learning approach.",
      tags: ["Developing", "Needs Support", "Emerging"]
    };
  }
}

function interpretSectionB(total: number) {
  if (total >= 24) {
    return {
      style: "Creative-Analytical Thinker",
      interpretation: "High creative and analytical balance",
      insights: "Enjoys solving problems using both imagination and logic.",
      tags: ["Creative", "Analytical", "Balanced", "Problem-Solver"]
    };
  } else if (total >= 18) {
    return {
      style: "Analytical Thinker",
      interpretation: "Structured, logical thinker",
      insights: "Prefers reasoning and clarity before acting.",
      tags: ["Analytical", "Logical", "Structured", "Systematic"]
    };
  } else if (total >= 12) {
    return {
      style: "Creative Thinker",
      interpretation: "Conceptual or intuitive thinker",
      insights: "Generates new ideas, enjoys exploring possibilities.",
      tags: ["Creative", "Imaginative", "Intuitive", "Exploratory"]
    };
  } else {
    return {
      style: "Emerging Thinker",
      interpretation: "Limited structured thinking",
      insights: "Still developing consistent reasoning or planning habits.",
      tags: ["Developing", "Emerging", "Building Skills"]
    };
  }
}

function interpretSectionC(total: number) {
  if (total >= 24) {
    return {
      style: "Reflective Decision Maker",
      interpretation: "Balanced logical and reflective decision-making",
      insights: "Considers both logic and empathy before deciding.",
      tags: ["Reflective", "Balanced", "Thoughtful", "Empathetic"]
    };
  } else if (total >= 18) {
    return {
      style: "Strategic Decision Maker",
      interpretation: "Confident and structured decision-making",
      insights: "Weighs options carefully; prefers order and clarity.",
      tags: ["Strategic", "Confident", "Structured", "Methodical"]
    };
  } else if (total >= 12) {
    return {
      style: "Intuitive Decision Maker",
      interpretation: "Spontaneous, intuitive decision-making",
      insights: "Acts quickly based on feelings and experiences.",
      tags: ["Intuitive", "Spontaneous", "Emotional", "Quick"]
    };
  } else {
    return {
      style: "Developing Decision Maker",
      interpretation: "Hesitant or indecisive decision-making",
      insights: "Needs confidence and guidance when choosing.",
      tags: ["Developing", "Cautious", "Needs Guidance"]
    };
  }
}

function interpretSectionD(total: number) {
  if (total >= 24) {
    return {
      style: "Self-Driven Learner",
      interpretation: "High self-motivation and perseverance",
      insights: "Works independently, keeps trying, motivated by recognition.",
      tags: ["Self-Motivated", "Independent", "Perseverant", "Resilient"]
    };
  } else if (total >= 18) {
    return {
      style: "Encouraged Learner",
      interpretation: "Moderately motivated and responsive",
      insights: "Performs best when guided or praised.",
      tags: ["Encouraged", "Responsive", "Guided", "Positive"]
    };
  } else if (total >= 12) {
    return {
      style: "Dependent Learner",
      interpretation: "Needs external motivation",
      insights: "Often seeks direction, may give up easily.",
      tags: ["Dependent", "Needs Support", "Externally Motivated"]
    };
  } else {
    return {
      style: "Reluctant Learner",
      interpretation: "Low motivation or interest",
      insights: "Needs encouragement, structure, and emotional support.",
      tags: ["Reluctant", "Needs Encouragement", "Building Confidence"]
    };
  }
}

function generateOverallSummary(
  learningStyle: string,
  thinkingStyle: string,
  decisionStyle: string,
  motivationStyle: string
): string {
  return `Your child demonstrates characteristics of a ${learningStyle}, shows ${thinkingStyle.toLowerCase()} tendencies, approaches decisions as a ${decisionStyle.toLowerCase()}, and is best described as a ${motivationStyle.toLowerCase()}.`;
}

// Compare child's self-assessment with parent's observation
export function calculateHarmonyScore(
  childScore: { kolb?: any; sternberg?: any; dualProcess?: any },
  parentScore: ParentObservationScore
): number {
  const alignments: number[] = [];
  
  // Compare learning styles (Section A with Kolb)
  if (childScore.kolb) {
    const diff = Math.abs(calculateLearningStyleDiff(childScore.kolb.style, parentScore.sectionA.style));
    alignments.push(diff <= 2 ? 100 : diff <= 5 ? 70 : 40);
  }
  
  // Compare thinking styles (Section B with Sternberg)
  if (childScore.sternberg) {
    const diff = Math.abs(calculateThinkingStyleDiff(childScore.sternberg.style, parentScore.sectionB.style));
    alignments.push(diff <= 2 ? 100 : diff <= 5 ? 70 : 40);
  }
  
  // Compare decision styles (Section C with Dual Process)
  if (childScore.dualProcess) {
    const diff = Math.abs(calculateDecisionStyleDiff(childScore.dualProcess.style, parentScore.sectionC.style));
    alignments.push(diff <= 2 ? 100 : diff <= 5 ? 70 : 40);
  }
  
  // If we have alignments, return average
  if (alignments.length > 0) {
    return Math.round(alignments.reduce((sum, val) => sum + val, 0) / alignments.length);
  }
  
  return 0;
}

// Helper functions to calculate differences between styles
function calculateLearningStyleDiff(childStyle: string, parentStyle: string): number {
  // Simplified comparison - can be enhanced with more sophisticated mapping
  const styleMap: { [key: string]: number } = {
    'Diverging': 4,
    'Hands-on Visual Learner': 4,
    'Assimilating': 2,
    'Reflective Learner': 2,
    'Converging': 3,
    'Practical Learner': 3,
    'Accommodating': 4,
    'Passive Learner': 1
  };
  
  return Math.abs((styleMap[childStyle] || 0) - (styleMap[parentStyle] || 0));
}

function calculateThinkingStyleDiff(childStyle: string, parentStyle: string): number {
  const styleMap: { [key: string]: number } = {
    'Analytical': 2,
    'Analytical Thinker': 2,
    'Creative': 4,
    'Creative Thinker': 4,
    'Creative-Analytical Thinker': 3,
    'Practical': 3,
    'Emerging Thinker': 1
  };
  
  return Math.abs((styleMap[childStyle] || 0) - (styleMap[parentStyle] || 0));
}

function calculateDecisionStyleDiff(childStyle: string, parentStyle: string): number {
  const styleMap: { [key: string]: number } = {
    'Intuitive': 4,
    'Intuitive Decision Maker': 4,
    'Reflective': 2,
    'Reflective Decision Maker': 2,
    'Strategic Decision Maker': 2,
    'Balanced': 3,
    'Developing Decision Maker': 1
  };
  
  return Math.abs((styleMap[childStyle] || 0) - (styleMap[parentStyle] || 0));
}

export function getAlignmentLabel(harmonyScore: number): {
  label: string;
  emoji: string;
  color: string;
  description: string;
} {
  if (harmonyScore >= 80) {
    return {
      label: "High Alignment",
      emoji: "✅",
      color: "text-green-600",
      description: "You and your child share very similar views on their cognitive profile."
    };
  } else if (harmonyScore >= 60) {
    return {
      label: "Moderate Alignment",
      emoji: "⚖️",
      color: "text-yellow-600",
      description: "There are some differences in perspective that are worth discussing."
    };
  } else {
    return {
      label: "Low Alignment",
      emoji: "🔺",
      color: "text-red-600",
      description: "Significant differences in perception present an opportunity for deeper conversation."
    };
  }
}
