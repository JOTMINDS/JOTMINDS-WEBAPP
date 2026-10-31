/**
 * Plain-words content for Skill Builder, and the link between a student's
 * Cognitive Profile scores and the four skills a plan can grow.
 *
 * The profile-to-skill mapping mirrors `mapGapsToSkillBuilder` in
 * supabase/functions/server/career-match-routes.tsx so both sides agree.
 */
import type { CognitiveProfile } from '../utils/cognitiveProfileApi';
import { GAME_META } from './dailyQuestData';
import type { GameId } from './dailyQuestData';

export type DimensionId = 'metacognition' | 'problem_solving' | 'curiosity' | 'emotional_regulation';

type ProfileKey =
  | 'learningAgility'
  | 'analyticalDepth'
  | 'creativeCapacity'
  | 'practicalExecution'
  | 'intuitiveSpeed'
  | 'reflectiveDepth'
  | 'cognitiveFlexibility'
  | 'innovationPotential'
  | 'executionCapability'
  | 'metacognitiveAwareness';

export interface DimensionInfo {
  id: DimensionId;
  label: string;
  emoji: string;
  color: string;
  /** What the skill is, in plain words. */
  plain: string;
  /** Where it helps in school life. */
  helps: string;
  /** Profile scores this skill is based on. */
  profileParts: { key: ProfileKey; label: string }[];
}

export const DIMENSIONS: DimensionInfo[] = [
  {
    id: 'metacognition',
    label: 'Metacognition',
    emoji: '🧠',
    color: '#6B4C9A',
    plain: 'Thinking about your own thinking: noticing how you learn, checking your work and fixing mistakes.',
    helps: 'Helps you study smarter, not longer.',
    profileParts: [
      { key: 'metacognitiveAwareness', label: 'Self-awareness as a learner' },
      { key: 'reflectiveDepth', label: 'Reflective depth' },
      { key: 'cognitiveFlexibility', label: 'Flexibility' },
      { key: 'learningAgility', label: 'Learning agility' },
    ],
  },
  {
    id: 'problem_solving',
    label: 'Problem Solving',
    emoji: '🧩',
    color: '#5B7DB1',
    plain: 'Breaking a big problem into small steps and trying more than one way to solve it.',
    helps: 'Helps in maths, science and group projects.',
    profileParts: [
      { key: 'analyticalDepth', label: 'Analytical depth' },
      { key: 'practicalExecution', label: 'Practical execution' },
      { key: 'executionCapability', label: 'Getting things done' },
    ],
  },
  {
    id: 'curiosity',
    label: 'Curiosity',
    emoji: '🔍',
    color: '#1E8A6E',
    plain: 'Asking questions and wanting to find out more, even about ordinary things.',
    helps: 'Helps you learn faster and come up with new ideas.',
    profileParts: [
      { key: 'creativeCapacity', label: 'Creative thinking' },
      { key: 'innovationPotential', label: 'Innovation' },
    ],
  },
  {
    id: 'emotional_regulation',
    label: 'Emotional Regulation',
    emoji: '🌊',
    color: '#C2410C',
    plain: 'Staying calm and in control when things feel hard or rushed.',
    helps: 'Helps with exam nerves, group work and tough days.',
    profileParts: [{ key: 'intuitiveSpeed', label: 'Intuitive speed' }],
  },
];

export function getDimension(id: string): DimensionInfo {
  return (
    DIMENSIONS.find((d) => d.id === id) ?? {
      id: id as DimensionId,
      label: id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      emoji: '🎯',
      color: '#6B4C9A',
      plain: 'A thinking skill you can grow with a little practice each day.',
      helps: '',
      profileParts: [],
    }
  );
}

export interface DimensionScore {
  id: DimensionId;
  /** Average of the matching profile scores, 0 to 100. */
  score: number;
  parts: { label: string; value: number }[];
}

/** Scores for the four skills, lowest first. Empty when there is no profile yet. */
export function scoreDimensions(profile: CognitiveProfile | null): DimensionScore[] {
  if (!profile) return [];
  const out: DimensionScore[] = [];
  for (const d of DIMENSIONS) {
    const parts = d.profileParts
      .map((p) => ({ label: p.label, value: Number(profile[p.key]) }))
      .filter((p) => Number.isFinite(p.value));
    if (parts.length === 0) continue;
    const score = Math.round(parts.reduce((sum, p) => sum + p.value, 0) / parts.length);
    out.push({ id: d.id, score, parts: parts.map((p) => ({ ...p, value: Math.round(p.value) })) });
  }
  return out.sort((a, b) => a.score - b.score);
}

export function tierForAge(age?: number): 'jhs' | 'shs' | 'adult' {
  if (!age) return 'shs';
  if (age <= 14) return 'jhs';
  if (age <= 18) return 'shs';
  return 'adult';
}

// ---- Daily activity text (ids come from the server's plan) --------------

const PROMPT_TEXT: Record<string, string> = {
  'prompt:metacognition:0': 'What did you learn today that surprised you?',
  'prompt:metacognition:1': 'Describe a moment when you changed your mind.',
  'prompt:metacognition:2': 'How did you check that your answer was right?',
  'prompt:problem_solving:0': 'What is the hardest problem you faced today?',
  'prompt:problem_solving:1': 'List three different ways to solve the same problem.',
  'prompt:curiosity:0': 'What is one question you cannot stop thinking about?',
  'prompt:curiosity:1': 'Pick something ordinary and write 5 things you do not know about it.',
  'prompt:emotional_regulation:0': 'Name the feeling you had most today and what set it off.',
  'prompt:emotional_regulation:1': 'Describe a moment you stayed calm when it was hard.',
};

const CHALLENGE_TEXT: Record<string, string> = {
  'challenge:metacognition:0': 'Solve one problem out loud and say each step as you go.',
  'challenge:metacognition:1': 'Explain something you learned to a younger person.',
  'challenge:metacognition:2': 'Pick one mistake from this week and write down what it taught you.',
  'challenge:problem_solving:0': 'Take one daily task and find a faster way to do it.',
  'challenge:problem_solving:1': 'Plan a project in 5 steps before you start.',
  'challenge:curiosity:0': 'Learn one new word and use it in a conversation.',
  'challenge:curiosity:1': 'Ask three people: "What changed your mind recently?"',
  'challenge:emotional_regulation:0': 'When you feel rushed, take 3 slow breaths before you act.',
  'challenge:emotional_regulation:1': 'Write a kind message to someone, or to yourself.',
};

export const promptText = (id: string) => PROMPT_TEXT[id] ?? 'What is one thing you noticed about your thinking today?';
export const challengeText = (id: string) => CHALLENGE_TEXT[id] ?? 'Use today\'s skill once, in real life.';

const GAME_IDS: GameId[] = ['memory-match', 'n-back', 'stroop', 'pattern', 'quickfire', 'riddle'];

/** The playable game for a plan's gameId, or null if we do not have one. */
export function playableGame(gameId: string): GameId | null {
  return (GAME_IDS as string[]).includes(gameId) ? (gameId as GameId) : null;
}

export function gameTitle(gameId: string): string {
  const g = playableGame(gameId);
  return g ? GAME_META[g].title : gameId;
}

export function gameSkill(gameId: string): string {
  const g = playableGame(gameId);
  return g ? GAME_META[g].skill : 'Brain warm-up';
}
