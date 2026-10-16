/**
 * Plain-language definitions used by the (i) info tags across dashboards.
 * One place for the wording so every screen explains a term the same way.
 */

const norm = (s: string) => s.trim().toLowerCase();

/** Learning, thinking and decision styles, and the dimensions behind them. */
export const STYLE_HELP: Record<string, string> = {
  // Kolb learning styles (Friendly terms + traditional academic references)
  'hands-on explorer': 'Hands-On Explorer (Accommodating): Learns best by doing, testing things out, movement, and practical real-world experience.',
  accommodating: 'Hands-On Explorer (Accommodating): Learns best by doing, jumping into action, trying things out, and learning through real-world experience.',
  
  'logical thinker': 'Logical Thinker (Assimilating): Learns best by understanding big ideas, theories, patterns, and clear logical explanations.',
  assimilating: 'Logical Thinker (Assimilating): Learns best by understanding big ideas, organized theories, and clear logical explanations.',
  
  'practical problem-solver': 'Practical Problem-Solver (Converging): Learns best by applying ideas to solve practical problems and find workable solutions.',
  converging: 'Practical Problem-Solver (Converging): Learns best by taking ideas and applying them to solve practical, real-world problems.',
  
  'creative brainstormer': 'Creative Brainstormer (Diverging): Learns best by watching, exploring multiple viewpoints, and generating creative ideas.',
  diverging: 'Creative Brainstormer (Diverging): Learns best by observing, exploring multiple viewpoints, and generating creative ideas.',

  // VARK-style labels
  visual: 'Visual: Learns best from pictures, diagrams, charts, and colors.',
  auditory: 'Auditory: Learns best by listening and talking things through.',
  kinesthetic: 'Kinesthetic: Learns best by doing, moving, and handling real objects.',
  'read/write': 'Reading/Writing: Learns best by reading, writing notes, and creating summaries.',
  'reading/writing': 'Reading/Writing: Learns best by reading, writing notes, and creating summaries.',

  // Kolb dimensions
  'concrete experience': 'Hands-On Experience: Learning from real, hands-on experiences, feelings, and direct action.',
  'reflective observation': 'Thoughtful Observation: Learning by watching, listening, and reflecting things over carefully.',
  'abstract conceptualization': 'Logical Concepts: Learning through big ideas, theories, and systematic logical analysis.',
  'active experimentation': 'Practical Action: Learning by testing ideas out, experimenting, and seeing what works.',
  ce: 'Hands-On Experience (CE): Learning from real, hands-on experiences and feeling.',
  ro: 'Thoughtful Observation (RO): Learning by watching, listening, and thinking things over.',
  ac: 'Logical Concepts (AC): Learning through structured ideas, theories, and logic.',
  ae: 'Practical Action (AE): Learning by trying things out and testing in practice.',

  // Thinking styles (Sternberg)
  'critical thinker': 'Critical Thinker (Analytical): Breaks problems into parts, weighs evidence, and evaluates logic step by step.',
  analytical: 'Critical Thinker (Analytical): Breaks problems into parts, weighs evidence, and evaluates logic step by step.',
  'innovative creator': 'Innovative Creator (Creative): Generates original ideas, envisions new possibilities, and creates novel solutions.',
  creative: 'Innovative Creator (Creative): Generates original ideas, envisions new possibilities, and creates novel solutions.',
  'real-world achiever': 'Real-World Achiever (Practical): Applies knowledge to daily life, focusing on common sense and what works.',
  practical: 'Real-World Achiever (Practical): Applies knowledge to daily life, focusing on common sense and what works.',
  holistic: 'Holistic: Looks at the big picture and how all the different parts connect.',
  social: 'Social: Thinks things through by collaborating with and learning from other people.',

  // Decision styles
  'instinctive decision-maker': 'Instinctive Decision-Maker (Intuitive): Decides quickly and confidently using pattern recognition and gut feeling.',
  intuitive: 'Instinctive Decision-Maker (Intuitive): Decides quickly and confidently using pattern recognition and gut feeling.',
  'deliberate decision-maker': 'Deliberate Decision-Maker (Reflective): Decides carefully, weighing evidence and options before choosing.',
  reflective: 'Deliberate Decision-Maker (Reflective): Decides carefully, weighing evidence and options before choosing.',
  deliberate: 'Deliberate Decision-Maker: Decides carefully, weighing evidence and options before choosing.',
  'adaptive decision-maker': 'Adaptive Decision-Maker (Balanced): Flexibly combines fast intuition and careful analysis depending on the situation.',
  balanced: 'Adaptive Decision-Maker (Balanced): Flexibly combines fast intuition and careful analysis depending on the situation.',
  spontaneous: 'Spontaneous: Acts in the moment and adapts flexibly as situations change.',
  'data-driven': 'Data-Driven: Prefers verified facts, numbers, and evidence before deciding.',
  collaborative: 'Collaborative: Prefers to discuss and decide together as a team.',
};

/** Student status labels shown on analytics dashboards. */
export const RISK_HELP: Record<string, string> = {
  high: 'At Risk: very low engagement, or inactive for a long time. A personal check-in is recommended.',
  medium: 'Needs Support: only some assessments completed, or activity is slowing down.',
  low: 'On Track: assessments completed recently and engagement is healthy.',
  none: 'Not Assessed: this student has not completed any assessment yet.',
  unassessed: 'Not Started: this student has not completed any assessment yet.',
};

export function getStyleHelp(name?: string): string | undefined {
  if (!name) return undefined;
  const key = norm(name.replace(/\s*\(you\)\s*$/i, ''));
  return STYLE_HELP[key];
}

export function getRiskHelp(level?: string): string | undefined {
  return level ? RISK_HELP[level] : undefined;
}
