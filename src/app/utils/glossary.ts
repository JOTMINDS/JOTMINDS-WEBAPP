/**
 * Plain-language definitions used by the (i) info tags across dashboards.
 * One place for the wording so every screen explains a term the same way.
 */

const norm = (s: string) => s.trim().toLowerCase();

/** Learning, thinking and decision styles, and the dimensions behind them. */
export const STYLE_HELP: Record<string, string> = {
  // Kolb learning styles
  diverging: 'Learns by watching and imagining. Likes brainstorming, group discussion and looking at a situation from many angles.',
  assimilating: 'Learns by understanding ideas and theories. Likes clear explanations, reading, models and logical order.',
  converging: 'Learns by solving practical problems. Likes to test ideas, work on technical tasks and find the one best answer.',
  accommodating: 'Learns by doing. Likes hands-on tasks, trying things out and learning from experience.',
  // VARK-style labels
  visual: 'Learns best from pictures, diagrams, charts and colour.',
  auditory: 'Learns best by listening and talking things through.',
  kinesthetic: 'Learns best by doing, moving and handling real objects.',
  'read/write': 'Learns best by reading and writing notes and summaries.',
  'reading/writing': 'Learns best by reading and writing notes and summaries.',
  // Kolb dimensions
  'concrete experience': 'How much the learner prefers to learn from real, hands-on experiences and feelings.',
  'reflective observation': 'How much the learner prefers to watch, think about and review what happened.',
  'abstract conceptualization': 'How much the learner prefers ideas, theories and logical reasoning.',
  'active experimentation': 'How much the learner prefers to try things out and apply ideas in practice.',
  ce: 'Concrete Experience: learning from real, hands-on experiences.',
  ro: 'Reflective Observation: learning by watching and thinking things over.',
  ac: 'Abstract Conceptualization: learning through ideas, theories and logic.',
  ae: 'Active Experimentation: learning by trying things out.',
  // Thinking styles (Sternberg)
  analytical: 'Breaks problems into parts, weighs evidence and reasons step by step.',
  creative: 'Comes up with new ideas and original ways to solve problems.',
  practical: 'Applies ideas to real situations and focuses on what works.',
  holistic: 'Looks at the big picture and how the parts connect.',
  social: 'Thinks things through by working with and learning from other people.',
  // Decision styles
  intuitive: 'Decides quickly using gut feeling and past experience.',
  reflective: 'Decides slowly and carefully, weighing options before choosing.',
  balanced: 'Uses both quick instinct and careful thought, depending on the situation.',
  spontaneous: 'Acts on the moment and adapts as things change.',
  'data-driven': 'Prefers facts, numbers and evidence before deciding.',
  collaborative: 'Prefers to talk it over and decide together with others.',
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
