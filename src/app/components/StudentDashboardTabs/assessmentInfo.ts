import { Assessment } from '../../types';
import { getFriendlyStyleName, getFriendlyDimensionName } from '../../utils/styleWording';

export const THINKING_TYPES: string[] = ['sternberg', 'jhs-thinking', 'shs-thinking', 'child-thinking', 'adult-thinking'];

const LABELS: Record<string, string> = {
  kolb: 'Learning Style',
  sternberg: 'Thinking Style',
  'dual-process': 'Decision Style',
  'jhs-thinking': 'JHS Thinking Styles',
  'shs-thinking': 'SHS Thinking Styles',
  'adult-thinking': 'Professional Thinking Styles',
  'child-thinking': 'Thinking Adventure',
};

export const assessmentLabel = (type: string) => LABELS[type] || type;

export const byNewest = (a: Assessment, b: Assessment) =>
  new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime();

export const latestOfType = (assessments: Assessment[], ...types: string[]) =>
  assessments.filter(a => types.includes(a.type)).sort(byNewest)[0];

/** The framework's own block inside `score` (the key for child results varies). */
const ownScore = (a: Assessment): any => {
  const s: any = a.score || {};
  return s[a.type] || s['children-thinking'] || s.dualProcess || {};
};

/** Style name for a record, in student-friendly wording. Empty when the record has none. */
export function assessmentStyleName(a: Assessment): string {
  const s: any = a.score || {};
  const raw: string =
    s.kolb?.style || s.sternberg?.style || s.dualProcess?.style ||
    ownScore(a).personalityType || ownScore(a).dominantStyle || ownScore(a).style || '';
  if (!raw || raw === 'Unknown') return '';
  return ['kolb', 'sternberg', 'dual-process'].includes(a.type) ? getFriendlyStyleName(raw) : raw;
}

export interface ScorePart {
  key: string;
  label: string;
  value: number;
  pct: number;
}

const PREFERRED_ORDER = ['analytical', 'creative', 'practical', 'reflective'];

const capitalise = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/**
 * The parts of a record's result as a share of its total, so frameworks that score on
 * different scales read the same way ("how your answers split").
 */
export function assessmentParts(a: Assessment): ScorePart[] {
  const s: any = a.score || {};
  let raw: Record<string, any> | undefined;

  if (a.type === 'kolb') {
    const sc = s.kolb?.scores;
    raw = sc && { CE: sc.CE, RO: sc.RO, AC: sc.AC, AE: sc.AE };
  } else if (a.type === 'dual-process') {
    const sc = s.dualProcess?.scores;
    raw = sc && { Intuitive: sc.system1 ?? sc.Intuitive, Deliberate: sc.system2 ?? sc.Reflective };
  } else if (a.type === 'sternberg') {
    raw = s.sternberg?.scores;
  } else {
    raw = ownScore(a).scores;
  }
  if (!raw || typeof raw !== 'object') return [];

  const entries = Object.entries(raw)
    .map(([key, value]) => [key, Number(value)] as [string, number])
    .filter(([, value]) => Number.isFinite(value) && value >= 0);
  if (entries.length === 0) return [];

  entries.sort((x, y) => {
    const ix = PREFERRED_ORDER.indexOf(x[0].toLowerCase());
    const iy = PREFERRED_ORDER.indexOf(y[0].toLowerCase());
    return (ix === -1 ? 99 : ix) - (iy === -1 ? 99 : iy);
  });

  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  if (total <= 0) return [];

  return entries.map(([key, value]) => ({
    key,
    label: a.type === 'kolb' ? getFriendlyDimensionName(key) : capitalise(key),
    value,
    pct: Math.round((value / total) * 100),
  }));
}

export interface ProfileDimension {
  key: string;
  label: string;
  hint: string;
}

/** The six scores behind the cognitive profile radar. */
export const CORE_DIMENSIONS: ProfileDimension[] = [
  { key: 'learningAgility', label: 'Learning agility', hint: 'How fast you pick up new things' },
  { key: 'analyticalDepth', label: 'Analytical depth', hint: 'Breaking problems into parts' },
  { key: 'creativeCapacity', label: 'Creative capacity', hint: 'Coming up with fresh ideas' },
  { key: 'practicalExecution', label: 'Practical execution', hint: 'Turning plans into action' },
  { key: 'intuitiveSpeed', label: 'Intuitive speed', hint: 'Making quick gut calls' },
  { key: 'reflectiveDepth', label: 'Reflective depth', hint: 'Thinking things through' },
];

/** The four bigger-picture scores built from the six above. */
export const EXTRA_DIMENSIONS: ProfileDimension[] = [
  { key: 'cognitiveFlexibility', label: 'Flexibility', hint: 'Switching approach when needed' },
  { key: 'innovationPotential', label: 'Innovation', hint: 'Creating new solutions' },
  { key: 'executionCapability', label: 'Execution', hint: 'Getting results' },
  { key: 'metacognitiveAwareness', label: 'Self-awareness', hint: 'Knowing how you think' },
];

/** Plain words for a 0-100 score, so numbers are never the only signal. */
export function scoreBand(value: number): string {
  if (value >= 80) return 'Very strong';
  if (value >= 65) return 'Strong';
  if (value >= 50) return 'Growing';
  return 'Building';
}
